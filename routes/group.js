const express = require('express');
const multer = require('../middlewares/multer');
const groupController = require('../controllers/group');
const authMiddleware = require('../middlewares/authentication');
const adminAuthMiddleware = require('../middlewares/authenticate-admin');
const Router = express.Router();

//get-group-msgs:       GET /groups/messages
//create-group:         POST groups/
//get-group-info:       GET groups/:groupId
//update-group:         PUT groups/:groupId
//add-member:           POST /groups/:groupId/member
//remove-member:        DELETE /groups/:groupId/member
//update-admin-status:  PUT /groups/:groupId/admins/:memberId

//send-text-msg:        POST /groups/:groupId/messages/text
//send-file-msg:        POST /groups/:groupId/messages/file

Router.get('/messages', authMiddleware.authenticate, multer.upload, groupController.getGroupMessages);

Router.post('/', authMiddleware.authenticate, groupController.createGroup);

Router.get('/:groupId', authMiddleware.authenticate, groupController.getGroupInfo);

Router.put('/:groupId', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.updateGroup);

Router.post('/:groupId/members', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.addUsers);

Router.delete('/:groupId/members/:memberId', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.removeUser);

Router.put('/:groupId/admins/:memberId', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.updateAdminStatus);


Router.post('/:groupId/messages/text', authMiddleware.authenticate, groupController.postTextMessage);

Router.post('/:groupId/messages/file', authMiddleware.authenticate, multer.upload, groupController.postFileMessage);

// Router.get('/fetch', authMiddleware.authenticate, groupController.getChats);

module.exports = Router;