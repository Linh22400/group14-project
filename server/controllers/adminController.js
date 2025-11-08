const User = require('../models/User');

// Endpoint đặc biệt để cập nhật role (chỉ dùng cho development)
exports.updateRole = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email và role là bắt buộc' 
      });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role phải là user hoặc admin' 
      });
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy user với email này' 
      });
    }

    res.json({
      success: true,
      message: `Cập nhật role thành ${role} thành công`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Lỗi cập nhật role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật role' 
    });
  }
};

// Endpoint để xem tất cả users (cho development)
exports.getAllUsersDev = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy danh sách users' 
    });
  }
};