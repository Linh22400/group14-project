// backend/routes/user.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');

// định nghĩa route
router.get('/users', ctrl.getUsers);
router.post('/users', ctrl.createUser);

// *** export ĐÚNG CÁCH cho CommonJS
module.exports = router;
