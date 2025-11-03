const ActivityLog = require('../models/ActivityLog');

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // maximum 5 attempts per window
    blockDuration: 30 * 1000, // block for 30 seconds after max attempts
    skipSuccessfulRequests: false,
    keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown'
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDuration: 24 * 60 * 60 * 1000, // block for 24 hours
    keyGenerator: (req) => req.body.email || req.ip || 'unknown'
  },
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 100, // 100 requests per 15 minutes for general endpoints
    keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown'
  }
};

/**
 * Simple in-memory store for rate limiting
 * In production, consider using Redis or similar
 */
class RateLimitStore {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    return this.store.get(key) || null;
  }

  set(key, data, ttl) {
    this.store.set(key, data);
    if (ttl) {
      setTimeout(() => this.store.delete(key), ttl);
    }
  }

  increment(key, windowMs) {
    const now = Date.now();
    const data = this.get(key) || { count: 0, resetTime: now + windowMs, blockedUntil: null };
    
    // Check if blocked
    if (data.blockedUntil && now < data.blockedUntil) {
      return { ...data, blocked: true };
    }
    
    // Reset if window expired
    if (now > data.resetTime) {
      data.count = 0;
      data.resetTime = now + windowMs;
      data.blockedUntil = null;
    }
    
    data.count++;
    this.set(key, data, windowMs + 1000); // TTL slightly longer than window
    
    return { ...data, blocked: false };
  }

  block(key, blockDuration) {
    const data = this.get(key) || { count: 0, resetTime: Date.now() + 1000 };
    data.blockedUntil = Date.now() + blockDuration;
    this.set(key, data, blockDuration + 1000);
    return data;
  }

  reset(key) {
    this.store.delete(key);
  }
}

const rateLimitStore = new RateLimitStore();

/**
 * Create rate limiting middleware
 * @param {string} type - Type of rate limiting (LOGIN, PASSWORD_RESET, GENERAL)
 * @param {object} options - Custom options to override defaults
 */
const createRateLimiter = (type = 'GENERAL', options = {}) => {
  const config = { ...RATE_LIMIT_CONFIG[type], ...options };
  
  return async (req, res, next) => {
    try {
      const key = config.keyGenerator(req);
      const result = rateLimitStore.increment(key, config.windowMs);
      
      // Check if blocked
      if (result.blocked) {
        const remainingTime = Math.ceil((result.blockedUntil - Date.now()) / 1000);
        
        // Log the blocked attempt
        if (req.body?.email) {
          await ActivityLog.logActivity(
            null,
            'LOGIN_FAILED',
            {
              email: req.body.email,
              reason: 'Rate limit exceeded',
              ipAddress: req.ip || req.connection?.remoteAddress,
              blockedFor: remainingTime
            },
            req
          );
        }
        
        return res.status(429).json({
          success: false,
          message: `Too many attempts. Please try again in ${remainingTime} seconds.`,
          retryAfter: remainingTime
        });
      }
      
      // Check if max attempts reached
      if (result.count > config.maxAttempts) {
        rateLimitStore.block(key, config.blockDuration);
        
        // Log the blocking
        if (req.body?.email) {
          await ActivityLog.logActivity(
            null,
            'ACCOUNT_LOCKED',
            {
              email: req.body.email,
              reason: 'Too many failed login attempts',
              ipAddress: req.ip || req.connection?.remoteAddress,
              attempts: result.count
            },
            req
          );
        }
        
        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts. Account temporarily locked.',
          retryAfter: Math.ceil(config.blockDuration / 1000)
        });
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': config.maxAttempts,
        'X-RateLimit-Remaining': Math.max(0, config.maxAttempts - result.count),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });
      
      // Store attempt count for logging
      res.locals.attemptNumber = result.count;
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Don't block the request if rate limiting fails
      next();
    }
  };
};

/**
 * Specific rate limiters for different endpoints
 */
const loginRateLimiter = createRateLimiter('LOGIN');
const passwordResetRateLimiter = createRateLimiter('PASSWORD_RESET');
const generalRateLimiter = createRateLimiter('GENERAL');

/**
 * Middleware to check if IP is blocked
 */
const checkIfBlocked = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const key = ip;
    const data = rateLimitStore.get(key);
    
    if (data && data.blockedUntil && Date.now() < data.blockedUntil) {
      const remainingTime = Math.ceil((data.blockedUntil - Date.now()) / 1000);
      
      return res.status(423).json({
        success: false,
        message: `Your IP is blocked. Please try again in ${remainingTime} seconds.`,
        retryAfter: remainingTime
      });
    }
    
    next();
  } catch (error) {
    console.error('Block check error:', error);
    next();
  }
};

/**
 * Middleware to reset rate limit for successful login
 */
const resetLoginRateLimit = (req, res, next) => {
  try {
    if (req.user) {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      rateLimitStore.reset(ip);
    }
  } catch (error) {
    console.error('Error resetting rate limit:', error);
  }
  next();
};

/**
 * Middleware to get rate limit status
 */
const getRateLimitStatus = (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const loginData = rateLimitStore.get(ip);
    
    res.json({
      success: true,
      data: {
        ip,
        loginAttempts: loginData?.count || 0,
        maxAttempts: RATE_LIMIT_CONFIG.LOGIN.maxAttempts,
        remainingAttempts: Math.max(0, RATE_LIMIT_CONFIG.LOGIN.maxAttempts - (loginData?.count || 0)),
        isBlocked: loginData?.blockedUntil && Date.now() < loginData?.blockedUntil,
        blockedUntil: loginData?.blockedUntil
      }
    });
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking rate limit status'
    });
  }
};

module.exports = {
  createRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  generalRateLimiter,
  checkIfBlocked,
  resetLoginRateLimit,
  getRateLimitStatus,
  rateLimitStore // Export for testing purposes
};