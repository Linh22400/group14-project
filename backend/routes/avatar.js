const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const avatarController = require('../controllers/avatarController');
const { authenticate } = require('../middleware/authMiddleware');

// Routes cho avatar
router.post('/upload-avatar', authenticate, upload.single('avatar'), avatarController.uploadAvatar);
router.get('/avatar/:userId', avatarController.getAvatar);

module.exports = router;