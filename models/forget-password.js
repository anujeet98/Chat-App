const { Sequelize } = require('sequelize');
const sequelize = require('../util/db');


module.exports = sequelize.define('forget_password',{
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});