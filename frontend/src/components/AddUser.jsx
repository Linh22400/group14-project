import React, { useState } from 'react';
import axios from 'axios';
import useValidation from '../hooks/useValidation';

const AddUser = ({ onUserAdded, showNotification }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validateField, validateAll, clearError } = useValidation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateAll({ name, email });
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newUser = { name: name.trim(), email: email.trim() };
      await axios.post('http://localhost:3000/api/users', newUser);
      
      showNotification('Thêm người dùng thành công! 🎉', 'success');
      setName('');
      setEmail('');
      
      if (onUserAdded) {
        onUserAdded();
      }
    } catch (error) {
      console.error('Lỗi khi thêm người dùng:', error);
      showNotification('Có lỗi xảy ra khi thêm người dùng! Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-user-form">
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            <span className="label-icon">👤</span>
            Họ và tên
          </label>
          <input 
            id="name"
            type="text" 
            value={name} 
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
            onBlur={() => validateField('name', name)}
            placeholder="Nhập họ và tên..."
            className={`form-input ${errors.name ? 'error' : ''}`}
            required 
            disabled={isSubmitting}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            <span className="label-icon">📧</span>
            Email
          </label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              clearError('email');
            }}
            onBlur={() => validateField('email', email)}
            placeholder="Nhập địa chỉ email..."
            className={`form-input ${errors.email ? 'error' : ''}`}
            required 
            disabled={isSubmitting}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <button 
          type="submit" 
          className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Đang thêm...
            </>
          ) : (
            <>
              <span className="btn-icon">➕</span>
              Thêm Người Dùng
            </>
          )}
        </button>
      </form>
      
      <style jsx>{`
        .add-user-form {
          width: 100%;
        }
        
        .user-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-label {
          font-weight: 600;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        
        .label-icon {
          font-size: 1.1rem;
        }
        
        .form-input {
          padding: 0.75rem 1rem;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #fff;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-input:disabled {
          background: #f8f9fa;
          cursor: not-allowed;
        }
        
        .form-input::placeholder {
          color: #95a5a6;
        }
        
        .form-input.error {
          border-color: #e74c3c;
          background-color: #fdf2f2;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }
        
        .submit-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .submitting {
          background: linear-gradient(135deg, #95a5a6, #7f8c8d);
        }
        
        .btn-icon {
          font-size: 1.1rem;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
          .user-form {
            gap: 1rem;
          }
          
          .form-input {
            padding: 0.65rem 0.8rem;
            font-size: 0.9rem;
          }
          
          .submit-btn {
            padding: 0.65rem 1.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AddUser;