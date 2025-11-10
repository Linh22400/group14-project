const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const { requireAdmin, requireModeratorOrAdmin, canModeratorUpdateRole } = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

// Tất cả routes này đều cần đăng nhập và có quyền admin hoặc moderator

// User management routes với RBAC protection - cho phép cả admin và moderator
router.get('/users', authenticate, requireModeratorOrAdmin, userController.getUsers);
router.get('/users/stats', authenticate, requireModeratorOrAdmin, userController.getUserStats);
router.get('/users/:id', authenticate, requireModeratorOrAdmin, userController.getUserById);
router.post('/users', authenticate, requireModeratorOrAdmin, userController.createUser);
router.put('/users/:id', authenticate, requireModeratorOrAdmin, userController.updateUser);
router.put('/users/:id/role', authenticate, requireModeratorOrAdmin, canModeratorUpdateRole, userController.updateUserRole);
router.delete('/users/:id', authenticate, requireModeratorOrAdmin, userController.deleteUser);

module.exports = router;