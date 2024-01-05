require('dotenv').config();
const express =  require('express');
const bodyparser = require('body-parser');
const { Sequelize } = require('sequelize');
const sequelize = require('./util/db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');

const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/user-group');

//-----------------------------------------------------------------------------------------
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'), 
    {flags: 'a'});

const app = express();
// app.use(helmet()); 
// app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));

app.use(cors({
    origin: "http://127.0.0.1:5500"
}));
app.use(bodyparser.json({extended: false}));
app.use('/public', express.static(path.join(__dirname, 'public')));

//------------------------------------------------------------------------------------------
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);

app.use((req,res) => {
    res.sendFile(path.join(__dirname, `/views/${req.url}`));
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


//-----------------------------------------------------------------------------------------
const serverSync = async()=>{
    try{
        await sequelize.sync({force: true});
        // await sequelize.sync()
        app.listen(process.env.APP_PORT || 4000);
        console.log(`server running on PORT: ${process.env.APP_PORT}`);

    }   
    catch(err){
        console.error(err);
    }
}

serverSync();

