const User = require('../models/User');

// Lấy thông tin profile của user hiện tại
exports.getProfile = async (req, res) => {
  try {
    // Lấy user từ req.user (được gán bởi middleware authenticate)
    const user = req.user;

    // Xử lý URL avatar đầy đủ
    let avatarUrl = user.avatar;
    if (user.avatar && !user.avatar.startsWith('http')) {
      // Chuyển đổi đường dẫn local thành URL đầy đủ
      avatarUrl = `http://localhost:3000/api/${user.avatar.replace(/\\/g, '/')}`;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thông tin profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy thông tin profile' 
    });
  }
};

// Cập nhật thông tin profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email) {
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

    // Kiểm tra email đã tồn tại chưa (trừ email của user hiện tại)
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email đã được sử dụng bởi người dùng khác' 
      });
    }

    // Cập nhật thông tin user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.toLowerCase().trim()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Xử lý URL avatar đầy đủ
    let avatarUrl = updatedUser.avatar;
    if (updatedUser.avatar && !updatedUser.avatar.startsWith('http')) {
      // Chuyển đổi đường dẫn local thành URL đầy đủ
      avatarUrl = `http://localhost:3000/api/${updatedUser.avatar.replace(/\\/g, '/')}`;
    }

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: avatarUrl,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật profile' 
    });
  }
};