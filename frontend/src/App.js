import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import NotificationContainer from './components/NotificationContainer';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './components/Login';
import Register from './components/Register';
import UserInfo from './components/UserInfo';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import UserActivityLogs from './components/UserActivityLogs';
import AdminActivityLogs from './components/AdminActivityLogs';
import authService from './services/authService';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [navigationKey, setNavigationKey] = React.useState(0); // Key để force re-render Navigation

  // Kiểm tra đăng nhập khi component mount
  React.useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setCurrentUser(user);
    }

    // // Lắng nghe sự kiện userRoleUpdated
    const handleUserRoleUpdated = (event) => {
      if (event.detail && event.detail.user) {
        setCurrentUser(event.detail.user);
        // Force re-render Navigation bằng cách thay đổi key
        setNavigationKey(prev => prev + 1);
      }
    };

    window.addEventListener('userRoleUpdated', handleUserRoleUpdated);

    // Cleanup
    return () => {
      window.removeEventListener('userRoleUpdated', handleUserRoleUpdated);
    };
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  // Function to refresh current user data
  const refreshCurrentUser = async () => {
    try {
      const token = authService.getAccessToken();
      if (token) {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            authService.setUser(data.user);
            setCurrentUser(data.user);
            // Dispatch custom event để thông báo cho các components khác
            window.dispatchEvent(new CustomEvent('userRoleUpdated', { 
              detail: { user: data.user } 
            }));
            return data.user;
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi refresh user data:', error);
    }
    return null;
  };

  // Function to update current user role locally
  const updateCurrentUserRole = (newRole) => {
    const updatedUser = authService.updateUserRole(newRole);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
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
  const Layout = ({ children, currentUser }) => {
    const location = useLocation();
    const isAdminPage = location.pathname === '/admin';
    
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
                <Navigation key={navigationKey} currentUser={currentUser} />
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
        
        {/* Hide footer on admin page */}
        {!isAdminPage && (
          <footer className="app-footer">
            <div className="container">
              <p>&copy; 2024 Quản Lý Người Dùng. Phát triển bởi React.</p>
            </div>
          </footer>
        )}
      </div>
    );
  };

  // Navigation Component
  const Navigation = ({ currentUser }) => {
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
        <button 
          className={`nav-button ${isActive('/activity-logs') ? 'active' : ''}`} 
          onClick={() => handleNavigation('/activity-logs')}
        >
          📋 Nhật ký
        </button>
        {currentUser && currentUser.role === 'admin' && (
          <button 
            className={`nav-button ${isActive('/admin') ? 'active' : ''}`} 
            onClick={() => handleNavigation('/admin')}
          >
            👨‍💼 Admin
          </button>
        )}
        {currentUser && currentUser.role === 'admin' && (
          <button 
            className={`nav-button ${isActive('/admin/activity-logs') ? 'active' : ''}`} 
            onClick={() => handleNavigation('/admin/activity-logs')}
          >
            🔍 Admin Logs
          </button>
        )}
      </nav>
    );
  };

  // Auth Wrapper Component
  const AuthWrapper = ({ children }) => {
    const navigate = useNavigate();
    
    const childrenWithProps = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          onSwitchToRegister: () => navigate('/register'),
          onSwitchToLogin: () => navigate('/login')
        });
      }
      return child;
    });
    
    return <>{childrenWithProps}</>;
  };

  return (
    <NotificationProvider>
      <Router>
        <div className="App">
          <NotificationContainer />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <AuthWrapper>
                  <Login onLoginSuccess={handleLoginSuccess} />
                </AuthWrapper>
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <AuthWrapper>
                  <Register onRegisterSuccess={handleRegisterSuccess} />
                </AuthWrapper>
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
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <div className="content-grid">
                    {currentUser?.role === 'admin' && (
                      <section className="add-user-section">
                        <div className="section-card">
                          <h2 className="section-title">Thêm Người Dùng Mới</h2>
                          <AddUser />
                        </div>
                      </section>
                    )}
                    
                    {currentUser?.role === 'admin' && (
                      <section className="user-list-section">
                        <div className="section-card">
                          <h2 className="section-title">Danh Sách Người Dùng</h2>
                          <UserList />
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
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout} hideFooter={true}>
                  <AdminDashboard 
                    onUserRoleUpdate={refreshCurrentUser}
                    updateCurrentUserRole={updateCurrentUserRole}
                  />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/activity-logs" element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <UserActivityLogs />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/activity-logs" element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout} hideFooter={true}>
                  <AdminActivityLogs />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
