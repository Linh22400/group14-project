// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS middleware
app.use(cors());
app.use(express.json());

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

// gắn router vào /api
app.use('/api', userRoutes);

// endpoint test
app.get('/', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
