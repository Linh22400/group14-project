import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);

  // Lấy danh sách users từ API
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Danh sách User</h2>
      {users.length === 0 ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user._id || user.id}>
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;