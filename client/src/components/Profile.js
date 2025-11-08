import React, { useState, useEffect } from 'react';
import profileService from '../services/profileService';
import authService from '../services/authService';
import { useNotification } from '../contexts/NotificationContext';
import AvatarUpload from './AvatarUpload';
import './Profile.css';

const Profile = ({ onUpdateClick }) => {
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function để xử lý avatar URL
  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    
    // Nếu đã là data URL hoặc http URL, giữ nguyên
    if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL
    return `http://localhost:3000/api/${avatarUrl.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await profileService.getProfile();
      const userData = response.data.user;
      
      // Đảm bảo avatar URL được xử lý đúng
      if (userData.avatar && !userData.avatar.startsWith('data:') && !userData.avatar.startsWith('http')) {
        // Nếu avatar là đường dẫn tương đối, thêm base URL
        userData.avatar = getAvatarUrl(userData.avatar);
      }
      
      setUser(userData);
      
      // Cập nhật localStorage với dữ liệu mới nhất
      authService.setUser(userData);
    } catch (error) {
      setError(error.message || 'Không thể lấy thông tin profile');
      console.error('Lỗi khi lấy profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchProfile();
  };

  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    // Kiểm tra file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File ảnh không được lớn hơn 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      
      const response = await authService.uploadAvatar(file);
      
      
      // Cập nhật avatar trong user data
      const updatedUser = {
        ...user,
        avatar: response.avatar
      };
      setUser(updatedUser);

      // Cập nhật trong localStorage
      authService.setUser(updatedUser);

      // Thông báo thành công
      showNotification('Cập nhật avatar thành công! ✅', 'success');
      setError(''); // Clear any previous errors
      
    } catch (error) {
      const errorMsg = error.message || 'Có lỗi xảy ra khi upload avatar';
      setError(errorMsg);
      console.error('Lỗi upload avatar:', error);
      
      // Hiển thị thông báo chi tiết hơn cho người dùng
      let userErrorMsg = errorMsg;
      if (error.message.includes('Unexpected token')) {
        userErrorMsg = 'Lỗi kết nối server. Vui lòng thử lại sau.';
        setError(userErrorMsg);
      } else if (error.message.includes('NetworkError')) {
        userErrorMsg = 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
        setError(userErrorMsg);
      } else if (error.message.includes('413')) {
        userErrorMsg = 'File quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.';
        setError(userErrorMsg);
      }
      
      showNotification(userErrorMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
        <button onClick={handleRefresh} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">Không tìm thấy thông tin người dùng</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Thông tin cá nhân</h2>
          <div className="profile-actions">
            <button onClick={onUpdateClick} className="edit-button">
              ✏️ Chỉnh sửa
            </button>
            <button onClick={handleRefresh} className="refresh-button">
              🔄 Làm mới
            </button>
          </div>
        </div>

        <div className="profile-content">
          <div className="avatar-section">
            <AvatarUpload 
              currentAvatar={user.avatar}
              onAvatarChange={(newAvatar) => {
                const updatedUser = { ...user, avatar: newAvatar };
                setUser(updatedUser);
                authService.setUser(updatedUser);
              }}
              user={user}
            />
          </div>

          <div className="info-group">
            <label>Họ tên:</label>
            <span className="info-value">{user.name}</span>
          </div>

          <div className="info-group">
            <label>Email:</label>
            <span className="info-value">{user.email}</span>
          </div>

          <div className="info-group">
            <label>Vai trò:</label>
            <span className="info-value role-badge">{user.role}</span>
          </div>

          <div className="info-group">
            <label>Ngày tạo:</label>
            <span className="info-value">
              {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <div className="info-group">
            <label>Cập nhật lần cuối:</label>
            <span className="info-value">
              {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;