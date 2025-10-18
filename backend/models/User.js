const mongoose = require('mongoose');

// User Schema với các trường name và email
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    maxlength: [50, 'Tên không được vượt quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;