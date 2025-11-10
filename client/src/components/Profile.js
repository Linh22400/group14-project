import React, { useState, useEffect, useCallback } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    match: false,
    duplicate: false
  });

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      setError('Vui lòng kiểm tra lại thông tin mật khẩu');
      return;
    }

    try {
      setChangingPassword(true);
      setError('');
      
      const response = await fetch(buildApiUrl('/api/profile/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        // Reset form
        setShowPasswordReset(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Không thể đổi mật khẩu');
      }
    } catch (error) {
      setError('Lỗi khi đổi mật khẩu');
      console.error('Lỗi đổi mật khẩu:', error);
    } finally {
      setChangingPassword(false);
    }
  };



  const handleCancelReset = () => {
    setShowPasswordReset(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setPasswordErrors({ length: false, match: false, duplicate: false });
  };

  // Validation functions
  const validatePasswords = useCallback(() => {
    const errors = {
      length: newPassword.length > 0 && newPassword.length < 6,
      match: newPassword && confirmPassword && newPassword !== confirmPassword,
      duplicate: currentPassword && newPassword && currentPassword === newPassword
    };
    setPasswordErrors(errors);
    return !errors.length && !errors.match && !errors.duplicate;
  }, [currentPassword, newPassword, confirmPassword]);

  useEffect(() => {
    if (showPasswordReset) {
      validatePasswords();
    }
  }, [currentPassword, newPassword, confirmPassword, showPasswordReset, validatePasswords]);



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

          {/* Password Change Section */}
          <div className="password-change-section">
            {!showPasswordReset ? (
              <button 
                onClick={() => setShowPasswordReset(true)} 
                className="change-password-button"
              >
                🔒 Đổi mật khẩu
              </button>
            ) : (
              <div className="password-change-form">
                <h3>Đổi mật khẩu</h3>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label>Mật khẩu hiện tại:</label>
                  <div className="password-input-container">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="password-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới:</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      className="password-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.length && newPassword.length > 0 && (
                    <span className="validation-error">Mật khẩu phải có ít nhất 6 ký tự</span>
                  )}
                  {passwordErrors.duplicate && newPassword.length > 0 && (
                    <span className="validation-error">Mật khẩu mới phải khác mật khẩu hiện tại</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới:</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="password-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.match && confirmPassword.length > 0 && (
                    <span className="validation-error">Mật khẩu xác nhận không khớp</span>
                  )}
                </div>

                <div className="change-form-actions">
                  <button 
                    onClick={handleChangePassword}
                    className="confirm-change-button"
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                  </button>
                  <button 
                    onClick={handleCancelReset}
                    className="cancel-change-button"
                    disabled={changingPassword}
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