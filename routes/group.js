const express = require('express');
const groupController = require('../controllers/group');
const authMiddleware = require('../middlewares/authentication');
const adminAuthMiddleware = require('../middlewares/authenticateAdmin');
const Router = express.Router();

Router.post('/create-group', authMiddleware.authenticate, groupController.createGroup);

Router.get('/get-info', authMiddleware.authenticate, groupController.getGroupInfo);

Router.put('/update-group', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.updateGroup);

Router.put('/add-admin', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.addGroupAdmin);

Router.put('/remove-admin', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.removeGroupAdmin);

Router.delete('/remove-user', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.removeUser);

Router.post('/add-users', authMiddleware.authenticate, adminAuthMiddleware.AdminAuth, groupController.addUsers)

module.exports = Router;