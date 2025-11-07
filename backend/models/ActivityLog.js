const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Cho phép null cho các trường hợp như login failed
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'REGISTER', 
      'PROFILE_UPDATE', 'AVATAR_UPDATE', 'PASSWORD_CHANGE',
      'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS',
      'ADMIN_USER_CREATE', 'ADMIN_USER_UPDATE', 'ADMIN_USER_DELETE',
      'ROLE_UPDATE', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function(userId, action, details = {}, req = null) {
  try {
    const logData = {
      action,
      details,
      success: !action.includes('FAILED') && !action.includes('FAILED')
    };

    // Chỉ thêm userId nếu có giá trị
    if (userId) {
      logData.userId = userId;
    }

    // Add IP and user agent if request object is provided
    if (req) {
      logData.ipAddress = req.ip || req.connection?.remoteAddress || null;
      logData.userAgent = req.get('User-Agent') || null;
    }

    return await this.create(logData);
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

// Static method to get recent activities
activityLogSchema.statics.getRecentActivities = async function(userId, limit = 50) {
  try {
    return await this.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'username email name')
      .lean();
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }
};

// Static method to get activities for admin
activityLogSchema.statics.getActivitiesForAdmin = async function(filters = {}, limit = 100) {
  try {
    const query = {};
    
    if (filters.userId) {
      query.userId = filters.userId;
    }
    
    if (filters.action) {
      query.action = filters.action;
    }
    
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp.$lte = new Date(filters.endDate);
      }
    }

    return await this.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'username email name role')
      .lean();
  } catch (error) {
    console.error('Error getting activities for admin:', error);
    return [];
  }
};

// Static method to get failed login attempts
activityLogSchema.statics.getFailedLoginAttempts = async function(ipAddress, timeWindow = 15) {
  try {
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000); // timeWindow minutes ago
    
    return await this.find({
      action: 'LOGIN_FAILED',
      ipAddress: ipAddress,
      timestamp: { $gte: startTime }
    }).countDocuments();
  } catch (error) {
    console.error('Error getting failed login attempts:', error);
    return 0;
  }
};

// Static method to cleanup old logs (keep last 90 days)
activityLogSchema.statics.cleanupOldLogs = async function() {
  try {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = await this.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    console.log(`Cleaned up ${result.deletedCount} old activity logs`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    return 0;
  }
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);