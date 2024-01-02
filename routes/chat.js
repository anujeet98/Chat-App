const express = require('express');
const chatController = require('../controllers/chat');
const authMiddleware = require('../middlewares/authentication');
const Router = express.Router();

Router.post('/send', authMiddleware.authenticate, chatController.postChat);

Router.get('/fetch', authMiddleware.authenticate, chatController.getChats);

Router.post('/create-group/', authMiddleware.authenticate, chatController.createGroup);

module.exports = Router;