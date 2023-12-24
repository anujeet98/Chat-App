const express = require('express');
const userController = require('../controllers/user');

const Router = express.Router();

Router.post('/signup', userController.signup);

Router.post('/signin', userController.signin);

module.exports = Router;