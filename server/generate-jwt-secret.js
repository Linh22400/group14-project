#!/usr/bin/env node

/**
 * Script tạo JWT secret ngẫu nhiên an toàn
 * Chạy: node generate-jwt-secret.js
 */

const crypto = require('crypto');

console.log('🔐 TẠO JWT SECRET NGẪU NHIÊN');
console.log('=' .repeat(40));

// Tạo 3 loại secret khác nhau để bạn lựa chọn
const secrets = {
  basic: crypto.randomBytes(32).toString('hex'), // 64 characters
  strong: crypto.randomBytes(48).toString('hex'), // 96 characters  
  ultra: crypto.randomBytes(64).toString('hex'), // 128 characters
};

console.log('\n📋 CÁC LỰA CHỌN JWT SECRET:');
console.log(`1. Basic (64 chars):  ${secrets.basic}`);
console.log(`2. Strong (96 chars): ${secrets.strong}`);
console.log(`3. Ultra (128 chars): ${secrets.ultra}`);

console.log('\n💡 KHUYẾN NGHỊ:');
console.log('- Dùng "Strong" cho hầu hết các ứng dụng');
console.log('- Dùng "Ultra" cho ứng dụng tài chính hoặc y tế');

console.log('\n🔧 CÁCH SỬ DỤNG:');
console.log('1. Copy một trong các secret trên');
console.log('2. Thêm vào Render dashboard trong phần Environment Variables');
console.log('3. Đặt tên biến là JWT_SECRET');
console.log('4. Lưu ý: KHÔNG chia sẻ secret này với ai!');

console.log('\n⚠️  LƯU Ý BẢO MẬT:');
console.log('- Không commit secret vào Git');
console.log('- Không chia sẻ trong code hoặc documentation');
console.log('- Mỗi môi trường (dev, staging, prod) nên có secret khác nhau');
console.log('- Nên đổi secret định kỳ (3-6 tháng)');

console.log('\n✅ Xong! Hãy copy secret và sử dụng trong Render dashboard.');