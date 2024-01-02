const express = require('express');
const chatController = require('../controllers/chat');
const authMiddleware = require('../middlewares/authentication');
const Router = express.Router();

Router.post('/send', authMiddleware.authenticate, chatController.postChat);

Router.get('/fetch/lastMessageId=:lastMessageId', authMiddleware.authenticate, chatController.getChats);

module.exports = Router;