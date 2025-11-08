const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// Upload avatar với Cloudinary và Sharp
const uploadAvatar = async (req, res) => {
  try {
    
    console.log('Upload avatar request received');
    console.log('Headers:', req.headers);
    console.log('User:', req.user);
    console.log('File:', req.file);
    console.log('Body:', req.body);

    // Kiểm tra user authentication
    if (!req.user || !req.user.id) {
      console.log('User not authenticated');
      return res.status(401).json({ 
        success: false,
        message: 'Người dùng chưa xác thực' 
      });
    }

    // Kiểm tra file upload
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng chọn ảnh đại diện' 
      });
    }

    // Lấy userId từ req.user (được thêm bởi auth middleware)
    const userId = req.user.id;
    console.log('User ID:', userId);

    // Tìm user hiện tại
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy người dùng' 
      });
    }

    let avatarUrl;
    
    // Kiểm tra nếu đã upload lên Cloudinary qua middleware
    if (req.file.path && req.file.path.includes('cloudinary')) {
      avatarUrl = req.file.path;
      console.log('File already uploaded to Cloudinary:', avatarUrl);
    } else {
      // Xử lý upload thủ công nếu chưa qua Cloudinary middleware
      const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'demo';

      if (hasCloudinaryConfig) {
        try {
          // Upload trực tiếp lên Cloudinary với transformation
          const uploadData = req.file.buffer || req.file.path;
          let result;
          
          if (req.file.buffer) {
            result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
              folder: 'user-avatars',
              allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
              transformation: [
                { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
              ],
              public_id: `avatar-${userId}-${Date.now()}`
            });
          } else {
            result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'user-avatars',
              allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
              transformation: [
                { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
              ],
              public_id: `avatar-${userId}-${Date.now()}`
            });
          }
          
          avatarUrl = result.secure_url;
          console.log('Cloudinary upload successful:', avatarUrl);
        } catch (cloudinaryError) {
          console.log('Cloudinary upload failed:', cloudinaryError);
          console.log('Cloudinary error details:', {
            message: cloudinaryError.message,
            stack: cloudinaryError.stack,
            name: cloudinaryError.name
          });
          return res.status(500).json({
            success: false,
            message: 'Lỗi upload lên Cloudinary',
            error: cloudinaryError.message || 'Unknown Cloudinary error'
          });
        }
      } else {
        // Lưu local nếu không có Cloudinary
        const avatarPath = path.relative(path.join(__dirname, '..'), req.file.path);
        avatarUrl = `http://localhost:3000/api/${avatarPath.replace(/\\/g, '/')}`;
        console.log('Local avatar saved successfully');
      }
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      if (user.avatar.includes('cloudinary')) {
        try {
          // Xóa avatar cũ trên Cloudinary
          const publicId = user.avatar.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`user-avatars/${publicId}`);
          console.log('Old Cloudinary avatar deleted');
        } catch (deleteError) {
          console.log('Error deleting old Cloudinary avatar:', deleteError);
          // Không trả lỗi vì đây chỉ là cleanup
        }
      } else {
        try {
          // Xóa file local cũ
          const oldAvatarPath = user.avatar.replace('http://localhost:3000/api/', '');
          const fullPath = path.join(__dirname, '..', oldAvatarPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log('Old local avatar deleted');
          }
        } catch (deleteError) {
          console.log('Error deleting old local avatar:', deleteError);
          // Không trả lỗi vì đây chỉ là cleanup
        }
      }
    }

    // Cập nhật avatar URL trong database
    user.avatar = avatarUrl;
    await user.save();
    console.log('Avatar updated in database:', user.avatar);

    res.json({
      success: true,
      message: 'Upload avatar thành công',
      avatar: avatarUrl
    });
    
  } catch (error) {
    console.error('❌ Lỗi upload avatar:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi upload avatar',
      error: error.message 
    });
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