const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes cho authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.authenticate, authController.logout);
router.post('/refresh', authController.refresh);

module.exports = router;