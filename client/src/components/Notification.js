import React, { useEffect, useState, useCallback } from 'react';

const Notification = ({ message, type = 'error', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, handleClose]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation then call onClose
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  if (!message || !isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#d4edda';
      case 'error':
        return '#f8d7da';
      case 'warning':
        return '#fff3cd';
      case 'info':
        return '#d1ecf1';
      default:
        return '#f8d7da';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#155724';
      case 'error':
        return '#721c24';
      case 'warning':
        return '#856404';
      case 'info':
        return '#0c5460';
      default:
        return '#721c24';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: getBackgroundColor(),
      color: getTextColor(),
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: '300px',
      animation: isExiting ? 'slideOut 0.3s ease-in forwards' : 'slideIn 0.3s ease-out',
    }}>
      <span style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
      <span style={{ flex: 1, fontSize: '0.9rem' }}>{message}</span>
      <button 
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: getTextColor(),
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '0',
          marginLeft: '10px'
        }}
      >
        ×
      </button>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Notification;