import React from 'react';
import '../styles/avatar.css';

const Avatar = ({ user, size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg'
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    
    // Nếu là URL đầy đủ (http/https)
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL
    return `${process.env.REACT_APP_API_URL || ''}${avatar}`;
  };

  const avatarUrl = getAvatarUrl(user?.avatar);

  return (
    <div className={`avatar-container ${sizeClasses[size]} ${className}`}>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={user?.name}
          className="avatar-image"
          onError={(e) => {
            // Nếu ảnh lỗi, hiển thị chữ cái đầu
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      {/* Fallback: hiển thị chữ cái đầu nếu không có avatar hoặc avatar bị lỗi */}
      <div 
        className="avatar-fallback"
        style={{ display: avatarUrl ? 'none' : 'flex' }}
      >
        {getInitials(user?.name)}
      </div>
    </div>
  );
};

export default Avatar;