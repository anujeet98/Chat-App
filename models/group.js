const { Sequelize } = require("sequelize");
const sequelize = require('../util/db');


module.exports = sequelize.define('group', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    groupName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    groupDescription: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdBy: {
        type: Sequelize.STRING,
        allowNull: false
    }
});