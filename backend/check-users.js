const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    // Tìm tất cả users
    const users = await User.find({}).select('username email -_id');
    console.log('Danh sách users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}, Email: ${user.email}`);
    });

    // Tìm user với email test cụ thể
    const testUser = await User.findOne({ email: 'test@email.com' });
    if (testUser) {
      console.log('\nTest user found:');
      console.log('Username:', testUser.username);
      console.log('Email:', testUser.email);
      console.log('Password (hashed):', testUser.password);
    } else {
      console.log('\nKhông tìm thấy user với email test@email.com');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Lỗi:', error);
    mongoose.connection.close();
  }
}

checkUsers();