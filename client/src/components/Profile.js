import React, { useState, useEffect, useCallback } from 'react';
import profileService from '../services/profileService';
import authService from '../services/authService';
import { useNotification } from '../contexts/NotificationContext';
import AvatarUpload from './AvatarUpload';
import { buildApiUrl } from '../config/api';
import './Profile.css';

const Profile = ({ onUpdateClick }) => {
  const { showNotification } = useNotification(); // eslint-disable-line no-unused-vars
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Helper function để xử lý avatar URL
  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    
    // Nếu đã là data URL hoặc http URL, giữ nguyên
    if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL
    return `${buildApiUrl('')}/api/${avatarUrl.replace(/\\/g, '/')}`;
  };

  const fetchProfile = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleRefresh = () => {
    fetchProfile();
  };

  const handleSendResetCode = async () => {
    try {
      setSendingCode(true);
      setError('');
      
      const response = await fetch(buildApiUrl('/api/profile/send-reset-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        setShowPasswordReset(true);
      } else {
        setError(data.message || 'Không thể gửi mã xác nhận');
      }
    } catch (error) {
      setError('Lỗi khi gửi mã xác nhận');
      console.error('Lỗi gửi mã xác nhận:', error);
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setResettingPassword(true);
      setError('');
      
      const response = await fetch(buildApiUrl('/api/profile/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`
        },
        body: JSON.stringify({
          resetCode,
          newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        // Reset form
        setShowPasswordReset(false);
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (error) {
      setError('Lỗi khi đặt lại mật khẩu');
      console.error('Lỗi đặt lại mật khẩu:', error);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCancelReset = () => {
    setShowPasswordReset(false);
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
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

          {/* Password Reset Section */}
          <div className="password-reset-section">
            {!showPasswordReset ? (
              <button 
                onClick={handleSendResetCode} 
                className="reset-password-button"
                disabled={sendingCode}
              >
                {sendingCode ? 'Đang gửi mã...' : '🔒 Đặt lại mật khẩu'}
              </button>
            ) : (
              <div className="password-reset-form">
                <h3>Đặt lại mật khẩu</h3>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label>Mã xác nhận (4 chữ số):</label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Nhập mã từ email"
                    maxLength="4"
                    className="reset-code-input"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    className="password-input"
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="password-input"
                  />
                </div>

                <div className="reset-form-actions">
                  <button 
                    onClick={handleResetPassword}
                    className="confirm-reset-button"
                    disabled={resettingPassword}
                  >
                    {resettingPassword ? 'Đang xử lý...' : 'Xác nhận đặt lại'}
                  </button>
                  <button 
                    onClick={handleCancelReset}
                    className="cancel-reset-button"
                    disabled={resettingPassword}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;