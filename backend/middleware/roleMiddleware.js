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

module.exports = {
  checkRole,
  requireAdmin,
  requireModerator,
  requireUser
};