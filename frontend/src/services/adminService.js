import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AdminService {
  // Lấy danh sách tất cả người dùng (cho admin)
  async getAllUsers() {
    try {
      const response = await fetch(`${API_URL}/admin/users-dev`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
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
  async updateUserRole(email, role) {
    try {
      const response = await fetch(`${API_URL}/admin/update-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
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
      const users = await this.getAllUsers();
      
      const totalUsers = users.length;
      const adminUsers = users.filter(user => user.role === 'admin').length;
      const regularUsers = totalUsers - adminUsers;
      
      // Tính số người dùng đăng ký trong 7 ngày gần đây
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUsers = users.filter(user => 
        new Date(user.createdAt) >= sevenDaysAgo
      ).length;

      return {
        totalUsers,
        adminUsers,
        regularUsers,
        recentUsers,
        adminPercentage: totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0,
        userPercentage: totalUsers > 0 ? Math.round((regularUsers / totalUsers) * 100) : 0
      };
    } catch (error) {
      console.error('Lỗi khi tính thống kê:', error);
      throw error;
    }
  }

  // Xóa người dùng (admin chức năng)
  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
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
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo người dùng');
      }

      return data;
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error);
      throw error;
    }
  }
}

export default new AdminService();