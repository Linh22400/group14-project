const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const { logFailedLogin, logRegistration } = require('../middleware/activityLogger');

// Routes cho authentication
router.post('/signup', logRegistration, authController.signup);
router.post('/login', loginRateLimiter, logFailedLogin, authController.login);
router.post('/logout', authController.authenticate, authController.logout);
router.post('/refresh', authController.refresh);

module.exports = router;