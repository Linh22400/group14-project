import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { useNotification } from '../contexts/NotificationContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.forgotPassword(email);
      const successMsg = response.message || 'Link đặt lại mật khẩu đã được gửi đến email của bạn!';
      setMessage(successMsg);
      showNotification(successMsg, 'success');
      // Không chuyển step nữa, chỉ hiển thị thông báo thành công
    } catch (err) {
      const errorMsg = err.message || 'Có lỗi xảy ra khi gửi email.';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Quên Mật Khẩu</h2>
        
        <p>Nhập email của bạn để nhận link đặt lại mật khẩu</p>
        
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        
        <form onSubmit={handleSubmitEmail}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>
        </form>
        
        <div className="back-to-login">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;