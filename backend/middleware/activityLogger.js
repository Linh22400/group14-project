const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware to log user activities
 * @param {string} action - The action to log
 * @param {object} details - Additional details about the action
 * @param {boolean} requireAuth - Whether authentication is required
 */
const logActivity = (action, details = {}, requireAuth = true) => {
  return async (req, res, next) => {
    try {
      // Skip if authentication is required but user is not authenticated
      if (requireAuth && (!req.user || !req.user.id)) {
        return next();
      }

      const userId = req.user?.id || req.user?._id;
      
      // Only log if we have a user ID or it's a failed login attempt
      if (userId || action === 'LOGIN_FAILED') {
        await ActivityLog.logActivity(
          userId || null, 
          action, 
          { 
            ...details,
            originalUrl: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode
          }, 
          req
        );
      }
    } catch (error) {
      console.error('Error in activity logging middleware:', error);
      // Don't block the request if logging fails
    }
    
    next();
  };
};

/**
 * Middleware to log successful login
 */
const logSuccessfulLogin = async (req, res, next) => {
  // This should be called after authentication is successful
  if (req.user) {
    try {
      await ActivityLog.logActivity(
        req.user.id || req.user._id,
        'LOGIN',
        {
          loginMethod: 'password',
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection?.remoteAddress
        },
        req
      );
    } catch (error) {
      console.error('Error logging successful login:', error);
    }
  }
  next();
};

/**
 * Middleware to log failed login attempts
 */
const logFailedLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    await ActivityLog.logActivity(
      null, // No user ID for failed login
      'LOGIN_FAILED',
      {
        email: email || 'unknown',
        reason: res.locals.loginError || 'Invalid credentials',
        ipAddress: req.ip || req.connection?.remoteAddress
      },
      req
    );
  } catch (error) {
    console.error('Error logging failed login:', error);
  }
  next();
};

/**
 * Middleware to log logout
 */
const logLogout = async (req, res, next) => {
  if (req.user) {
    try {
      await ActivityLog.logActivity(
        req.user.id || req.user._id,
        'LOGOUT',
        {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection?.remoteAddress
        },
        req
      );
    } catch (error) {
      console.error('Error logging logout:', error);
    }
  }
  next();
};

/**
 * Middleware to log registration
 */
const logRegistration = async (req, res, next) => {
  // This should be called after successful registration
  if (req.user) {
    try {
      await ActivityLog.logActivity(
        req.user.id || req.user._id,
        'REGISTER',
        {
          email: req.user.email,
          name: req.user.name,
          registrationMethod: 'email'
        },
        req
      );
    } catch (error) {
      console.error('Error logging registration:', error);
    }
  }
  next();
};

/**
 * Middleware to automatically log CRUD operations
 */
const autoLogActivity = (req, res, next) => {
  // Store original send method
  const originalSend = res.send;
  
  res.send = function(data) {
    // Restore original send
    res.send = originalSend;
    
    // Log the activity after response is sent
    setImmediate(async () => {
      try {
        if (req.user) {
          const userId = req.user.id || req.user._id;
          const method = req.method;
          const path = req.path;
          
          let action = 'UNKNOWN';
          let details = {
            method,
            path,
            statusCode: res.statusCode
          };
          
          // Determine action based on method and path
          if (method === 'POST' && path.includes('login')) {
            action = 'LOGIN';
          } else if (method === 'POST' && path.includes('register')) {
            action = 'REGISTER';
          } else if (method === 'PUT' && path.includes('profile')) {
            action = 'PROFILE_UPDATE';
          } else if (method === 'POST' && path.includes('avatar')) {
            action = 'AVATAR_UPDATE';
          } else if (method === 'POST' && path.includes('password')) {
            action = 'PASSWORD_CHANGE';
          }
          
          if (action !== 'UNKNOWN') {
            await ActivityLog.logActivity(userId, action, details, req);
          }
        }
      } catch (error) {
        console.error('Error in auto activity logging:', error);
      }
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  logActivity,
  logSuccessfulLogin,
  logFailedLogin,
  logLogout,
  logRegistration,
  autoLogActivity
};