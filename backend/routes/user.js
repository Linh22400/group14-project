
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');

// GET + POST đã có
router.get('/users', ctrl.getUsers);
router.post('/users', ctrl.createUser);

// NEW: PUT + DELETE
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

module.exports = router;
