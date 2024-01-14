const express = require('express');
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/authentication');

const Router = express.Router();

Router.post('/signup', userController.signup);

Router.post('/signin', userController.signin);

Router.get('/get-info', authMiddleware.authenticate, userController.getUserInfo);

Router.get('/groups', authMiddleware.authenticate, userController.getGroups);

Router.get('/get-users', authMiddleware.authenticate, userController.getUsers);

module.exports = Router;