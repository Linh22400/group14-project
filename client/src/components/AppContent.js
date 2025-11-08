import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, selectAuth } from '../store/authSlice';
import UserList from '../components/UserList';
import AddUser from '../components/AddUser';
import Login from '../components/Login';
import Register from '../components/Register';
import UserInfo from '../components/UserInfo';
import ProfilePage from '../components/ProfilePage';
import AdminDashboard from '../components/AdminDashboard';
import ForgotPassword from '../components/ForgotPassword';
import ResetPassword from '../components/ResetPassword';
import UserActivityLogs from '../components/UserActivityLogs';
import AdminActivityLogs from '../components/AdminActivityLogs';
import authService from '../services/authService';

function AppContent() {
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated, loading } = useSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();
  // Không cần navigationKey nữa, dùng currentUser.role để tự động cập nhật

  // Kiểm tra authentication khi component mount
  React.useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // DEBUG: Theo dõi currentUser thay đổi
  React.useEffect(() => {
    console.log('DEBUG - currentUser changed:', currentUser);
    console.log('DEBUG - isAuthenticated:', isAuthenticated);
    console.log('DEBUG - loading:', loading);
  }, [currentUser, isAuthenticated, loading]);

  // Tự động navigate về trang chủ khi login thành công
  React.useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // KHÔNG tự động clear error khi chuyển trang
  // Error sẽ được clear manually khi cần thiết

  // Lắng nghe sự kiện userRoleUpdated
  React.useEffect(() => {
    const handleUserRoleUpdated = (event) => {
      if (event.detail && event.detail.user) {
        dispatch(checkAuth());
        // Không cần setNavigationKey nữa, React tự re-render khi currentUser thay đổi
      }
    };

    window.addEventListener('userRoleUpdated', handleUserRoleUpdated);
    return () => window.removeEventListener('userRoleUpdated', handleUserRoleUpdated);
  }, [dispatch]);

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
            dispatch(checkAuth());
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
      dispatch(checkAuth());
    }
  };

  // Không cần handleLoginSuccess nữa - Redux tự động cập nhật currentUser

  const handleRegisterSuccess = (user) => {
    dispatch(checkAuth());
  };

  const handleLogout = () => {
    authService.logout();
    dispatch(checkAuth());
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang kiểm tra xác thực...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requireAdmin && currentUser?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  // Public Route Component (cho login/register)
  const PublicRoute = ({ children }) => {
    // KHÔNG hiển thị loading khi đang ở trang login để tránh unmount component
    if (loading && !location.pathname.includes('/login') && !location.pathname.includes('/register')) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang kiểm tra xác thực...</p>
        </div>
      );
    }

    return !isAuthenticated ? children : <Navigate to="/" replace />;
  };

  // Layout Component cho các protected routes
  const Layout = ({ children, hideFooter = false }) => {
    const isAdminPage = location.pathname === '/admin';
    
    // Không chặn render nữa - cho phép render với currentUser có thể undefined
    // UserInfo đã có xử lý optional chaining rồi
    
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
                {/* Chỉ render UserInfo khi không còn loading để tránh undefined user */}
                {!loading && <UserInfo user={currentUser} onLogout={handleLogout} />}
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
        {!hideFooter && !isAdminPage && (
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
  const Navigation = () => {
    const isActive = (path) => location.pathname === path;

    return (
      <nav className="main-nav">
        <button 
          className={`nav-button ${isActive('/') ? 'active' : ''}`} 
          onClick={() => navigate('/')}
        >
          🏠 Trang chủ
        </button>
        <button 
          className={`nav-button ${isActive('/profile') ? 'active' : ''}`} 
          onClick={() => navigate('/profile')}
        >
          👤 Profile
        </button>
        <button 
          className={`nav-button ${isActive('/activity-logs') ? 'active' : ''}`} 
          onClick={() => navigate('/activity-logs')}
        >
          📋 Nhật ký
        </button>
        {currentUser?.role === 'admin' && (
          <button 
            className={`nav-button ${isActive('/admin') ? 'active' : ''}`} 
            onClick={() => navigate('/admin')}
          >
            👨‍💼 Admin
          </button>
        )}
        {currentUser?.role === 'admin' && (
          <button 
            className={`nav-button ${isActive('/admin/activity-logs') ? 'active' : ''}`} 
            onClick={() => navigate('/admin/activity-logs')}
          >
            🔍 Admin Logs
          </button>
        )}
      </nav>
    );
  };

  // Auth Wrapper Component - Memoized để tránh re-render không cần thiết
  const AuthWrapper = React.memo(({ children }) => {
    console.log('AuthWrapper rendering');
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
  });

  return (
    <Routes>
      {/* Public Routes - Login trực tiếp để tránh unmount */}
      <Route path="/login" element={
        !isAuthenticated ? 
          <Login 
            onSwitchToRegister={() => navigate('/register')}
          /> : 
          <Navigate to="/" replace />
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
          <Layout>
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
                    <UserList refresh="admin-dashboard" />
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
        <ProtectedRoute requireAdmin={true}>
          <Layout hideFooter={true}>
            <AdminDashboard 
              onUserRoleUpdate={refreshCurrentUser}
              updateCurrentUserRole={updateCurrentUserRole}
            />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/activity-logs" element={
        <ProtectedRoute>
          <Layout>
            <UserActivityLogs />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/activity-logs" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout hideFooter={true}>
            <AdminActivityLogs />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default AppContent;