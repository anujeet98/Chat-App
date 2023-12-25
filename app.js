require('dotenv').config();
const express =  require('express');
const bodyparser = require('body-parser');
const { Sequelize } = require('sequelize');
const sequelize = require('./util/db');
const cors = require('cors');

const userRoutes = require('./routes/user');

//-----------------------------------------------------------------------------------------
const app = express();

app.use(cors({
    origin: "http://127.0.0.1:5500"
}));
app.use(bodyparser.json());

//------------------------------------------------------------------------------------------
app.use('/user', userRoutes);


//------------------------------------------------------------------------------------------
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

