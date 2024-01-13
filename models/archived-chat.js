const { Sequelize } = require('sequelize');
const sequelize = require('../util/db');

module.exports = sequelize.define('archived_chat',{
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true        
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isFile: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    userId:{
        type: Sequelize.INTEGER,
    },
    groupId:{
        type: Sequelize.INTEGER,
    },
},{ timestamps: false });
