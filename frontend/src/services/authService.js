// Auth service để quản lý authentication
class AuthService {
  constructor() {
    this.token = this.getToken();
    this.user = this.getUser();
  }

  // Lưu token vào localStorage
  setToken(token) {
    localStorage.setItem('token', token);
    this.token = token;
  }

  // Lấy token từ localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Xóa token khỏi localStorage
  removeToken() {
    localStorage.removeItem('token');
    this.token = null;
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

  // Kiểm tra user đã đăng nhập chưa
  isAuthenticated() {
    return !!this.token;
  }

  // Đăng xuất
  logout() {
    this.removeToken();
    this.removeUser();
  }

  // Lấy headers cho API calls
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
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
  async resetPassword(token, password) {
    const response = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Có lỗi xảy ra');
    }

    return await response.json();
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

  // Upload avatar
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('http://localhost:3000/api/upload-avatar', {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = 'Có lỗi xảy ra khi upload avatar';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
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

    const result = await response.json();
    
    // Đảm bảo avatar URL được trả về đầy đủ
    if (result.avatar && !result.avatar.startsWith('http')) {
      result.avatar = `http://localhost:3000/api/${result.avatar.replace(/\\/g, '/')}`;
    }
    
    return result;
  }
}

export default new AuthService();