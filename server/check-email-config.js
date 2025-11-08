// Script kiểm tra cấu hình email
require('dotenv').config();

console.log('🔍 KIỂM TRA CẤU HÌNH EMAIL');
console.log('================================');

// Kiểm tra các biến môi trường cần thiết
const requiredEnvVars = [
  'EMAIL_HOST',
  'EMAIL_PORT', 
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'FRONTEND_URL'
];

let hasErrors = false;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: CHƯA CÓ GIÁ TRỊ`);
    hasErrors = true;
  } else {
    // Ẩn password để bảo mật
    const displayValue = varName.includes('PASS') ? '•'.repeat(value.length) : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n📊 PHÂN TÍCH CẤU HÌNH:');

// Kiểm tra Gmail
if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
  console.log('📧 Sử dụng Gmail SMTP');
  
  if (process.env.EMAIL_PORT !== '587') {
    console.log('⚠️  PORT nên là 587 cho Gmail');
  }
  
  if (!process.env.EMAIL_USER?.includes('@gmail.com')) {
    console.log('⚠️  EMAIL_USER phải là địa chỉ Gmail (@gmail.com)');
  }
  
  if (process.env.EMAIL_PASS?.length < 15) {
    console.log('⚠️  EMAIL_PASS có vẻ không phải App Password (quá ngắn)');
  }
} else {
  console.log('📧 Sử dụng SMTP khác:', process.env.EMAIL_HOST);
}

// Kiểm tra Frontend URL
if (!process.env.FRONTEND_URL?.startsWith('http')) {
  console.log('⚠️  FRONTEND_URL nên bắt đầu với http:// hoặc https://');
}

console.log('\n📋 HƯỚNG DẪN KHẮC PHỤC:');

if (hasErrors) {
  console.log('1. Copy file .env.example thành .env:');
  console.log('   cp .env.example .env');
  console.log('');
  console.log('2. Cập nhật các giá trị còn thiếu trong file .env');
  console.log('');
  console.log('3. Nếu dùng Gmail, xem hướng dẫn trong GMAIL_SETUP.md');
} else {
  console.log('✅ Cấu hình đầy đủ!');
  console.log('');
  console.log('🧪 Test email bằng lệnh:');
  console.log('   node test-email.js');
}

console.log('\n================================');