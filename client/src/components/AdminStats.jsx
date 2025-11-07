import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import authService from '../services/authService';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    moderatorUsers: 0,
    userUsers: 0,
    recentUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  // Lắng nghe sự kiện userRoleUpdated để refresh thống kê
  useEffect(() => {
    const handleUserRoleUpdated = () => {
      fetchStats();
    };
    
    window.addEventListener('userRoleUpdated', handleUserRoleUpdated);
    
    return () => {
      window.removeEventListener('userRoleUpdated', handleUserRoleUpdated);
    };
  }, []);

  // Lắng nghe sự kiện userDeleted để refresh thống kê khi người dùng bị xóa
  useEffect(() => {
    const handleUserDeleted = () => {
      fetchStats();
    };
    
    window.addEventListener('userDeleted', handleUserDeleted);
    
    return () => {
      window.removeEventListener('userDeleted', handleUserDeleted);
    };
  }, []);

  // Lắng nghe sự kiện userAdded để refresh thống kê khi có người dùng mới
  useEffect(() => {
    const handleUserAdded = () => {
      fetchStats();
    };
    
    window.addEventListener('userAdded', handleUserAdded);
    
    return () => {
      window.removeEventListener('userAdded', handleUserAdded);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const stats = await adminService.getUserStats();
      setStats(stats);
    } catch (error) {
      console.error('Lỗi khi lấy thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        <p className="stat-description">{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-stats">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-stats">
      <div className="stats-header">
        <h2>📊 Thống kê hệ thống</h2>
        <p>Tổng quan về người dùng trong hệ thống</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Tổng số người dùng"
          value={stats.totalUsers}
          icon="👥"
          color="#667eea"
          description="Tổng số tài khoản đã đăng ký"
        />
        
        <StatCard
          title="Quản trị viên"
          value={stats.adminUsers}
          icon="👨‍💼"
          color="#e74c3c"
          description="Số lượng admin"
        />
        
        <StatCard
          title="Kiểm duyệt viên"
          value={stats.moderatorUsers}
          icon="👮‍♀️"
          color="#f39c12"
          description="Số lượng kiểm duyệt viên"
        />
        
        <StatCard
          title="Người dùng thường"
          value={stats.userUsers}
          icon="👤"
          color="#3498db"
          description="Số lượng user thường"
        />
        
        <StatCard
          title="Người dùng mới"
          value={stats.recentUsers}
          icon="🆕"
          color="#2ecc71"
          description="Đăng ký trong 7 ngày qua"
        />
      </div>

      <div className="stats-summary">
        <h3>📈 Tỷ lệ phân bố</h3>
        <div className="progress-bars">
          <div className="progress-item">
            <span className="progress-label">Admin</span>
            <div className="progress-bar">
              <div 
                className="progress-fill admin-fill"
                style={{ width: `${stats.totalUsers > 0 ? (stats.adminUsers / stats.totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="progress-percentage">
              {stats.totalUsers > 0 ? Math.round((stats.adminUsers / stats.totalUsers) * 100) : 0}%
            </span>
          </div>
          
          <div className="progress-item">
            <span className="progress-label">Kiểm duyệt viên</span>
            <div className="progress-bar">
              <div 
                className="progress-fill moderator-fill"
                style={{ width: `${stats.totalUsers > 0 ? (stats.moderatorUsers / stats.totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="progress-percentage">
              {stats.totalUsers > 0 ? Math.round((stats.moderatorUsers / stats.totalUsers) * 100) : 0}%
            </span>
          </div>
          
          <div className="progress-item">
            <span className="progress-label">Người dùng</span>
            <div className="progress-bar">
              <div 
                className="progress-fill user-fill"
                style={{ width: `${stats.totalUsers > 0 ? (stats.userUsers / stats.totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="progress-percentage">
              {stats.totalUsers > 0 ? Math.round((stats.userUsers / stats.totalUsers) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-stats {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .stats-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .stats-header h2 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 1.8rem;
        }

        .stats-header p {
          color: #7f8c8d;
          font-size: 1rem;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          border-top: 4px solid #667eea;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin: 0 auto 1rem;
          color: white;
        }

        .stat-content h3 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .stat-description {
          color: #6c757d;
          font-size: 0.9rem;
          margin: 0;
        }

        .stats-summary {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
        }

        .stats-summary h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          text-align: center;
        }

        .progress-bars {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .progress-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-label {
          min-width: 60px;
          font-weight: 600;
          color: #2c3e50;
        }

        .progress-bar {
          flex: 1;
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.5s ease;
          border-radius: 10px;
        }

        .admin-fill {
          background: linear-gradient(90deg, #e74c3c, #c0392b);
        }

        .moderator-fill {
          background: linear-gradient(90deg, #f39c12, #e67e22);
        }

        .user-fill {
          background: linear-gradient(90deg, #3498db, #2980b9);
        }

        .progress-percentage {
          min-width: 40px;
          text-align: right;
          font-weight: 600;
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .admin-stats {
            padding: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .progress-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .progress-label {
            min-width: auto;
          }

          .progress-percentage {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .stats-header h2 {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminStats;