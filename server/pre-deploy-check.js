#!/usr/bin/env node

/**
 * Script kiểm tra cấu hình trước khi deploy lên Render
 * Chạy: node pre-deploy-check.js
 */

require('dotenv').config();

console.log('🔍 KIỂM TRA CẤU HÌNH TRƯỚC KHI DEPLOY');
console.log('=' .repeat(50));

// Danh sách các biến môi trường bắt buộc
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

// Danh sách các biến môi trường tuỳ chọn nhưng khuyến khích
const recommendedEnvVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NODE_ENV',
  'PORT'
];

let hasErrors = false;
let hasWarnings = false;

// Kiểm tra biến bắt buộc
console.log('\n📋 BIẾN MÔI TRƯỜNG BẮT BUỘC:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: CHƯA CÓ GIÁ TRỊ`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: Đã cấu hình`);
  }
});

// Kiểm tra biến khuyến khích
console.log('\n📋 BIẾN MÔI TRƯỜNG KHUYẾN KHÍCH:');
recommendedEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Chưa có giá trị`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: Đã cấu hình`);
  }
});

// Kiểm tra chi tiết từng biến
console.log('\n🔍 PHÂN TÍCH CHI TIẾT:');

// Kiểm tra MongoDB URI
if (process.env.MONGODB_URI) {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri.includes('mongodb+srv://')) {
    console.log('⚠️  MONGODB_URI không phải là MongoDB Atlas connection string');
    hasWarnings = true;
  }
  if (mongoUri.includes('localhost')) {
    console.log('⚠️  MONGODB_URI đang dùng localhost, sẽ không hoạt động trên Render');
    hasErrors = true;
  }
}

// Kiểm tra JWT Secret
if (process.env.JWT_SECRET) {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret.length < 32) {
    console.log('⚠️  JWT_SECRET quá ngắn (nên ít nhất 32 ký tự)');
    hasWarnings = true;
  }
  if (jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
    console.log('❌ JWT_SECRET chưa được thay đổi, bảo mật kém');
    hasErrors = true;
  }
}

// Kiểm tra Email config
if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
  console.log('📧 Sử dụng Gmail SMTP');
  
  if (process.env.EMAIL_PORT !== '587') {
    console.log('⚠️  EMAIL_PORT nên là 587 cho Gmail');
    hasWarnings = true;
  }
  
  if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('@gmail.com')) {
    console.log('⚠️  EMAIL_USER phải là địa chỉ Gmail (@gmail.com)');
    hasWarnings = true;
  }
  
  if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.length < 15) {
    console.log('⚠️  EMAIL_PASS có vẻ không phải App Password (quá ngắn)');
    hasWarnings = true;
  }
}

// Kiểm tra Frontend URL
if (process.env.FRONTEND_URL) {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl.startsWith('http')) {
    console.log('⚠️  FRONTEND_URL nên bắt đầu với http:// hoặc https://');
    hasWarnings = true;
  }
  if (frontendUrl.includes('localhost')) {
    console.log('⚠️  FRONTEND_URL đang dùng localhost, CORS sẽ không hoạt động trên production');
    hasWarnings = true;
  }
}

// Kiểm tra package.json
console.log('\n📦 KIỂM TRA PACKAGE.JSON:');
try {
  const fs = require('fs');
  const path = require('path');
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (!packageJson.scripts || !packageJson.scripts.start) {
    console.log('❌ Thiếu script "start" trong package.json');
    hasErrors = true;
  } else {
    console.log(`✅ Start script: ${packageJson.scripts.start}`);
  }
  
  if (!packageJson.main) {
    console.log('⚠️  Không có field "main" trong package.json');
    hasWarnings = true;
  } else {
    console.log(`✅ Main file: ${packageJson.main}`);
  }
  
  const dependencies = packageJson.dependencies || {};
  const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv'];
  requiredDeps.forEach(dep => {
    if (!dependencies[dep]) {
      console.log(`❌ Thiếu dependency: ${dep}`);
      hasErrors = true;
    }
  });
  
} catch (error) {
  console.log('❌ Không thể đọc package.json:', error.message);
  hasErrors = true;
}

// Kiểm tra health endpoint
console.log('\n🏥 KIỂM TRA HEALTH ENDPOINT:');
const http = require('http');
const PORT = process.env.PORT || 3000;
const healthUrl = `http://localhost:${PORT}/health`;

// Kiểm tra kết nối MongoDB
console.log('\n🗄️  KIỂM TRA KẾT NỐI MONGODB:');
if (process.env.MONGODB_URI) {
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // 5 giây timeout
  })
  .then(() => {
    console.log('✅ Kết nối MongoDB thành công!');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.log('❌ Không thể kết nối MongoDB:', err.message);
    hasErrors = true;
  });
}

// Kết luận
console.log('\n' + '=' .repeat(50));
console.log('📊 KẾT QUẢ KIỂM TRA:');

if (hasErrors) {
  console.log('❌ CÓ LỖI NGIÊM TRỌNG - KHÔNG THỂ DEPLOY');
  console.log('\n🔧 HÀNH ĐỘNG CẦN LÀM:');
  console.log('1. Sửa các lỗi nghiêm trọng ở trên');
  console.log('2. Tạo file .env với các biến cần thiết');
  console.log('3. Kiểm tra lại kết nối MongoDB');
  console.log('4. Chạy lại script này để xác nhận');
} else if (hasWarnings) {
  console.log('⚠️  CÓ CẢNH BÁO - CÓ THỂ DEPLOY NHƯNG NÊN CẢI THIỆN');
  console.log('\n💡 KHUYẾN NGHỊ:');
  console.log('1. Xem xét các cảnh báo để tối ưu hóa');
  console.log('2. Có thể deploy nhưng nên cải thiện sau');
  console.log('3. Kiểm tra logs sau khi deploy');
} else {
  console.log('✅ MỌI THỨ ĐỀU ỔN - CÓ THỂ DEPLOY NGAY');
  console.log('\n🚀 TIẾP THEO:');
  console.log('1. Push code lên GitHub');
  console.log('2. Tạo Web Service trên Render');
  console.log('3. Cấu hình environment variables');
  console.log('4. Deploy!');
}

console.log('\n📖 Xem thêm: RENDER_DEPLOY_GUIDE.md');