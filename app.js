require('dotenv').config();
const express =  require('express');
const bodyparser = require('body-parser');
const { Sequelize } = require('sequelize');
const sequelize = require('./util/db');
const cors = require('cors');

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');

const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/user-group');

//-----------------------------------------------------------------------------------------
const app = express();

app.use(cors({
    origin: "http://127.0.0.1:5500"
}));
app.use(bodyparser.json());

//------------------------------------------------------------------------------------------
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);


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
        // await sequelize.sync({force: true});
        await sequelize.sync()
        app.listen(process.env.APP_PORT || 3000);
        console.log(`server running on PORT: ${process.env.APP_PORT}`);

    }   
    catch(err){
        console.error(err);
    }
}

serverSync();

