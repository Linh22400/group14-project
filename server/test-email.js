require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  console.log('🧪 Đang test gửi email...');
  
  try {
    const testEmail = 'ln32587@gmail.com';
    const result = await emailService.sendResetPasswordEmail(
      testEmail,
      'test-reset-token-12345'
    );
    
    console.log('✅ Email gửi thành công!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📝 Preview URL:', result.previewUrl);
    
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    console.error('🔍 Chi tiết lỗi:', error);
  }
}

testEmail();