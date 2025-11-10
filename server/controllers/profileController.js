const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');
const { sendEmailWithFallback } = require('../services/emailServiceMulti');

// Lấy thông tin profile của user hiện tại
exports.getProfile = async (req, res) => {
  try {
    // Lấy user từ req.user (được gán bởi middleware authenticate)
    const user = req.user;

    // Xử lý URL avatar đầy đủ
    let avatarUrl = user.avatar;
    if (user.avatar && !user.avatar.startsWith('http')) {
      // Chuyển đổi đường dẫn local thành URL đầy đủ
      avatarUrl = `http://localhost:3000/api/${user.avatar.replace(/\\/g, '/')}`;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thông tin profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy thông tin profile' 
    });
  }
};

// Cập nhật thông tin profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email không hợp lệ' 
      });
    }

    // Kiểm tra email đã tồn tại chưa (trừ email của user hiện tại)
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email đã được sử dụng bởi người dùng khác' 
      });
    }

    // Cập nhật thông tin user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.toLowerCase().trim()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Log profile update activity
    try {
      await ActivityLog.logActivity(
        userId,
        'PROFILE_UPDATE',
        {
          oldName: req.user.name,
          newName: updatedUser.name,
          oldEmail: req.user.email,
          newEmail: updatedUser.email,
          ipAddress: req.ip || req.connection?.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null
        },
        req
      );
    } catch (logError) {
      console.error('Error logging profile update:', logError);
    }

    // Xử lý URL avatar đầy đủ
    let avatarUrl = updatedUser.avatar;
    if (updatedUser.avatar && !updatedUser.avatar.startsWith('http')) {
      // Chuyển đổi đường dẫn local thành URL đầy đủ
      avatarUrl = `http://localhost:3000/api/${updatedUser.avatar.replace(/\\/g, '/')}`;
    }

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: avatarUrl,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật profile' 
    });
  }
};

// Đổi mật khẩu trong profile (yêu cầu nhập mật khẩu cũ)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới' 
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    // Kiểm tra mật khẩu cũ và mới không giống nhau
    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới phải khác mật khẩu cũ' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Kiểm tra mật khẩu cũ có đúng không
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu cũ không chính xác' 
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    // Log activity
    try {
      await ActivityLog.logActivity(
        userId,
        'PASSWORD_CHANGED',
        {
          email: user.email,
          ipAddress: req.ip || req.connection?.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null
        },
        req
      );
    } catch (logError) {
      console.error('Error logging password change:', logError);
    }

    res.json({
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công'
    });

  } catch (error) {
    console.error('Lỗi thay đổi mật khẩu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi thay đổi mật khẩu' 
    });
  }
};

// Xóa các hàm không cần thiết - đã được thay thế bằng changePassword
// exports.resetPassword = async (req, res) => { ... } // Đã xóa