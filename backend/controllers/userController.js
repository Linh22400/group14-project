const User = require('../models/User');

// Lấy danh sách tất cả users (chỉ admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách users'
    });
  }
};

// Lấy chi tiết user theo ID (chỉ admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết user'
    });
  }
};

// Cập nhật role của user (chỉ admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Validate role
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ. Các role hợp lệ: user, admin, moderator'
      });
    }

    // Không cho phép thay đổi role của chính mình
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể thay đổi role của chính bạn'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật role thành công',
      data: user
    });
  } catch (error) {
    console.error('Lỗi cập nhật role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật role'
    });
  }
};

// Thống kê users (chỉ admin)
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        totalUsers,
        roleStats: stats
      }
    });
  } catch (error) {
    console.error('Lỗi thống kê users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thống kê users'
    });
  }
};

exports.getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('-password');
    // Mapping MongoDB _id sang id cho nhất quán với auth response
    const mappedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    res.json(mappedUsers);
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Tên, email và mật khẩu là bắt buộc' 
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng'
      });
    }
    
    const user = await User.create({ name, email, password });
    
    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) { 
    console.error('Lỗi tạo user:', err);
    
    // Xử lý các lỗi cụ thể
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo người dùng'
    });
  }
};

// ===== UPDATE USER =====
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body || {};
    
    if (!name && !email) {
      return res.status(400).json({ message: 'nothing to update' });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { ...(name && { name }), ...(email && { email }) } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'user not found' });
    // Mapping response giống getUsers
    res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  } catch (err) { next(err); }
};

// ===== DELETE USER =====
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'user not found' });

    res.json({ 
      message: 'User deleted successfully', 
      id: deleted._id,
      name: deleted.name,
      email: deleted.email
    });
  } catch (err) { next(err); }
};
