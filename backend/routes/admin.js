const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route đặc biệt để cập nhật role (chỉ dùng cho development)
// WARNING: Nên xóa hoặc bảo vệ route này trong production
router.post('/update-role', adminController.updateRole);

// Route để xem tất cả users (cho development)
router.get('/users-dev', adminController.getAllUsersDev);

module.exports = router;