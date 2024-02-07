require('dotenv').config();
const express =  require('express');
const sequelize = require('./util/db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const http = require('http');
const socket = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

const socketService = require('./services/socket');
const cronService = require('./services/archive-cron');
cronService.start();

const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const passwordRoutes = require('./routes/password');

const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/user-group');
const ForgetPassword = require('./models/forget-password');

const sentryConfig = require('./configuration/sentry');

//-----------------------------------------------------------------------------------------
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'), 
    {flags: 'a'});

const app = express();
const server = http.createServer(app);

const Sentry = sentryConfig(server);
app.use(Sentry.Handlers.requestHandler());  //sentry logging


// app.use(helmet()); 
// app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));
app.use(cors({
    origin: JSON.parse(`${process.env.ACCEPTED_ORIGINS}`)
}));
app.use(express.json({extended: false}));
app.use('/public', express.static(path.join(__dirname, 'public')));

//------------------------------------ROUTES----------------------------------------------
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/password', passwordRoutes);
  
app.use((req,res) => {
    // console.log(__dirname, req.url);
    const fileExists = fs.existsSync(path.join(__dirname, `/views/${req.url}`));
    if(req.url === '/'){
        req.url = 'home.html';
        return res.sendFile(path.join(__dirname, `/views/${req.url}`));
    }
    else if(fileExists)
        return res.sendFile(path.join(__dirname, `/views/${req.url}`));
    else
        return res.sendFile(path.join(__dirname, `/views/error404.html`));
});
// -----------------------------------SENTRY----------------------------------------------------

app.use(Sentry.Handlers.errorHandler());    //sentry error handler

//------------------------------------SOCKET------------------------------------------------------
const io = socket(server,{
    cors: {
        origin: JSON.parse(`${process.env.ACCEPTED_ORIGINS}`)
    }
});
io.on("connection", socket => socketService(io,socket));
instrument(io, { auth: false });

// -----------------------------------MODEL ASSOSCIATIONS-----------------------------------------------------

User.hasMany(Chat);
Chat.belongsTo(User);

Group.hasMany(Chat);
Chat.belongsTo(Group);

User.belongsToMany(Group, {through: UserGroup});
Group.belongsToMany(User, {through: UserGroup});

UserGroup.belongsTo(User);
UserGroup.belongsTo(Group);

User.hasMany(ForgetPassword);
ForgetPassword.belongsTo(User);

//-----------------------------------------------------------------------------------------
const serverSync = async()=>{
    try{
        // await sequelize.sync({force: true});
        await sequelize.sync()
        server.listen(process.env.APP_PORT || 4000);
        console.log(`server running on PORT: ${process.env.APP_PORT}`);
    }   
    catch(err){
        console.error(err);
    }
}
serverSync();

