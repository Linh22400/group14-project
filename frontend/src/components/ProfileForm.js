import React, { useState, useEffect } from 'react';
import profileService from '../services/profileService';
import { useNotification } from '../contexts/NotificationContext';
import AvatarUpload from './AvatarUpload';
import './ProfileForm.css';

const ProfileForm = ({ user, onSave, onCancel }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');
      
      const response = await profileService.updateProfile(formData);
      
      const successMsg = 'Cập nhật thông tin thành công!';
      setSuccessMessage(successMsg);
      showNotification(successMsg, 'success');
      
      // Gọi callback onSave để cập nhật parent component
      if (onSave) {
        onSave(response.data.user);
      }
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Lỗi khi cập nhật profile:', error);
      
      if (error.message.includes('Email đã được sử dụng')) {
        const errorMsg = 'Email này đã được sử dụng bởi người dùng khác';
        setErrors({ email: errorMsg });
        showNotification(errorMsg, 'error');
      } else {
        const errorMsg = error.message || 'Có lỗi xảy ra khi cập nhật thông tin';
        setErrors({ general: errorMsg });
        showNotification(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form về giá trị ban đầu
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
    setErrors({});
    setSuccessMessage('');
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="profile-form-container">
      <div className="profile-form-card">
        <div className="form-header">
          <h2>Chỉnh sửa thông tin cá nhân</h2>
          <p>Cập nhật thông tin của bạn</p>
        </div>

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group avatar-group">
            <label>Ảnh đại diện</label>
            <AvatarUpload 
              currentAvatar={user?.avatar}
              onAvatarChange={(newAvatar) => {
                // Cập nhật avatar trong form data
                const updatedUser = { ...user, avatar: newAvatar };
                if (onSave) {
                  onSave(updatedUser);
                }
              }}
              user={user}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Họ tên *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Nhập họ tên của bạn"
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Nhập email của bạn"
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;