const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Cấu hình token
const ACCESS_TOKEN_EXPIRY = '15m'; // Access token hết hạn sau 15 phút
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // Refresh token hết hạn sau 7 ngày

// Tạo JWT access token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};

// Tạo refresh token ngẫu nhiên
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Tạo refresh token và lưu vào database
const createRefreshToken = async (userId, userAgent = '', ipAddress = '') => {
  const token = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  const refreshToken = new RefreshToken({
    token,
    userId,
    expiresAt,
    userAgent,
    ipAddress
  });

  await refreshToken.save();
  return token;
};

// Đăng ký người dùng mới
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email không hợp lệ' 
      });
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email đã được sử dụng' 
      });
    }

    // Tạo người dùng mới
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password
    });

    await newUser.save();

    // Lấy thông tin device để tạo refresh token
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    // Tạo access token và refresh token
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = await createRefreshToken(newUser._id, userAgent, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đăng ký' 
    });
  }
};

// Refresh access token
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token là bắt buộc'
      });
    }

    // Tìm refresh token trong database
    const storedToken = await RefreshToken.findOne({
      token: refreshToken
    }).populate('userId');

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ'
      });
    }

    // Kiểm tra token có bị thu hồi không
    if (storedToken.isRevoked) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token đã bị thu hồi'
      });
    }

    // Kiểm tra token còn hạn không
    if (storedToken.isExpired()) {
      // Xóa token hết hạn
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({
        success: false,
        message: 'Refresh token đã hết hạn'
      });
    }

    // Tạo access token mới
    const newAccessToken = generateAccessToken(storedToken.userId._id);

    res.json({
      success: true,
      message: 'Refresh token thành công',
      data: {
        accessToken: newAccessToken,
        refreshToken: refreshToken // Trả về refresh token cũ vẫn còn hạn
      }
    });

  } catch (error) {
    console.error('Lỗi refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi refresh token'
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền email và mật khẩu' 
      });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // Lấy thông tin device để tạo refresh token
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    // Tạo access token và refresh token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user._id, userAgent, ipAddress);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đăng nhập' 
    });
  }
};

// Đăng xuất
exports.logout = async (req, res) => {
  try {
    // Thu hồi tất cả refresh tokens của user
    if (req.user && req.user._id) {
      await RefreshToken.revokeAllUserTokens(req.user._id);
    }
    
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });

  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đăng xuất' 
    });
  }
};

// Middleware xác thực token
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có token, vui lòng đăng nhập' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Access token đã hết hạn',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw jwtError;
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token không hợp lệ' 
    });
  }
};