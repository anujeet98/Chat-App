const express = require('express');
const chatController = require('../controllers/chat');
const authMiddleware = require('../middlewares/authentication');
const multer = require('../middlewares/multer')
const Router = express.Router();

Router.post('/send-message', authMiddleware.authenticate, chatController.postChatMessage);

Router.post('/send-file', authMiddleware.authenticate, multer.upload, chatController.postChatFile);

Router.get('/get-chats', authMiddleware.authenticate, multer.upload, chatController.getGroupChats);

// Router.get('/fetch', authMiddleware.authenticate, chatController.getChats);

module.exports = Router;