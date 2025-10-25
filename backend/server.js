// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const path = require('path');

// CORS middleware
app.use(cors());
app.use(express.json());

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
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', passwordRoutes);
app.use('/api', avatarRoutes);

// endpoint test
app.get('/', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
