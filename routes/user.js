const express = require('express');
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/authentication');

const Router = express.Router();

//user-signin:          POST /users/signin
//user-signup:          POST /users/signup
//get-all-users:        GET  /users/
//get-user-info:        GET  /users/self
//get-user-groups:      GET  /users/self/groups

Router.post('/signin', userController.signin);

Router.post('/signup', userController.signup);

Router.get('/', authMiddleware.authenticate, userController.getUsers);

Router.get('/self', authMiddleware.authenticate, userController.getUserInfo);

Router.get('/self/groups', authMiddleware.authenticate, userController.getGroups);

module.exports = Router;