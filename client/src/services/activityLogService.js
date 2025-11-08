import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  // Lấy accessToken trực tiếp từ localStorage
  return localStorage.getItem('accessToken');
};

// Create axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Không tự động redirect nữa - để component xử lý
    return Promise.reject(error);
  }
);

/**
 * Get current user's activity logs
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Activity logs data
 */
export const getMyActivityLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/activity-logs/my-logs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my activity logs:', error);
    throw error;
  }
};

/**
 * Get all activity logs (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} All activity logs data
 */
export const getAllActivityLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/activity-logs/admin/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all activity logs:', error);
    throw error;
  }
};

/**
 * Get activity statistics (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Activity statistics
 */
export const getActivityStats = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/activity-logs/admin/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    throw error;
  }
};

/**
 * Get failed login attempts (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Failed login attempts data
 */
export const getFailedLoginAttempts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/activity-logs/admin/failed-logins', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching failed login attempts:', error);
    throw error;
  }
};

/**
 * Export activity logs (Admin only)
 * @param {Object} params - Export parameters
 * @param {string} format - Export format ('csv' or 'json')
 * @returns {Promise<Blob>} Exported file
 */
export const exportActivityLogs = async (params = {}, format = 'csv') => {
  try {
    const response = await axiosInstance.get('/activity-logs/admin/export', {
      params: { ...params, format },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `activity-logs.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Export successful' };
  } catch (error) {
    console.error('Error exporting activity logs:', error);
    throw error;
  }
};

/**
 * Cleanup old activity logs (Admin only)
 * @param {number} days - Number of days to keep
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupOldLogs = async (days) => {
  try {
    const response = await axiosInstance.delete('/activity-logs/admin/cleanup', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    throw error;
  }
};

/**
 * Format activity log for display
 * @param {Object} log - Activity log object
 * @returns {Object} Formatted log
 */
export const formatActivityLog = (log) => {
  const actionLabels = {
    'LOGIN': 'Đăng nhập',
    'LOGOUT': 'Đăng xuất',
    'LOGIN_FAILED': 'Đăng nhập thất bại',
    'REGISTER': 'Đăng ký',
    'PROFILE_UPDATE': 'Cập nhật hồ sơ',
    'AVATAR_UPDATE': 'Cập nhật ảnh đại diện',
    'PASSWORD_CHANGE': 'Thay đổi mật khẩu',
    'PASSWORD_RESET_REQUEST': 'Yêu cầu đặt lại mật khẩu',
    'PASSWORD_RESET_SUCCESS': 'Đặt lại mật khẩu thành công',
    'ADMIN_USER_CREATE': 'Tạo người dùng (Admin)',
    'ADMIN_USER_UPDATE': 'Cập nhật người dùng (Admin)',
    'ADMIN_USER_DELETE': 'Xóa người dùng (Admin)',
    'ROLE_UPDATE': 'Cập nhật vai trò',
    'ACCOUNT_LOCKED': 'Tài khoản bị khóa',
    'ACCOUNT_UNLOCKED': 'Tài khoản được mở khóa'
  };

  return {
    ...log,
    actionLabel: actionLabels[log.action] || log.action,
    formattedTimestamp: new Date(log.timestamp).toLocaleString('vi-VN'),
    userDisplay: log.userId ? (log.userId.name || log.userId.username || 'Unknown') : 'System',
    userEmail: log.userId ? (log.userId.email || 'N/A') : 'N/A'
  };
};

/**
 * Get action color for UI display
 * @param {string} action - Action type
 * @returns {string} Color class
 */
export const getActionColor = (action) => {
  const colorMap = {
    'LOGIN': 'success',
    'LOGOUT': 'info',
    'LOGIN_FAILED': 'danger',
    'REGISTER': 'success',
    'PROFILE_UPDATE': 'primary',
    'AVATAR_UPDATE': 'primary',
    'PASSWORD_CHANGE': 'warning',
    'PASSWORD_RESET_REQUEST': 'warning',
    'PASSWORD_RESET_SUCCESS': 'success',
    'ADMIN_USER_CREATE': 'dark',
    'ADMIN_USER_UPDATE': 'dark',
    'ADMIN_USER_DELETE': 'danger',
    'ROLE_UPDATE': 'warning',
    'ACCOUNT_LOCKED': 'danger',
    'ACCOUNT_UNLOCKED': 'success'
  };

  return colorMap[action] || 'secondary';
};

const activityLogService = {
  getMyActivityLogs,
  getAllActivityLogs,
  getActivityStats,
  getFailedLoginAttempts,
  exportActivityLogs,
  cleanupOldLogs,
  formatActivityLog,
  getActionColor
};

export default activityLogService;