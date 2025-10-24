import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useValidation from '../hooks/useValidation';
import authService from '../services/authService';

const UserList = ({ refresh, showNotification }) => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const { errors, validateField, validateAll, clearError } = useValidation();

  // Lấy danh sách users từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/users', {
        headers: authService.getAuthHeaders()
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error);
      if (error.response?.status === 401) {
        showNotification('Bạn cần đăng nhập với quyền Admin để xem danh sách người dùng!', 'error');
      } else if (error.response?.status === 403) {
        showNotification('Bạn không có quyền truy cập danh sách người dùng!', 'error');
      } else {
        showNotification('Không thể tải danh sách người dùng!', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refresh]);

  // Xóa user
  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${userId}`, {
          headers: authService.getAuthHeaders()
        });
        fetchUsers(); // Refresh danh sách
        showNotification('Xóa người dùng thành công! ✅', 'success');
      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        if (error.response?.status === 403) {
          showNotification('Bạn không có quyền xóa người dùng này!', 'error');
        } else if (error.response?.status === 404) {
          showNotification('Người dùng không tồn tại!', 'error');
        } else {
          showNotification('Có lỗi xảy ra khi xóa người dùng!', 'error');
        }
      }
    }
  };

  // Bắt đầu chỉnh sửa
  const startEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setEditingUser(null);
    setEditName('');
    setEditEmail('');
  };

  // Lưu chỉnh sửa
  const saveEdit = async () => {
    // Validate all fields
    const isValid = validateAll({ name: editName, email: editEmail });
    if (!isValid) {
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/users/${editingUser.id}`, {
        name: editName.trim(),
        email: editEmail.trim()
      }, {
        headers: authService.getAuthHeaders()
      });
      fetchUsers(); // Refresh danh sách
      cancelEdit();
      showNotification('Cập nhật người dùng thành công! ✅', 'success');
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      if (error.response?.status === 403) {
        showNotification('Bạn không có quyền cập nhật người dùng!', 'error');
      } else {
        showNotification('Có lỗi xảy ra khi cập nhật người dùng!', 'error');
      }
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
              👥 Tổng số: {users.length} người dùng
            </span>
          </div>
          
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th className="table-header-cell">Họ và tên</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell actions-cell">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell name-cell">
                      {editingUser && editingUser.id === user.id ? (
                        <div className="edit-field">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => {
                              setEditName(e.target.value);
                              clearError('name');
                            }}
                            onBlur={() => validateField('name', editName)}
                            className={`edit-input ${errors.name ? 'error' : ''}`}
                          />
                          {errors.name && <span className="error-message-inline">{errors.name}</span>}
                        </div>
                      ) : (
                        <div className="user-info">
                          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
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
                              clearError('email');
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
        
        .actions-cell {
          width: 180px;
          text-align: center;
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
      `}</style>
    </div>
  );
};

export default UserList;