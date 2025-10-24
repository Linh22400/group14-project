
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { authenticate, requireAdmin, canDeleteUser } = require('../middleware/authMiddleware');

// GET + POST đã có
router.get('/users', authenticate, requireAdmin, ctrl.getUsers);
router.post('/users', ctrl.createUser);

// NEW: PUT + DELETE
router.put('/users/:id', authenticate, requireAdmin, ctrl.updateUser);
router.delete('/users/:id', authenticate, canDeleteUser, ctrl.deleteUser);

module.exports = router;
