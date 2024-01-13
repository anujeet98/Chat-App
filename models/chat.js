const { Sequelize } = require('sequelize');
const sequelize = require('../util/db');

module.exports = sequelize.define('chat',{
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
},{ timestamps: false });