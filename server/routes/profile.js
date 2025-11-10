const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const { getProfile, updateProfile, sendResetPasswordCode, resetPassword } = require('../controllers/profileController');

// GET /api/profile - Lấy thông tin profile (yêu cầu authentication)
router.get('/', authenticate, getProfile);

// PUT /api/profile - Cập nhật thông tin profile (yêu cầu authentication)
router.put('/', authenticate, updateProfile);

// POST /api/profile/send-reset-code - Gửi mã xác nhận đặt lại mật khẩu
router.post('/send-reset-code', authenticate, sendResetPasswordCode);

// POST /api/profile/reset-password - Đặt lại mật khẩu với mã xác nhận
router.post('/reset-password', authenticate, resetPassword);

module.exports = router;