const crypto = require('crypto');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../services/emailService');

// Quên mật khẩu - gửi token reset password qua email
exports.forgotPassword = async (req, res) => {
  // Thiết lập timeout 30 giây cho request này
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      return res.status(504).json({
        success: false,
        message: 'Yêu cầu gửi email đã hết thời gian chờ. Vui lòng thử lại sau.'
      });
    }
  }, 30000);

  try {
    const { email } = req.body;

    if (!email) {
      clearTimeout(timeout);
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email'
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      clearTimeout(timeout);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng với email này'
      });
    }

    // Tạo token reset password (sử dụng crypto để tạo token an toàn)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 giờ

    // Lưu token vào database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save();

    // Tạo link reset password (frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;

    // Gửi email với link reset password (có timeout riêng)
    await sendResetPasswordEmail(user.email, resetUrl);
    
    clearTimeout(timeout);
    
    res.json({
      success: true,
      message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn. Link sẽ hết hạn sau 1 giờ.'
    });

  } catch (error) {
    clearTimeout(timeout);
    console.error('Lỗi forgot password:', error);
    
    // Xử lý lỗi email cụ thể
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cấu hình email server. Vui lòng liên hệ quản trị viên.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi gửi email reset password. Vui lòng thử lại sau.'
    });
  }
};

// Xác thực mã 4 chữ số và đặt lại mật khẩu
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, mã xác nhận và mật khẩu mới là bắt buộc'
      });
    }

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Tìm user với mã xác nhận hợp lệ
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetCode: resetCode,
      resetCodeExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận không đúng hoặc đã hết hạn'
      });
    }

    // Cập nhật mật khẩu mới và xóa mã xác nhận
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công'
    });

  } catch (error) {
    console.error('Lỗi xác thực mã reset:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực mã'
    });
  }
};

// Reset mật khẩu với token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token và mật khẩu mới là bắt buộc'
      });
    }

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Tìm user với token hợp lệ
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Mật khẩu đã được reset thành công'
    });

  } catch (error) {
    console.error('Lỗi reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi reset password'
    });
  }
};