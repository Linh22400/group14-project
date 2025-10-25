// Test script để kiểm tra chức năng gửi email với Gmail
require('dotenv').config();
const { sendResetPasswordEmail } = require('./services/emailService');

async function testEmail() {
  try {
    console.log('🔍 Testing Gmail SMTP configuration...');
    console.log('📧 Email config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      frontendUrl: process.env.FRONTEND_URL
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Thiếu cấu hình email. Vui lòng kiểm tra file .env');
      return;
    }

    const testEmail = process.env.EMAIL_USER; // Gửi đến chính mình để test
    const testToken = 'test-token-' + Date.now();
    
    console.log(`📤 Sending test email to ${testEmail}...`);
    const result = await sendResetPasswordEmail(testEmail, testToken);
    
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', result.messageId);
    console.log('🔗 Test URL:', `${process.env.FRONTEND_URL}/reset-password?token=${testToken}`);
    console.log('💡 Kiểm tra email của bạn (cả spam folder)');
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('🔧 Lỗi xác thực. Kiểm tra:');
      console.error('- Đã bật 2FA chưa?');
      console.error('- App password đúng chưa?');
      console.error('- Email trong file .env đúng chưa?');
    }
  }
}

testEmail();