// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const path = require('path');

// Logging middleware để debug tất cả requests - PHẢI Ở ĐẦU TIÊN
app.use((req, res, next) => {
  next();
});

// CORS middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Kết nối MongoDB Atlas
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/groupDB';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Kết nối MongoDB Atlas thành công!'))
.catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// import router đúng cách
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const passwordRoutes = require('./routes/password');
const avatarRoutes = require('./routes/avatar');

// gắn router vào /api
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api', userRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Error handler toàn cục
app.use((err, req, res, next) => {
  console.error('❌ Lỗi server:', err);
  console.error('Error stack:', err.stack);
  console.error('Error type:', typeof err);
  console.error('Error keys:', Object.keys(err));
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request headers:', req.headers);
  
  // Nếu lỗi là object, chuyển sang string
  const errorMessage = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
  
  // Tránh gửi HTML response
  if (res.headersSent) {
    return;
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: 'Lỗi server: ' + errorMessage,
    error: errorMessage
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy endpoint'
  });
});
