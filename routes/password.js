const express = require('express');
const router = express.Router();

const passwordController = require('../controllers/password');

router.get('/forget/:email', passwordController.forgetPassword);

router.get('/reset/:id', passwordController.resetPassword);

router.patch('/update/', passwordController.updatePassword);

module.exports = router;