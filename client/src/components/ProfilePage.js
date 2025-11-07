import React, { useState, useEffect } from 'react';
import Profile from './Profile';
import ProfileForm from './ProfileForm';
import authService from '../services/authService';
import './ProfilePage.css';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy user từ authService/localStorage
    const user = authService.getUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedUser) => {
    setCurrentUser(updatedUser);
    setIsEditing(false);
    // Cập nhật trong localStorage và authService
    authService.setUser(updatedUser);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Hiển thị loading trong khi đang load user
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-page-container">
          <div className="loading">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  // Nếu không có user, hiển thị thông báo lỗi
  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="profile-page-container">
          <div className="error-message">
            Vui lòng đăng nhập để xem thông tin cá nhân
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page-container">
        {!isEditing ? (
          <Profile 
            user={currentUser} 
            onUpdateClick={handleEditClick} 
          />
        ) : (
          <ProfileForm 
            user={currentUser} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;