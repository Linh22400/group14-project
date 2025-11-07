import React, { useState, useRef } from 'react';
import authService from '../services/authService';
import { useNotification } from '../contexts/NotificationContext';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatar, onAvatarChange, user }) => {
  const { showNotification } = useNotification();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra file type
    if (!file.type.startsWith('image/')) {
      showNotification('Vui lòng chọn file ảnh', 'error');
      return;
    }

    // Kiểm tra file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File ảnh không được lớn hơn 5MB', 'error');
      return;
    }

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Tự động upload
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file) => {
    setUploading(true);

    try {
      
      const response = await authService.uploadAvatar(file);
      
      
      // Cập nhật avatar
      if (onAvatarChange) {
        onAvatarChange(response.avatar);
      }

      // Clear preview
      setPreview(null);

      // Thông báo thành công
      showNotification('Cập nhật avatar thành công! ✅', 'success');
      
    } catch (error) {
      const errorMsg = error.message || 'Có lỗi xảy ra khi upload avatar';
      console.error('Lỗi upload avatar:', error);
      
      // Hiển thị thông báo chi tiết hơn cho người dùng
      let userErrorMsg = errorMsg;
      if (error.message.includes('Unexpected token')) {
        userErrorMsg = 'Lỗi kết nối server. Vui lòng thử lại sau.';
      } else if (error.message.includes('NetworkError')) {
        userErrorMsg = 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
      } else if (error.message.includes('413')) {
        userErrorMsg = 'File quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.';
      }
      
      showNotification(userErrorMsg, 'error');
    } finally {
      setUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const avatarUrl = preview || getAvatarUrl(currentAvatar);
  const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7imqDvuI88L3RleHQ+Cjwvc3ZnPgo=';

  return (
    <div className="avatar-upload-container">
      <div className="avatar-preview">
        <img 
          src={avatarUrl || defaultAvatar}
          alt="Avatar"
          className={`avatar-image ${uploading ? 'uploading' : ''}`}
        />
        {uploading && (
          <div className="upload-overlay">
            <div className="upload-spinner"></div>
          </div>
        )}
      </div>
      
      <div className="avatar-actions">
        <button 
          onClick={triggerFileInput}
          className="avatar-upload-btn"
          disabled={uploading}
        >
          <span className="btn-icon">📷</span>
          {uploading ? 'Đang upload...' : 'Đổi ảnh đại diện'}
        </button>
        
        {preview && (
          <button 
            onClick={() => setPreview(null)}
            className="avatar-cancel-btn"
            disabled={uploading}
          >
            Hủy
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="avatar-file-input"
        disabled={uploading}
      />
    </div>
  );
};

export default AvatarUpload;