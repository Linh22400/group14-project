const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');

// GET /api/profile - Lấy thông tin profile (yêu cầu authentication)
router.get('/', authenticate, getProfile);

// PUT /api/profile - Cập nhật thông tin profile (yêu cầu authentication)
router.put('/', authenticate, updateProfile);

// POST /api/profile/change-password - Đổi mật khẩu trong profile
router.post('/change-password', authenticate, changePassword);

module.exports = router;