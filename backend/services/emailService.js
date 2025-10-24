const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS  // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Send password reset code (4 digits)
const sendResetPasswordEmail = async (email, resetCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      to: email,
      subject: 'Mã xác nhận đặt lại mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h2 style="color: #333;">Mã xác nhận đặt lại mật khẩu</h2>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p>Xin chào,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Sử dụng mã bên dưới để tiếp tục:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #007bff; color: white; padding: 15px 30px; 
                          font-size: 24px; font-weight: bold; letter-spacing: 5px; 
                          border-radius: 8px; display: inline-block;">
                ${resetCode}
              </div>
            </div>
            <p style="text-align: center; font-size: 18px; color: #333;">
              <strong>Mã xác nhận: ${resetCode}</strong>
            </p>
            <p><strong>Lưu ý:</strong> Mã này sẽ hết hạn sau 10 phút.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p>Email này được gửi tự động từ hệ thống.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = { sendResetPasswordEmail };