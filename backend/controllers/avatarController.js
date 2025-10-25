const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    console.log('Upload avatar request received');
    console.log('User:', req.user);
    console.log('File:', req.file);

    // Kiểm tra file upload
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'Vui lòng chọn ảnh đại diện' });
    }

    // Lấy userId từ req.user (được thêm bởi auth middleware)
    const userId = req.user.id;
    console.log('User ID:', userId);

    // Tìm user hiện tại
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Nếu user đã có avatar cũ, xóa file cũ
    if (user.avatar) {
      try {
        // Kiểm tra nếu avatar cũ là file local
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          console.log('Old local avatar deleted:', oldAvatarPath);
        }
      } catch (deleteError) {
        console.log('Error deleting old avatar:', deleteError);
        // Không throw error ở đây để không block việc upload mới
      }
    }

    // Lưu đường dẫn avatar mới (relative path)
    const avatarPath = path.relative(path.join(__dirname, '..'), req.file.path);
    user.avatar = avatarPath;
    await user.save();
    console.log('Avatar saved successfully:', user.avatar);

    // Trả về URL đầy đủ cho avatar
    const avatarUrl = `http://localhost:3000/api/${user.avatar.replace(/\\/g, '/')}`;
    res.json({
      message: 'Upload avatar thành công',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Lỗi upload avatar:', error);
    res.status(500).json({ message: 'Lỗi server khi upload avatar' });
  }
};

// Get user avatar
const getAvatar = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Trả về URL đầy đủ cho avatar
    let avatarUrl = user.avatar;
    if (user.avatar && !user.avatar.startsWith('http')) {
      // Chuyển đổi đường dẫn local thành URL
      avatarUrl = `http://localhost:3000/api/${user.avatar.replace(/\\/g, '/')}`;
    }

    res.json({ avatar: avatarUrl });
  } catch (error) {
    console.error('Lỗi lấy avatar:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy avatar' });
  }
};

module.exports = {
  uploadAvatar,
  getAvatar
};