import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class AdminService {
  // Lấy danh sách tất cả người dùng (cho admin)
  async getAllUsers() {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${authService.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách người dùng');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  }

  // Cập nhật vai trò người dùng
  async updateUserRole(userId, role) {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật vai trò');
      }

      return data;
    } catch (error) {
      console.error('Lỗi khi cập nhật vai trò:', error);
      throw error;
    }
  }

  // Lấy thống kê người dùng
  async getUserStats() {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('Không có token xác thực');
      }

      const response = await fetch(`${API_URL}/api/admin/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định' }));
        throw new Error(errorData.message || `Lỗi HTTP ${response.status}`);
      }

      const result = await response.json();
      const backendData = result.data || {};
      
      // Transform backend data format to frontend expected format
      const roleStats = backendData.roleStats || [];
      const adminUsers = roleStats.find(stat => stat._id === 'admin')?.count || 0;
      const userUsers = roleStats.find(stat => stat._id === 'user')?.count || 0;
      const moderatorUsers = roleStats.find(stat => stat._id === 'moderator')?.count || 0;
      
      return {
        totalUsers: backendData.totalUsers || 0,
        adminUsers,
        moderatorUsers, // Số lượng kiểm duyệt viên riêng biệt
        userUsers, // Số lượng người dùng thường riêng biệt
        regularUsers: userUsers + moderatorUsers, // Tổng user thường (để tương thích ngược)
        recentUsers: 0, // Backend không cung cấp, đặt là 0
        adminPercentage: backendData.totalUsers > 0 ? Math.round((adminUsers / backendData.totalUsers) * 100) : 0,
        moderatorPercentage: backendData.totalUsers > 0 ? Math.round((moderatorUsers / backendData.totalUsers) * 100) : 0,
        userPercentage: backendData.totalUsers > 0 ? Math.round((userUsers / backendData.totalUsers) * 100) : 0
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê:', error);
      throw error;
    }
  }

  // Lấy thống kê người dùng từ danh sách (local calculation fallback)
  async calculateUserStats() {
    try {
      const users = await this.getAllUsers();
      
      const totalUsers = users.length;
      const adminUsers = users.filter(user => user.role === 'admin').length;
      const moderatorUsers = users.filter(user => user.role === 'moderator').length;
      const userUsers = users.filter(user => user.role === 'user').length;
      const regularUsers = userUsers + moderatorUsers;
      
      // Tính số người dùng đăng ký trong 7 ngày gần đây
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUsers = users.filter(user => 
        new Date(user.createdAt) >= sevenDaysAgo
      ).length;

      return {
        totalUsers,
        adminUsers,
        moderatorUsers,
        userUsers,
        regularUsers,
        recentUsers,
        adminPercentage: totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0,
        userPercentage: totalUsers > 0 ? Math.round((regularUsers / totalUsers) * 100) : 0,
        moderatorPercentage: totalUsers > 0 ? Math.round((moderatorUsers / totalUsers) * 100) : 0
      };
    } catch (error) {
      console.error('Lỗi khi tính thống kê:', error);
      throw error;
    }
  }

  // Xóa người dùng (admin chức năng)
  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xóa người dùng');
      }

      return data;
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      throw error;
    }
  }

  // Tạo người dùng mới (admin chức năng)
  async createUser(userData) {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('Không có token xác thực');
      }

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Lỗi HTTP ${response.status}`);
      }

      return data.data;
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error);
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService;