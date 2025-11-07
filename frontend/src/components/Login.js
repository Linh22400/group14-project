import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuth, clearError } from '../store/authSlice';
import { useNotification } from '../contexts/NotificationContext';
import './Auth.css';

const Login = ({ onSwitchToRegister = () => {} }) => {
  const { showNotification } = useNotification();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(selectAuth);
  
  // Không clear error khi unmount để user có thể thấy lỗi khi quay lại
  React.useEffect(() => {
    console.log('Login component MOUNTED');
    return () => {
      console.log('Login component UNMOUNTED');
      // Không clear error ở đây nữa
    };
  }, [dispatch]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
   
  // State để đếm ngược thời gian chờ khi bị rate limit
  const [retryCountdown, setRetryCountdown] = useState(0);
  
  // Track việc đã clear error chưa để tránh re-render liên tục
  const hasClearedError = useRef(false);

  // Debug: Theo dõi error state
  React.useEffect(() => {
    console.log('Login component - Error state changed:', error);
    // Reset flag khi có error mới
    if (error) {
      hasClearedError.current = false;
    }
  }, [error]);

  // Xử lý đếm ngược thời gian chờ khi bị rate limit
  React.useEffect(() => {
    if (error && (error.includes('giây') || error.includes('phút'))) {
      // Trích xuất số giây từ error message
      const secondsMatch = error.match(/(\d+)\s*giây/);
      const minutesMatch = error.match(/(\d+)\s*phút/);
      
      let totalSeconds = 0;
      if (secondsMatch) {
        totalSeconds = parseInt(secondsMatch[1]);
      } else if (minutesMatch) {
        totalSeconds = parseInt(minutesMatch[1]) * 60;
      }
      
      if (totalSeconds > 0) {
        setRetryCountdown(totalSeconds);
        
        const countdown = setInterval(() => {
          setRetryCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(countdown);
      }
    } else {
      setRetryCountdown(0);
    }
  }, [error]);

  const handleChange = (e) => {
    // Clear error khi user bắt đầu nhập lại, chỉ clear 1 lần
    if (error && !hasClearedError.current) {
      dispatch(clearError());
      hasClearedError.current = true;
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset flag để có thể clear error khi nhập lại lần sau
    hasClearedError.current = false;
    
    try {
      const result = await dispatch(login(formData)).unwrap();
      
      if (result && result.success) {
        // Không cần gọi onLoginSuccess nữa - Redux tự động cập nhật
        // Chỉ cần hiển thị thông báo thành công
        showNotification('Đăng nhập thành công! 🎉', 'success');
      }
    } catch (error) {
      // Lỗi đã được xử lý trong authSlice và hiển thị trong form
      console.log('Login failed:', error);
    }
    
    // Quan trọng: Luôn preventDefault để tránh reload
    return false;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng Nhập</h2>
          <p>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="auth-error">
              <div className="error-header">
                <span className="error-icon">⚠️</span>
                <strong>Lỗi đăng nhập</strong>
              </div>
              <div className="error-message">{error}</div>
              {(error.includes('spam') || error.includes('Quá nhiều')) && retryCountdown > 0 ? (
                <div className="error-retry-info">
                  <small>⏱️ Có thể thử lại sau: {retryCountdown} giây</small>
                </div>
              ) : null}
            </div>
          )}
          


          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email của bạn"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
              minLength="6"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || retryCountdown > 0}
          >
            {loading ? (
              <span className="loading">
                <span className="spinner"></span>
                Đang đăng nhập...
              </span>
            ) : retryCountdown > 0 ? (
              <span className="loading">
                <span className="spinner"></span>
                Chờ {retryCountdown}s...
              </span>
            ) : (
              'Đăng Nhập'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <a href="/forgot-password" className="forgot-password-link">
              Quên mật khẩu?
            </a>
          </p>
          <p>
            Chưa có tài khoản? 
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;