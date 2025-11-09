const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

/**
 * Get activity logs for the authenticated user
 * @route GET /api/activity-logs/my-logs
 */
const getMyActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { limit = 50, page = 1, action, startDate, endDate } = req.query;
    
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
    const skip = (parseInt(page) - 1) * limitNum;
    
    // Build query with filters
    const query = { userId };
    
    // Filter by action
    if (action) {
      query.action = action;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        // Set start of day in local timezone
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.timestamp.$gte = start;
      }
      if (endDate) {
        // Set end of day in local timezone
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }
    
    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await ActivityLog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error getting user activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving activity logs'
    });
  }
};

/**
 * Get all activity logs (Admin only)
 * @route GET /api/activity-logs/admin/all
 */
const getAllActivityLogs = async (req, res) => {
  try {
    const { 
      limit = 100, 
      page = 1, 
      userId, 
      action, 
      startDate, 
      endDate,
      success,
      search 
    } = req.query;
    
    const limitNum = Math.min(parseInt(limit), 200); // Max 200 per page for admin
    const skip = (parseInt(page) - 1) * limitNum;
    
    // Build query
    const query = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (action) {
      query.action = action;
    }
    
    // Filter by success status
    if (success !== undefined && success !== '') {
      query.success = success === 'true';
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        // Set start of day in local timezone
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.timestamp.$gte = start;
      }
      if (endDate) {
        // Set end of day in local timezone
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }
    
    // Search functionality
    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      query.$or = [
        { userId: { $in: userIds } },
        { action: { $regex: search, $options: 'i' } },
        { 'details.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const logs = await ActivityLog.find(query)
      .populate('userId', 'username email name role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await ActivityLog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving activity logs'
    });
  }
};

/**
 * Get activity statistics (Admin only)
 * @route GET /api/activity-logs/admin/stats
 */
const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) {
        // Set start of day in local timezone
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchStage.timestamp.$gte = start;
      }
      if (endDate) {
        // Set end of day in local timezone
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.timestamp.$lte = end;
      }
    }
    
    const stats = await ActivityLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get user activity counts
    const userActivity = await ActivityLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          email: '$user.email',
          name: '$user.name',
          activityCount: 1
        }
      }
    ]);
    
    // Get hourly activity distribution
    const hourlyDistribution = await ActivityLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        actionStats: stats,
        topUsers: userActivity,
        hourlyDistribution: hourlyDistribution.map(item => ({
          hour: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error getting activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving activity statistics'
    });
  }
};

/**
 * Get failed login attempts (Admin only)
 * @route GET /api/activity-logs/admin/failed-logins
 */
const getFailedLoginAttempts = async (req, res) => {
  try {
    const { limit = 50, page = 1, ipAddress, email, startDate, endDate } = req.query;
    
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * limitNum;
    
    const query = { action: 'LOGIN_FAILED' };
    
    if (ipAddress) {
      query.ipAddress = ipAddress;
    }
    
    if (email) {
      query['details.email'] = email;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        // Set start of day in local timezone
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.timestamp.$gte = start;
      }
      if (endDate) {
        // Set end of day in local timezone
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }
    
    const logs = await ActivityLog.find(query)
      .populate('userId', 'username email name role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await ActivityLog.countDocuments(query);
    
    // Get unique IPs with their attempt counts
    const ipStats = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$ipAddress',
          attemptCount: { $sum: 1 },
          lastAttempt: { $max: '$timestamp' }
        }
      },
      { $sort: { attemptCount: -1 } },
      { $limit: 20 }
    ]);
    
    res.json({
      success: true,
      data: {
        logs,
        ipStats,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error getting failed login attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving failed login attempts'
    });
  }
};

/**
 * Export activity logs to CSV (Admin only)
 * @route GET /api/activity-logs/admin/export
 */
const exportActivityLogs = async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    const logs = await ActivityLog.find(query)
      .populate('userId', 'username email name role')
      .sort({ timestamp: -1 })
      .lean();
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.json');
      return res.json({ success: true, data: logs });
    }
    
    // Generate CSV
    const csvHeader = 'Timestamp,User,Email,Action,Success,IP Address,Details\n';
    const csvRows = logs.map(log => {
      const user = log.userId || {};
      const timestamp = new Date(log.timestamp).toISOString();
      const userName = user.username || user.name || 'System';
      const userEmail = user.email || 'N/A';
      const success = log.success ? 'Yes' : 'No';
      const details = JSON.stringify(log.details || {}).replace(/"/g, '""');
      
      return `"${timestamp}","${userName}","${userEmail}","${log.action}","${success}","${log.ipAddress || 'N/A'}","${details}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting activity logs'
    });
  }
};

/**
 * Clear old activity logs (Admin only)
 * @route DELETE /api/activity-logs/admin/cleanup
 */
const cleanupOldLogs = async (req, res) => {
  try {
    const { days } = req.query;
    
    // Validate days parameter
    if (!days || isNaN(days) || days < 0 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Days parameter must be between 0 and 365 (0 to delete all logs)'
      });
    }
    
    let query = {};
    if (days > 0) {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      query = { timestamp: { $lt: cutoffDate } };
    }
    
    const result = await ActivityLog.deleteMany(query);
    
    // Log the cleanup
    await ActivityLog.logActivity(
      req.user.id || req.user._id,
      'ADMIN_LOGS_CLEANUP',
      {
        days,
        deletedCount: result.deletedCount,
        cutoffDate: cutoffDate.toISOString()
      },
      req
    );
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} old activity logs`,
      data: {
        deletedCount: result.deletedCount,
        days
      }
    });
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up old activity logs'
    });
  }
};

module.exports = {
  getMyActivityLogs,
  getAllActivityLogs,
  getActivityStats,
  getFailedLoginAttempts,
  exportActivityLogs,
  cleanupOldLogs
};