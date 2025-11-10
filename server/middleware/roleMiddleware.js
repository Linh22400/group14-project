// Middleware kiểm tra role của user
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra user có tồn tại trong request (sau khi đã qua auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện thao tác này'
      });
    }

    // Kiểm tra role của user có nằm trong allowedRoles không
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này',
        requiredRoles: allowedRoles,
        yourRole: userRole
      });
    }

    // User có quyền, cho phép tiếp tục
    next();
  };
};

// Helper functions cho các role cụ thể
const requireAdmin = checkRole(['admin']);
const requireModerator = checkRole(['admin', 'moderator']);
const requireUser = checkRole(['user', 'admin', 'moderator']);

// Middleware cho phép admin và moderator truy cập các chức năng quản lý user
const requireModeratorOrAdmin = checkRole(['admin', 'moderator']);

// Middleware kiểm tra moderator không thể thay đổi role của admin
const canModeratorUpdateRole = (req, res, next) => {
  // Nếu là admin thì cho phép tất cả
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Nếu là moderator
  if (req.user.role === 'moderator') {
    const targetRole = req.body.role;
    const targetUserId = req.params.id;
    
    // Moderator chỉ có thể phân quyền user hoặc moderator
    if (targetRole && targetRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Moderator không có quyền phân quyền Admin'
      });
    }
    
    // Không được thay đổi role của chính mình
    if (targetUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể thay đổi role của chính bạn'
      });
    }
  }
  
  next();
};

module.exports = {
  checkRole,
  requireAdmin,
  requireModerator,
  requireUser,
  requireModeratorOrAdmin,
  canModeratorUpdateRole
};