import React, { useState, useEffect } from 'react';
import UserList from './UserList';
import AddUser from './AddUser';
import RoleManagement from './RoleManagement';
import AdminStats from './AdminStats';
import authService from '../services/authService';

const AdminDashboard = ({ onUserRoleUpdate, updateCurrentUserRole }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(authService.getUser());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Component mount effect
  useEffect(() => {
    setIsMounted(true);

    // Lắng nghe sự kiện userRoleUpdated để cập nhật currentUser
    const handleUserRoleUpdated = (event) => {
      if (event.detail && event.detail.user) {
        setCurrentUser(event.detail.user);
        // Force refresh của các tabs
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('userRoleUpdated', handleUserRoleUpdated);

    // Cleanup
    return () => {
      window.removeEventListener('userRoleUpdated', handleUserRoleUpdated);
    };
  }, []);

  // Refresh danh sách user
  const handleUserAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Smooth tab switching with transition
  const handleTabChange = (tab) => {
    if (tab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
      
      // Trigger refresh for certain tabs
      if (tab === 'users' || tab === 'roles') {
        setRefreshKey(prev => prev + 1);
      }
    }, 150);
  };



  // Kiểm tra quyền admin
  const isAdmin = () => {
    const user = authService.getUser();
    return user && user.role === 'admin';
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
      {/* Admin Content Only - Header and Navigation moved to Layout */}
      <div className={`admin-content ${isMounted ? 'mounted' : ''}`}>
        {/* Page Title */}
        <div className="page-header">
          <h1>👨‍💼 Bảng điều khiển Admin</h1>
          <p>Quản lý hệ thống và người dùng</p>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
            onClick={() => handleTabChange('stats')}
            disabled={isTransitioning}
          >
            📊 Thống kê
          </button>
          <button 
            className={`tab-button ${activeTab === 'roles' ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
            onClick={() => handleTabChange('roles')}
            disabled={isTransitioning}
          >
            👑 Quản lý vai trò
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
            onClick={() => handleTabChange('users')}
            disabled={isTransitioning}
          >
            👥 Quản lý người dùng
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          <div className={`tab-panel ${activeTab === 'stats' ? 'active' : ''}`} style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
            <AdminStats />
          </div>
          <div className={`tab-panel ${activeTab === 'roles' ? 'active' : ''}`} style={{ display: activeTab === 'roles' ? 'block' : 'none' }}>
            <RoleManagement 
              onUserRoleUpdate={onUserRoleUpdate}
              updateCurrentUserRole={updateCurrentUserRole}
              currentUser={currentUser}
            />
          </div>
          <div className={`tab-panel ${activeTab === 'users' ? 'active' : ''}`} style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
            <div className="users-section">
              <div className="admin-section">
                <h2>➕ Thêm người dùng mới</h2>
                <AddUser onUserAdded={handleUserAdded} />
              </div>
              <div className="admin-section">
                <h2>📋 Danh sách người dùng</h2>
                <UserList refresh={refreshKey} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          width: 100%;
          padding: 2rem 0;
          min-height: 600px; /* Ensure minimum height for content */
        }

        .admin-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        


        .admin-content.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          color: #2c3e50;
        }

        .page-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .page-header p {
          font-size: 1.1rem;
          color: #7f8c8d;
        }

        .users-section {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          margin-bottom: 2rem;
        }

        /* Tab Navigation */
        .admin-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .tab-button {
          padding: 1rem 2rem;
          border: none;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .tab-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .tab-button:hover::before {
          left: 100%;
        }

        .tab-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .tab-button.active {
          background: white;
          color: #667eea;
          border-color: #667eea;
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
          transform: translateY(-1px) scale(1.01);
        }

        .tab-button.transitioning {
          transform: scale(0.95);
          opacity: 0.7;
        }

        .tab-button:disabled {
          cursor: not-allowed;
        }

        .tab-content {
          min-height: 400px;
        }

        .tab-panel {
          opacity: 0;
          transform: translateX(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          will-change: opacity, transform;
        }

        .tab-panel.active {
          opacity: 1;
          transform: translateX(0);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: auto;
        }

        .tab-panel.exit {
          opacity: 0;
          transform: translateX(-20px);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Performance optimization */
        .tab-content {
          transform: translateZ(0);
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
            padding: 1rem 0;
          }

          .admin-content {
            padding: 0 0.5rem;
          }

          .page-header {
            margin-bottom: 2rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .admin-tabs {
            flex-direction: column;
            align-items: center;
          }

          .tab-button {
            width: 100%;
            max-width: 300px;
          }

          .users-section {
            gap: 2rem;
          }

          .admin-section {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .page-header h1 {
            font-size: 1.5rem;
          }

          .tab-button {
            padding: 0.8rem 1.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;