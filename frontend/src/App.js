import React, { useState } from 'react';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleUserAdded = () => {
    setRefresh(!refresh); // Trigger re-render để refresh danh sách
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            <span className="icon">👥</span>
            Quản Lý Người Dùng
          </h1>
          <p className="app-subtitle">Hệ thống quản lý người dùng hiện đại</p>
        </div>
      </header>
      
      <main className="app-main">
        <div className="container">
          <div className="content-grid">
            <section className="add-user-section">
              <div className="section-card">
                <h2 className="section-title">Thêm Người Dùng Mới</h2>
                <AddUser onUserAdded={handleUserAdded} />
              </div>
            </section>
            
            <section className="user-list-section">
              <div className="section-card">
                <h2 className="section-title">Danh Sách Người Dùng</h2>
                <UserList refresh={refresh} />
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2024 Quản Lý Người Dùng. Phát triển bởi React.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
