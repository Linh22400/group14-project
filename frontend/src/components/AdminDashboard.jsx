import React, { useState, useEffect } from 'react';
import UserList from './UserList';
import AddUser from './AddUser';
import authService from '../services/authService';

const AdminDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Kiểm tra quyền admin
  const isAdmin = () => {
    const user = authService.getUser();
    console.log('User data:', user); // Debug: xem user data
    console.log('User role:', user?.role); // Debug: xem role
    console.log('Is admin check:', user && user.role === 'admin'); // Debug: kiểm tra điều kiện
    return user && user.role === 'admin';
  };

  // Hiển thị thông báo
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    // Tự động ẩn thông báo sau 5 giây
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Refresh danh sách user
  const handleUserAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Đóng thông báo
  const closeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isAdmin()) {
    return (
      <div className="admin-error">
        <div className="error-content">
          <h2>🚫 Truy cập bị từ chối</h2>
          <p>Bạn cần quyền Admin để truy cập trang này.</p>
          <button onClick={() => window.location.href = '/login'} className="login-btn">
            Đăng nhập với quyền Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Thông báo */}
      <div className="notification-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close" 
              onClick={() => closeNotification(notification.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="admin-header">
        <h1>👨‍💼 Quản trị viên</h1>
        <p>Quản lý người dùng và hệ thống</p>
      </div>

      {/* Content */}
      <div className="admin-content">
        <div className="admin-section">
          <h2>➕ Thêm người dùng mới</h2>
          <AddUser 
            onUserAdded={handleUserAdded} 
            showNotification={showNotification}
          />
        </div>

        <div className="admin-section">
          <h2>📋 Danh sách người dùng</h2>
          <UserList 
            refresh={refreshKey} 
            showNotification={showNotification}
          />
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notification {
          background: white;
          border-radius: 8px;
          padding: 1rem 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 300px;
          animation: slideIn 0.3s ease;
        }

        .notification.success {
          border-left: 4px solid #27ae60;
        }

        .notification.error {
          border-left: 4px solid #e74c3c;
        }

        .notification.info {
          border-left: 4px solid #3498db;
        }

        .notification-message {
          flex: 1;
          margin-right: 1rem;
        }

        .notification-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #7f8c8d;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-close:hover {
          color: #2c3e50;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .admin-header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
        }

        .admin-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .admin-header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .admin-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .admin-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .admin-section h2 {
          margin-bottom: 1.5rem;
          color: #2c3e50;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 0.5rem;
        }

        .admin-error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .error-content {
          background: white;
          padding: 3rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          max-width: 400px;
        }

        .error-content h2 {
          color: #e74c3c;
          margin-bottom: 1rem;
        }

        .error-content p {
          color: #7f8c8d;
          margin-bottom: 2rem;
        }

        .login-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 1rem;
          }

          .admin-header h1 {
            font-size: 2rem;
          }

          .admin-content {
            gap: 2rem;
          }

          .admin-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;