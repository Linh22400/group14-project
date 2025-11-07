// Auth service để quản lý authentication
class AuthService {
  constructor() {
    this.accessToken = this.getAccessToken();
    this.refreshToken = this.getRefreshToken();
    this.user = this.getUser();
    this.isRefreshing = false; // Flag để tránh multiple refresh calls
    this.refreshSubscribers = []; // Queue cho các requests đang chờ refresh
  }

  // Lưu access token vào localStorage
  setAccessToken(token) {
    localStorage.setItem('accessToken', token);
    this.accessToken = token;
  }

  // Lấy access token từ localStorage
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  // Xóa access token khỏi localStorage
  removeAccessToken() {
    localStorage.removeItem('accessToken');
    this.accessToken = null;
  }

  // Lưu refresh token vào localStorage
  setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
    this.refreshToken = token;
  }

  // Lấy refresh token từ localStorage
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Xóa refresh token khỏi localStorage
  removeRefreshToken() {
    localStorage.removeItem('refreshToken');
    this.refreshToken = null;
  }

  // Lưu thông tin user
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user;
  }

  // Lấy thông tin user
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Xóa thông tin user
  removeUser() {
    localStorage.removeItem('user');
    this.user = null;
  }

  // Cập nhật role của user hiện tại
  updateUserRole(newRole) {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      this.setUser(updatedUser);
      return updatedUser;
    }
    return null;
  }

  // Kiểm tra user đã đăng nhập chưa
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Đăng xuất
  logout() {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Refresh token failed');
      }

      const result = await response.json();
      this.setAccessToken(result.data.accessToken);
      
      return result.data.accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Nếu refresh thất bại, logout user
      this.logout();
      throw error;
    }
  }

  // Subscribe to token refresh
  subscribeTokenRefresh(callback) {
    this.refreshSubscribers.push(callback);
  }

  // Notify all subscribers that token has been refreshed
  onTokenRefreshed(newToken) {
    this.refreshSubscribers.forEach(callback => callback(newToken));
    this.refreshSubscribers = [];
  }

  // Hàm để retry request sau khi refresh token
  async retryRequest(url, options, retryCount = 0) {
    if (retryCount > 1) {
      throw new Error('Max retry attempts reached');
    }

    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        const errorData = await response.json();
        
        if (errorData.code === 'TOKEN_EXPIRED') {
          // Token hết hạn, thử refresh
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            
            try {
              const newToken = await this.refreshAccessToken();
              this.onTokenRefreshed(newToken);
              
              // Retry request với token mới
              options.headers = options.headers || {};
              options.headers['Authorization'] = `Bearer ${newToken}`;
              
              return await this.retryRequest(url, options, retryCount + 1);
            } finally {
              this.isRefreshing = false;
            }
          } else {
            // Đang refresh, chờ token mới
            return new Promise((resolve, reject) => {
              this.subscribeTokenRefresh(async (newToken) => {
                try {
                  options.headers = options.headers || {};
                  options.headers['Authorization'] = `Bearer ${newToken}`;
                  const response = await fetch(url, options);
                  resolve(response);
                } catch (error) {
                  reject(error);
                }
              });
            });
          }
        }
      }
      
      return response;
    } catch (error) {
      if (retryCount === 0) {
        return this.retryRequest(url, options, 1);
      }
      throw error;
    }
  }

  // Lấy headers cho API calls
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : ''
    };
  }

  // API call với tự động refresh token
  async authenticatedFetch(url, options = {}) {
    // Thêm auth headers
    options.headers = {
      ...options.headers,
      ...this.getAuthHeaders()
    };

    // Thực hiện request với retry mechanism
    const response = await this.retryRequest(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response;
  }

  // Quên mật khẩu
  async forgotPassword(email) {
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Có lỗi xảy ra');
    }

    return await response.json();
  }

  // Đặt lại mật khẩu
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        let errorMessage = 'Có lỗi xảy ra khi đặt lại mật khẩu';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Nếu không parse được JSON, lấy text hoặc status
          try {
            const text = await response.text();
            errorMessage = text || `Lỗi ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Có lỗi xảy ra khi kết nối với server');
      }
    }
  }

  // Xác thực mã 4 chữ số và đặt lại mật khẩu
  async verifyResetCode(email, resetCode, newPassword) {
    const response = await fetch('http://localhost:3000/api/auth/verify-reset-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, resetCode, newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Có lỗi xảy ra');
    }

    return await response.json();
  }

  // Login
  async login(email, password) {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    
    // Lưu cả access token và refresh token
    this.setAccessToken(result.data.accessToken);
    this.setRefreshToken(result.data.refreshToken);
    this.setUser(result.data.user);

    return result;
  }

  // Upload avatar
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.authenticatedFetch('http://localhost:3000/api/upload-avatar', {
      method: 'POST',
      body: formData
      // Không set Content-Type để browser tự động set với boundary
    });

    const result = await response.json();
    
    // Đảm bảo avatar URL được trả về đầy đủ
    if (result.avatar && !result.avatar.startsWith('http')) {
      result.avatar = `http://localhost:3000/api/${result.avatar.replace(/\\/g, '/')}`;
    }
    
    return result;
  }

  // Signup
  async signup(name, email, password) {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const result = await response.json();
    
    // Lưu cả access token và refresh token
    this.setAccessToken(result.data.accessToken);
    this.setRefreshToken(result.data.refreshToken);
    this.setUser(result.data.user);

    return result;
  }
}

export default new AuthService();