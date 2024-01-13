const { Sequelize } = require("sequelize");
const sequelize = require('../util/db');


module.exports = sequelize.define('user_group', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
});