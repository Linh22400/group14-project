import React, { useState } from 'react';
import axios from 'axios';

const AddUser = ({ onUserAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newUser = { name, email };
      await axios.post('http://localhost:3000/users', newUser);
      
      alert('Thêm user thành công!');
      setName('');
      setEmail('');
      
      if (onUserAdded) {
        onUserAdded();
      }
    } catch (error) {
      console.error('Lỗi khi thêm user:', error);
      alert('Có lỗi xảy ra khi thêm user!');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Thêm User Mới</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'inline-block', width: '60px' }}>Tên:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'inline-block', width: '60px' }}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <button type="submit">Thêm User</button>
      </form>
    </div>
  );
};

export default AddUser;