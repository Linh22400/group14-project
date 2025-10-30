const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { uploadAvatarAdvanced, uploadCloudinary } = require('../middleware/uploadAdvanced');
const avatarController = require('../controllers/avatarController');
const { authenticate } = require('../middleware/authMiddleware');

// Routes cho avatar
// Upload với Cloudinary (không qua Sharp)
router.post('/upload-avatar', (req, res, next) => {
  console.log('🎯 Avatar route hit!');
  console.log('Headers:', req.headers);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  next();
}, authenticate, uploadCloudinary, avatarController.uploadAvatar);
// Route fallback với local storage
router.post('/upload-avatar-local', authenticate, upload.single('avatar'), avatarController.uploadAvatar);
router.get('/avatar/:userId', avatarController.getAvatar);

module.exports = router;