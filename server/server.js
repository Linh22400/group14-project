// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Production security middleware
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust Render's proxy
}

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
  next();
});

// CORS configuration for production - support multiple domains
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://group14-project-livid.vercel.app',
  /https:\/\/group14-project-.*-linhs-projects-ef57d46f\.vercel\.app/, // Dynamic pattern for Vercel deployments
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean); // Remove undefined/null values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// import middleware
const { autoLogActivity } = require('./middleware/activityLogger');
const { generalRateLimiter } = require('./middleware/rateLimiter');

// Apply general rate limiting to all API routes
app.use('/api', generalRateLimiter);

// Apply activity logging to all API routes
app.use('/api', autoLogActivity);

// Kết nối MongoDB Atlas với cấu hình production
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/groupDB';

mongoose.connect(mongoURI)
.then(() => {
  console.log('✅ Kết nối MongoDB Atlas thành công!');
  console.log('📊 MongoDB Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
})
.catch(err => {
  console.error('❌ Lỗi kết nối MongoDB:', err.message);
  console.error('🔄 Thử kết nối lại sau 5 giây...');
  setTimeout(() => {
    mongoose.connect(mongoURI)
      .then(() => console.log('✅ Kết nối MongoDB thành công sau retry!'))
      .catch(err => console.error('❌ Lỗi kết nối MongoDB sau retry:', err.message));
  }, 5000);
});

// import router đúng cách
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const passwordRoutes = require('./routes/password');
const avatarRoutes = require('./routes/avatar');
const activityLogRoutes = require('./routes/activityLogRoutes');

// Health check endpoint - IMPORTANT for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      profile: '/api/profile',
      admin: '/api/admin',
      avatar: '/api/avatar',
      activityLogs: '/api/activity-logs'
    }
  });
});

// gắn router vào /api
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api', userRoutes);



const PORT = process.env.PORT || 3000;

// Production-ready server startup
const server = app.listen(PORT, () => {
  console.log('🚀 Server started successfully!');
  console.log(`📡 PORT: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🎯 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API status: http://localhost:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

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
