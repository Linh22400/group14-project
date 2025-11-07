import React from 'react';
import authService from '../services/authService';
import './UserInfo.css';

const UserInfo = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      // Gọi API logout (tùy chọn)
      const token = authService.getAccessToken();
      if (token) {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      // Xóa token và user khỏi localStorage
      authService.logout();
      // Gọi callback để cập nhật state
      onLogout();
    }
  };

  // Luôn hiển thị với giá trị mặc định, không return null
  const userName = user?.name || 'Đang tải...';
  const userRole = user?.role || 'user';

  return (
    <div className="user-info">
      <div className="user-welcome">
        <span className="user-icon">👤</span>
        <span className="user-name">{userName}</span>
        <span className="user-role">({userRole})</span>
      </div>
      <button 
        onClick={handleLogout}
        className="logout-button"
        title="Đăng xuất"
      >
        <span className="logout-icon">➜</span>
        <span className="logout-text">Đăng xuất</span>
      </button>
    </div>
  );
};

export default UserInfo;