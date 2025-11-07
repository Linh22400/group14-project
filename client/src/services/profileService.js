import authService from './authService';

const API_URL = 'http://localhost:3000/api/profile';

const profileService = {
  // Lấy thông tin profile
  async getProfile() {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('Không có token');
      }

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy thông tin profile');
      }

      return data;
    } catch (error) {
      console.error('Lỗi getProfile:', error);
      throw error;
    }
  },

  // Cập nhật thông tin profile
  async updateProfile(profileData) {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('Không có token');
      }

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi cập nhật profile');
      }

      // Cập nhật thông tin user trong localStorage
      authService.setUser(data.data.user);

      return data;
    } catch (error) {
      console.error('Lỗi updateProfile:', error);
      throw error;
    }
  }
};

export default profileService;