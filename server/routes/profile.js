const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const { getProfile, updateProfile } = require('../controllers/profileController');

// GET /api/profile - Lấy thông tin profile (yêu cầu authentication)
router.get('/', authenticate, getProfile);

// PUT /api/profile - Cập nhật thông tin profile (yêu cầu authentication)
router.put('/', authenticate, updateProfile);

module.exports = router;