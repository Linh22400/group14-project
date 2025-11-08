const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware để xác thực token
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware called');
    console.log('Authorization header:', req.headers.authorization);
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Token extracted:', token ? token.substring(0, 50) + '...' : 'No token');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    console.log('Token decoded:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('User found:', user ? user.email : 'No user');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    req.user = user;
    console.log('✅ Auth successful, user:', user.email);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware để kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền admin.' });
  }
};

// Middleware để kiểm tra quyền user hoặc admin (cho phép xóa tài khoản của chính mình)
const requireAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'user')) {
    next();
  } else {
    res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu đăng nhập.' });
  }
};

// Middleware để kiểm tra quyền xóa user (admin hoặc chính mình)
const canDeleteUser = (req, res, next) => {
  const userIdToDelete = req.params.id;
  
  // Admin có thể xóa bất kỳ user nào
  if (req.user.role === 'admin') {
    return next();
  }
  
  // User thường chỉ có thể xóa tài khoản của chính mình
  if (req.user.role === 'user' && req.user._id.toString() === userIdToDelete) {
    return next();
  }
  
  res.status(403).json({ message: 'Không có quyền xóa user này' });
};

module.exports = {
  authenticate,
  requireAdmin,
  requireAuth,
  canDeleteUser
};