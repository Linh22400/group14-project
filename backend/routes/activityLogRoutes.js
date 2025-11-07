const express = require('express');
const router = express.Router();
const { authenticate: protect, requireAdmin: admin } = require('../middleware/authMiddleware');
const {
  getMyActivityLogs,
  getAllActivityLogs,
  getActivityStats,
  getFailedLoginAttempts,
  exportActivityLogs,
  cleanupOldLogs
} = require('../controllers/activityLogController');

// User routes
router.get('/my-logs', protect, getMyActivityLogs);

// Admin routes
router.get('/admin/all', protect, admin, getAllActivityLogs);
router.get('/admin/stats', protect, admin, getActivityStats);
router.get('/admin/failed-logins', protect, admin, getFailedLoginAttempts);
router.get('/admin/export', protect, admin, exportActivityLogs);
router.delete('/admin/cleanup', protect, admin, cleanupOldLogs);

module.exports = router;