import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'verify', 'reset'
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
      setMessage(response.message || 'Mã xác nhận 4 chữ số đã được gửi! Vui lòng kiểm tra email của bạn.');
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (resetCode.length !== 4) {
      setError('Mã xác nhận phải có 4 chữ số');
      setLoading(false);
      return;
    }

    setStep('reset');
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.verifyResetCode(email, resetCode, newPassword);
      setMessage('Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập với mật khẩu mới.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Quên Mật Khẩu</h2>
        
        {step === 'email' && (
          <>
            <p>Nhập email của bạn để nhận mã xác nhận 4 chữ số</p>
            
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
                {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
              </button>
            </form>
          </>
        )}

        {step === 'verify' && (
          <>
            <p>Nhập mã xác nhận 4 chữ số đã được gửi đến {email}</p>
            
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label htmlFor="resetCode">Mã xác nhận:</label>
                <input
                  type="text"
                  id="resetCode"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  maxLength="4"
                  required
                  placeholder="Nhập 4 chữ số"
                />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Đang xác thực...' : 'Xác nhận mã'}
              </button>
            </form>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setStep('email')}
              style={{ marginTop: '10px' }}
            >
              ← Quay lại
            </button>
          </>
        )}

        {step === 'reset' && (
          <>
            <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
            
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setStep('verify')}
              style={{ marginTop: '10px' }}
            >
              ← Quay lại
            </button>
          </>
        )}
        
        <div className="back-to-login">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;