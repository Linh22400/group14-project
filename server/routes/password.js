const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

// Routes cho password reset
router.post('/forgot-password', passwordController.forgotPassword);
router.post('/reset-password', passwordController.resetPassword);
router.post('/verify-reset-code', passwordController.verifyResetCode);

module.exports = router;