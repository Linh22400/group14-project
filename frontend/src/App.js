import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import Notification from './components/Notification';
import Login from './components/Login';
import Register from './components/Register';
import UserInfo from './components/UserInfo';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import authService from './services/authService';
import './App.css';

function App() {
  const [refresh, setRefresh] = React.useState(false);
  const [notification, setNotification] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState(null);

  // Kiểm tra đăng nhập khi component mount
  React.useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleUserAdded = () => {
    setRefresh(!refresh); // Trigger re-render để refresh danh sách
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showNotification('Đăng nhập thành công!', 'success');
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    showNotification('Đăng ký thành công!', 'success');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    showNotification('Đăng xuất thành công!', 'success');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  // Public Route Component (cho login/register)
  const PublicRoute = ({ children }) => {
    return !currentUser ? children : <Navigate to="/" />;
  };

  // Layout Component cho các protected routes
  const Layout = ({ children }) => {
    return (
      <div className="main-app">
        {/* Header với navigation */}
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              <div className="header-title">
                <h1 className="app-title">
                  <span className="icon">👥</span>
                  Quản Lý Người Dùng
                </h1>
                <p className="app-subtitle">Hệ thống quản lý người dùng hiện đại</p>
              </div>
              <div className="header-nav">
                <Navigation />
                <UserInfo user={currentUser} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="app-main">
          <div className="container">
            {children}
          </div>
        </main>
        
        <footer className="app-footer">
          <div className="container">
            <p>&copy; 2024 Quản Lý Người Dùng. Phát triển bởi React.</p>
          </div>
        </footer>
      </div>
    );
  };

  // Navigation Component
  const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleNavigation = (path) => {
      navigate(path);
    };

    const isActive = (path) => {
      return location.pathname === path;
    };

    return (
      <nav className="main-nav">
        <button 
          className={`nav-button ${isActive('/') ? 'active' : ''}`} 
          onClick={() => handleNavigation('/')}
        >
          🏠 Trang chủ
        </button>
        <button 
          className={`nav-button ${isActive('/profile') ? 'active' : ''}`} 
          onClick={() => handleNavigation('/profile')}
        >
          👤 Profile
        </button>
        {currentUser && currentUser.role === 'admin' && (
          <button 
            className={`nav-button ${isActive('/admin') ? 'active' : ''}`} 
            onClick={() => handleNavigation('/admin')}
          >
            👨‍💼 Admin
          </button>
        )}
      </nav>
    );
  };

  return (
    <Router>
      <div className="App">
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type}
            onClose={hideNotification}
          />
        )}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login 
                onLoginSuccess={handleLoginSuccess}
              />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register 
                onRegisterSuccess={handleRegisterSuccess}
              />
            </PublicRoute>
          } />
          
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          
          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <div className="content-grid">
                  {currentUser?.role === 'admin' && (
                    <section className="add-user-section">
                      <div className="section-card">
                        <h2 className="section-title">Thêm Người Dùng Mới</h2>
                        <AddUser onUserAdded={handleUserAdded} showNotification={showNotification} />
                      </div>
                    </section>
                  )}
                  
                  {currentUser?.role === 'admin' && (
                    <section className="user-list-section">
                      <div className="section-card">
                        <h2 className="section-title">Danh Sách Người Dùng</h2>
                        <UserList refresh={refresh} showNotification={showNotification} />
                      </div>
                    </section>
                  )}
                  
                  {currentUser?.role !== 'admin' && (
                    <section className="welcome-section">
                      <div className="section-card">
                        <h2 className="section-title">Chào mừng {currentUser?.name}!</h2>
                        <p>Bạn đã đăng nhập thành công. Hãy nhấn vào Profile ở menu trên cùng để xem thông tin cá nhân.</p>
                      </div>
                    </section>
                  )}
                </div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              {currentUser?.role === 'admin' ? (
                <Layout>
                  <AdminDashboard />
                </Layout>
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
