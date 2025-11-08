import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import authService from '../services/authService';
import { useNotification } from '../contexts/NotificationContext';

const RoleManagement = ({ onUserRoleUpdate, updateCurrentUserRole, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [updatingRole, setUpdatingRole] = useState({});
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lắng nghe sự kiện userRoleUpdated để refresh dữ liệu
  useEffect(() => {
    const handleUserRoleUpdated = () => {
      fetchUsers();
    };

    window.addEventListener('userRoleUpdated', handleUserRoleUpdated);

    // Cleanup
    return () => {
      window.removeEventListener('userRoleUpdated', handleUserRoleUpdated);
    };
  }, []);

  // Lắng nghe sự kiện userInfoUpdated để refresh dữ liệu khi thông tin người dùng thay đổi
  useEffect(() => {
    const handleUserInfoUpdated = () => {
      fetchUsers();
    };

    window.addEventListener('userInfoUpdated', handleUserInfoUpdated);

    // Cleanup
    return () => {
      window.removeEventListener('userInfoUpdated', handleUserInfoUpdated);
    };
  }, []);

  // Lắng nghe sự kiện userDeleted để refresh dữ liệu khi người dùng bị xóa
  useEffect(() => {
    const handleUserDeleted = () => {
      fetchUsers();
    };

    window.addEventListener('userDeleted', handleUserDeleted);

    // Cleanup
    return () => {
      window.removeEventListener('userDeleted', handleUserDeleted);
    };
  }, []);

  // Lắng nghe sự kiện userAdded để refresh dữ liệu khi có người dùng mới
  useEffect(() => {
    const handleUserAdded = () => {
      fetchUsers();
    };

    window.addEventListener('userAdded', handleUserAdded);

    // Cleanup
    return () => {
      window.removeEventListener('userAdded', handleUserAdded);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await adminService.getAllUsers();
      setUsers(users);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, email, newRole) => {
    setUpdatingRole({ [userId]: true });
    setNotification('');

    try {
      await adminService.updateUserRole(userId, newRole);
      
      // Cập nhật role trong state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      setNotification(`✅ Cập nhật role thành ${newRole} thành công!`);
      showNotification(`✅ Cập nhật role thành ${newRole} thành công!`, 'success');
      
      // Kiểm tra nếu user đang cập nhật là user hiện tại
      if (currentUser && currentUser.email === email) {
        // Cập nhật role trong localStorage và state
        if (updateCurrentUserRole) {
          updateCurrentUserRole(newRole);
        } else {
          authService.updateUserRole(newRole);
        }
      }
      
      // Luôn gọi callback để refresh data và phát sự kiện
      if (onUserRoleUpdate) {
        onUserRoleUpdate().then(() => {
          // Dispatch event để refresh toàn bộ ứng dụng
          window.dispatchEvent(new CustomEvent('userRoleUpdated', { 
            detail: { refresh: true } 
          }));
        });
      } else {
        // Nếu không có callback, vẫn phát sự kiện để refresh data
        window.dispatchEvent(new CustomEvent('userRoleUpdated', { 
          detail: { refresh: true } 
        }));
      }
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => setNotification(''), 3000);
      
    } catch (error) {
      console.error('Lỗi cập nhật role:', error);
      setNotification(`❌ Lỗi: ${error.message}`);
      showNotification(`❌ Lỗi: ${error.message}`, 'error');
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setUpdatingRole({});
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#e74c3c'; // Đỏ
      case 'moderator':
        return '#f39c12'; // Cam
      case 'user':
        return '#3498db'; // Xanh dương
      default:
        return '#95a5a6'; // Xám
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return '👨‍💼 Quản trị viên';
      case 'moderator':
        return '👮‍♀️ Kiểm duyệt viên';
      case 'user':
        return '👤 Người dùng';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="role-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="role-management">
      <div className="role-header">
        <h2>👑 Quản lý vai trò</h2>
        <p>Phân quyền và quản lý vai trò người dùng</p>
      </div>

      {notification && (
        <div className="notification">{notification}</div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò hiện tại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="user-row">
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-id">ID: {user._id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="user-email">{user.email}</div>
                </td>
                <td>
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>
                <td>
                  <div className="role-actions">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user._id, user.email, e.target.value)}
                      disabled={updatingRole[user._id]}
                      className="role-select"
                      style={{ backgroundColor: getRoleColor(user.role), color: 'white' }}
                    >
                      <option value="user" style={{ backgroundColor: '#3498db', color: 'white' }}>
                        👤 Người dùng
                      </option>
                      <option value="moderator" style={{ backgroundColor: '#f39c12', color: 'white' }}>
                        👮‍♀️ Kiểm duyệt viên
                      </option>
                      <option value="admin" style={{ backgroundColor: '#e74c3c', color: 'white' }}>
                        👨‍💼 Quản trị viên
                      </option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .role-management {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .role-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .role-header h2 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 1.8rem;
        }

        .role-header p {
          color: #7f8c8d;
          font-size: 1rem;
        }

        .notification {
          background: #d4edda;
          color: #155724;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: 600;
          border: 1px solid #c3e6cb;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .users-table-container {
          overflow-x: auto;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .users-table th {
          background: #667eea;
          color: white;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }

        .user-row:hover {
          background-color: #f8f9fa;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-name {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.2rem;
        }

        .user-id {
          font-size: 0.8rem;
          color: #6c757d;
          font-family: monospace;
        }

        .user-email {
          color: #2c3e50;
          font-weight: 500;
        }

        .role-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          display: inline-block;
        }

        .role-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-promote, .btn-demote {
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          min-width: 180px;
          justify-content: center;
        }

        .btn-promote {
          background: #28a745;
          color: white;
        }

        .btn-promote:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
        }

        .btn-demote {
          background: #ffc107;
          color: #212529;
        }

        .btn-demote:hover:not(:disabled) {
          background: #e0a800;
          transform: translateY(-1px);
        }

        .btn-promote:disabled, .btn-demote:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        .role-select {
          padding: 0.5rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          background: white;
          color: #2c3e50;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 150px;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          background-size: 1em;
          padding-right: 2.5rem;
        }

        .role-select:hover:not(:disabled) {
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }

        .role-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .role-select:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          background: #f8f9fa;
        }

        /* Style cho các option trong dropdown */
        .role-select option {
          background: white !important;
          color: #2c3e50 !important;
          padding: 0.5rem;
        }

        .role-select option:checked {
          background: #667eea !important;
          color: white !important;
        }

        @media (max-width: 768px) {
          .role-management {
            padding: 1.5rem;
          }

          .users-table {
            font-size: 0.9rem;
          }

          .users-table th,
          .users-table td {
            padding: 0.75rem;
          }

          .user-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .role-actions {
            flex-direction: column;
          }

          .role-select {
            min-width: auto;
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .role-header h2 {
            font-size: 1.5rem;
          }

          .users-table-container {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RoleManagement;