const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const { requireAdmin } = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

// Tất cả routes này đều cần đăng nhập và có quyền admin

// User management routes với RBAC protection
router.get('/users', authenticate, requireAdmin, userController.getAllUsers);
router.get('/users/stats', authenticate, requireAdmin, userController.getUserStats);
router.get('/users/:id', authenticate, requireAdmin, userController.getUserById);
router.post('/users', authenticate, requireAdmin, userController.createUser);
router.put('/users/:id/role', authenticate, requireAdmin, userController.updateUserRole);
router.delete('/users/:id', authenticate, requireAdmin, userController.deleteUser);

module.exports = router;