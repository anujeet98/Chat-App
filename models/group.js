const { Sequelize } = require("sequelize");
const sequelize = require('../util/db');


module.exports = sequelize.define('group', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdBy: {
        type: Sequelize.STRING,
        allowNull: false
    }
});