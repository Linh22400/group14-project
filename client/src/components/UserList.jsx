import React, { useState, useEffect, useCallback } from 'react';
import useValidation from '../hooks/useValidation';
import authService from '../services/authService';
import { useNotification } from '../contexts/NotificationContext';
import { useUserRefresh } from '../contexts/UserRefreshContext';
import { buildApiUrl } from '../config/api';
import Avatar from './Avatar';

const UserList = () => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  // Không cần editRole nữa vì không cho phép sửa vai trò
  const [loading, setLoading] = useState(true);
  const { errors, validateField, validateAll } = useValidation();
  const { refreshKey } = useUserRefresh();
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4; // Mỗi trang hiển thị 4 người dùng

  // Lấy danh sách users từ API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Sử dụng authenticatedFetch để tự động refresh token nếu cần
      const response = await authService.authenticatedFetch(buildApiUrl('/api/admin/users'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setUsers(result.data || []);
      
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error);
      
      if (error.message.includes('401') || error.message.includes('TOKEN_EXPIRED')) {
        showNotification('Bạn cần đăng nhập với quyền Admin để xem danh sách người dùng!', 'error');
        // Có thể redirect về login nếu cần
        // window.location.href = '/login';
      } else if (error.message.includes('403')) {
        showNotification('Bạn không có quyền truy cập danh sách người dùng!', 'error');
      } else {
        showNotification('Không thể tải danh sách người dùng!', 'error');
      }
      
      // Đảm bảo setUsers về mảng rỗng để tránh lỗi
      setUsers([]);
      // Không retry khi có lỗi nghiêm trọng như account locked
      if (error.message?.includes('Account temporarily locked')) {
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshKey]);

  // Reset về trang 1 khi danh sách users thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  // Lắng nghe sự kiện từ AddUser và RoleManagement
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing user list due to event');
      fetchUsers();
    };
    
    window.addEventListener('userAdded', handleRefresh);
    window.addEventListener('userRoleUpdated', handleRefresh);
    
    return () => {
      window.removeEventListener('userAdded', handleRefresh);
      window.removeEventListener('userRoleUpdated', handleRefresh);
    };
  }, [fetchUsers]);

  // Xóa user
  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const response = await authService.authenticatedFetch(
          buildApiUrl(`/api/admin/users/${userId}`),
          { method: 'DELETE' }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        fetchUsers(); // Refresh danh sách
        showNotification('Xóa người dùng thành công! ✅', 'success');
        
        // Phát sự kiện để thông báo người dùng đã bị xóa
        window.dispatchEvent(new CustomEvent('userDeleted', { 
          detail: { userId: userId } 
        }));
      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        if (error.message.includes('403')) {
          showNotification('Bạn không có quyền xóa người dùng này!', 'error');
        } else if (error.message.includes('404')) {
          showNotification('Người dùng không tồn tại!', 'error');
        } else {
          showNotification('Có lỗi xảy ra khi xóa người dùng!', 'error');
        }
      }
    }
  };

  // Helper functions để hiển thị role giống RoleManagement
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
        return '👑 Quản trị viên';
      case 'moderator':
        return '👮‍♀️ Kiểm duyệt viên';
      case 'user':
        return '👤 Người dùng';
      default:
        return role;
    }
  };

  // Kiểm tra quyền admin
  const isAdmin = () => {
    const currentUser = authService.getUser();
    return currentUser && currentUser.role === 'admin';
  };

  // Bắt đầu chỉnh sửa - kiểm tra quyền trước khi cho phép sửa
  const startEdit = (user) => {
    // Kiểm tra nếu là moderator đang cố sửa tài khoản admin
    if (!isAdmin() && user.role === 'admin') {
      showNotification('⚠️ Kiểm duyệt viên không có quyền chỉnh sửa tài khoản Quản trị viên!', 'error');
      return;
    }
    
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setEditingUser(null);
    setEditName('');
    setEditEmail('');
    // Không cần reset editRole nữa
  };

  // Các hàm phân trang
  const getPaginatedUsers = () => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return users.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(users.length / usersPerPage);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= getTotalPages()) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Lưu chỉnh sửa
  const saveEdit = async () => {
    // Validate name và email fields (không validate role nữa)
    const isValid = validateAll({ name: editName, email: editEmail });
    if (!isValid) {
      return;
    }

    try {
      const response = await authService.authenticatedFetch(
        buildApiUrl(`/api/admin/users/${editingUser.id}`),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: editName.trim(),
            email: editEmail.trim()
            // Không gửi role nữa
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchUsers(); // Refresh danh sách
      cancelEdit();
      showNotification('Cập nhật người dùng thành công! ✅', 'success');
      
      // Phát sự kiện để thông báo thông tin người dùng đã được cập nhật
      window.dispatchEvent(new CustomEvent('userInfoUpdated', { 
        detail: { userId: editingUser.id, name: editName, email: editEmail } 
      }));
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      
      // Lấy thông điệp lỗi chi tiết từ server response
      let errorMessage = 'Có lỗi xảy ra khi cập nhật người dùng!';
      
      // Ưu tiên sử dụng serverData.message nếu có
      if (error.serverData && error.serverData.message) {
        errorMessage = error.serverData.message;
      } else if (error.message) {
        // Nếu không có serverData, dùng message từ error
        if (error.message.includes('Moderator không có quyền')) {
          errorMessage = error.message;
        } else if (error.message.includes('403')) {
          errorMessage = 'Bạn không có quyền cập nhật người dùng này!';
        }
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Chưa có người dùng nào</h3>
          <p>Hãy thêm người dùng đầu tiên để bắt đầu!</p>
        </div>
      ) : (
        <div className="user-table-wrapper">
          <div className="table-header">
            <span className="user-count">
              👥 Tổng số: {users.length} người dùng | Trang {currentPage}/{getTotalPages()}
            </span>
          </div>
          
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th className="table-header-cell">Họ và tên</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Vai trò</th>
                  <th className="table-header-cell actions-cell">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedUsers().map(user => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell name-cell">
                      {editingUser && editingUser.id === user.id ? (
                        <div className="edit-field">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => {
                              setEditName(e.target.value);
                              validateField('name', e.target.value);
                            }}
                            onBlur={() => validateField('name', editName)}
                            className={`edit-input ${errors.name ? 'error' : ''}`}
                          />
                          {errors.name && <span className="error-message-inline">{errors.name}</span>}
                        </div>
                      ) : (
                        <div className="user-info">
                          <Avatar user={user} size="medium" />
                          <span className="user-name">{user.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="table-cell email-cell">
                      {editingUser && editingUser.id === user.id ? (
                        <div className="edit-field">
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => {
                              setEditEmail(e.target.value);
                              validateField('email', e.target.value);
                            }}
                            onBlur={() => validateField('email', editEmail)}
                            className={`edit-input ${errors.email ? 'error' : ''}`}
                          />
                          {errors.email && <span className="error-message-inline">{errors.email}</span>}
                        </div>
                      ) : (
                        <span className="user-email">{user.email}</span>
                      )}
                    </td>
                    <td className="table-cell role-cell">
                      <span 
                        className={`role-badge ${user.role}`}
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="table-cell actions-cell">
                      {editingUser && editingUser.id === user.id ? (
                        <div className="edit-actions">
                          <button onClick={saveEdit} className="save-btn" title="Lưu">
                            💾 Lưu
                          </button>
                          <button onClick={cancelEdit} className="cancel-btn" title="Hủy">
                            ❌ Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button onClick={() => startEdit(user)} className="edit-btn" title="Chỉnh sửa">
                            ✏️ Sửa
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="delete-btn" title="Xóa">
                            🗑️ Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Phân trang */}
          {getTotalPages() > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Trước
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={goToNextPage}
                disabled={currentPage === getTotalPages()}
                className="pagination-btn"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .user-list-container {
          width: 100%;
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
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 15px;
          border: 2px dashed #ddd;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }
        
        .empty-state h3 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: #7f8c8d;
        }
        
        .user-table-wrapper {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .table-header {
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .user-count {
          font-weight: 600;
          color: #495057;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .user-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .table-header-cell {
          background: #667eea;
          color: white;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .table-row {
          border-bottom: 1px solid #e9ecef;
          transition: background-color 0.2s ease;
        }
        
        .table-row:hover {
          background-color: #f8f9fa;
        }
        
        .table-cell {
          padding: 1rem;
          vertical-align: middle;
        }
        
        .name-cell {
          min-width: 200px;
        }
        
        .email-cell {
          min-width: 250px;
        }
        
        .role-cell {
          min-width: 150px;
          text-align: center;
        }
        
        .actions-cell {
          width: 180px;
          text-align: center;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .avatar-container {
          margin: 0 auto;
        }
        
        .user-name {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .user-email {
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .edit-input {
          width: 100%;
          padding: 0.5rem;
          border: 2px solid #667eea;
          border-radius: 6px;
          font-size: 0.9rem;
        }
        
        .edit-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .edit-input.error {
          border-color: #e74c3c;
          background-color: #fdf2f2;
        }
        
        .edit-select {
          width: 100%;
          padding: 0.5rem;
          border: 2px solid #667eea;
          border-radius: 6px;
          font-size: 0.9rem;
          background: white;
        }
        
        .edit-select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .role-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-block;
          transition: all 0.2s ease;
        }
        
        .role-badge.admin {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          box-shadow: 0 2px 8px rgba(238, 90, 36, 0.3);
        }
        
        .role-badge.moderator {
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: white;
          box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
        }
        
        .role-badge.user {
          background: linear-gradient(135deg, #74b9ff, #0984e3);
          color: white;
          box-shadow: 0 2px 8px rgba(9, 132, 227, 0.3);
        }
        
        .edit-field {
          position: relative;
        }
        
        .error-message-inline {
          color: #e74c3c;
          font-size: 0.7rem;
          margin-top: 0.2rem;
          display: block;
          position: absolute;
          top: 100%;
          left: 0;
          white-space: nowrap;
          z-index: 10;
          background: #fff5f5;
          border: 1px solid #feb2b2;
          border-radius: 4px;
          padding: 0.2rem 0.4rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          animation: slideInError 0.2s ease-out;
        }
        
        @keyframes slideInError {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
        
        .edit-btn, .delete-btn, .save-btn, .cancel-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .edit-btn {
          background: #28a745;
          color: white;
        }
        
        .edit-btn:hover {
          background: #218838;
          transform: translateY(-1px);
        }
        
        .delete-btn {
          background: #dc3545;
          color: white;
        }
        
        .delete-btn:hover {
          background: #c82333;
          transform: translateY(-1px);
        }
        
        .save-btn {
          background: #007bff;
          color: white;
        }
        
        .save-btn:hover {
          background: #0056b3;
        }
        
        .cancel-btn {
          background: #6c757d;
          color: white;
        }
        
        .cancel-btn:hover {
          background: #545b62;
        }
        
        .edit-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .table-header-cell {
            font-size: 0.8rem;
            padding: 0.75rem;
          }
          
          .table-cell {
            padding: 0.75rem;
          }
          
          .name-cell {
            min-width: 150px;
          }
          
          .email-cell {
            min-width: 200px;
          }
          
          .role-cell {
            min-width: 120px;
          }
          
          .role-badge {
            font-size: 0.7rem;
            padding: 0.3rem 0.6rem;
          }
          
          .actions-cell {
            width: 150px;
          }
          
          .user-avatar {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }
          
          .edit-btn, .delete-btn, .save-btn, .cancel-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 480px) {
          .table-container {
            font-size: 0.8rem;
          }
          
          .user-info {
            gap: 0.5rem;
          }
          
          .user-avatar {
            width: 30px;
            height: 30px;
            font-size: 0.9rem;
          }
          
          .action-buttons {
            flex-direction: column;
            gap: 0.3rem;
          }
          
          .edit-actions {
            flex-direction: column;
            gap: 0.3rem;
          }
        }
        
        /* CSS cho phân trang */
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
        
        .pagination-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-numbers {
          display: flex;
          gap: 0.5rem;
        }
        
        .pagination-number {
          width: 2rem;
          height: 2rem;
          border: 1px solid #dee2e6;
          background: white;
          color: #495057;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .pagination-number:hover {
          background: #e9ecef;
        }
        
        .pagination-number.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
        
        @media (max-width: 768px) {
          .pagination-controls {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .pagination-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UserList;