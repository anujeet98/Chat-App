require('dotenv').config();
const express =  require('express');
const bodyparser = require('body-parser');
const sequelize = require('./util/db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const http = require('http');
const socket = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');
const passwordRoutes = require('./routes/password');

const socketService = require('./services/socket');
const cronService = require('./services/archive-cron');
cronService.start();

const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/user-group');
const ForgetPassword = require('./models/forget-password');

//-----------------------------------------------------------------------------------------
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'), 
    {flags: 'a'});

const app = express();
const server = http.createServer(app);
// app.use(helmet()); 
// app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));
app.use(cors({
    origin: JSON.parse(`${process.env.ACCEPTED_ORIGINS}`)
}));
app.use(bodyparser.json({extended: false}));
app.use('/public', express.static(path.join(__dirname, 'public')));

//------------------------------------------------------------------------------------------
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);
app.use('/password', passwordRoutes);

app.use((req,res) => {
    console.log(__dirname, req.url);
    const fileExists = fs.existsSync(path.join(__dirname, `/views/${req.url}`));
    if(req.url === '/'){
        req.url = 'sign-in.html';
        return res.sendFile(path.join(__dirname, `/views/${req.url}`));
    }
    else if(fileExists)
        return res.sendFile(path.join(__dirname, `/views/${req.url}`));
    else
        return res.sendFile(path.join(__dirname, `/views/error404.html`));
})


//------------------------------------------------------------------------------------------
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
// ----------------------------------------------------------------------------------------
const io = socket(server,{
    cors: {
        origin: JSON.parse(`${process.env.ACCEPTED_ORIGINS}`)
    }
});
io.on("connection", socket => socketService(io,socket));
instrument(io, { auth: false });

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

