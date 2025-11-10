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

// Gửi mã xác nhận để đặt lại mật khẩu
exports.sendResetPasswordCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Tạo mã xác nhận 4 chữ số
    const resetCode = crypto.randomInt(1000, 9999).toString();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Lưu mã vào database
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // Gửi email với mã xác nhận qua service đa năng
    const subject = 'Mã xác nhận đặt lại mật khẩu';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h2 style="color: #333;">Xác nhận đặt lại mật khẩu</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p>Xin chào ${user.name},</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu trong phần Profile. Vui lòng sử dụng mã xác nhận bên dưới:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #007bff; color: white; padding: 15px 30px; 
                       font-size: 24px; font-weight: bold; border-radius: 8px; 
                       display: inline-block; letter-spacing: 4px;">
              ${resetCode}
            </div>
          </div>
          <p><strong>Lưu ý:</strong> Mã này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666;">
          <p>Email này được gửi tự động từ hệ thống.</p>
        </div>
      </div>
    `;

    await sendEmailWithFallback(user.email, subject, html);

    // Log activity
    try {
      await ActivityLog.logActivity(
        userId,
        'PASSWORD_RESET_CODE_SENT',
        {
          email: user.email,
          ipAddress: req.ip || req.connection?.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null
        },
        req
      );
    } catch (logError) {
      console.error('Error logging password reset code sent:', logError);
    }

    res.json({
      success: true,
      message: 'Mã xác nhận đã được gửi đến email của bạn'
    });

  } catch (error) {
    console.error('Lỗi gửi mã xác nhận:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi gửi mã xác nhận' 
    });
  }
};

// Xác nhận mã và cập nhật mật khẩu mới
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resetCode, newPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!resetCode || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp đầy đủ thông tin' 
      });
    }

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Kiểm tra mã xác nhận
    if (!user.resetCode || user.resetCode !== resetCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã xác nhận không hợp lệ' 
      });
    }

    // Kiểm tra mã đã hết hạn chưa
    if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã xác nhận đã hết hạn' 
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    // Log activity
    try {
      await ActivityLog.logActivity(
        userId,
        'PASSWORD_RESET_SUCCESS',
        {
          email: user.email,
          ipAddress: req.ip || req.connection?.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null
        },
        req
      );
    } catch (logError) {
      console.error('Error logging password reset success:', logError);
    }

    res.json({
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công'
    });

  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đặt lại mật khẩu' 
    });
  }
};