const { Sequelize } = require('sequelize');
const sequelize = require('../util/db');

module.exports = sequelize.define('chat',{
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    message:{
        type: Sequelize.STRING,
        allowNull: false
    },
    isFile:{
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
});