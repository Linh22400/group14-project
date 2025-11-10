import { useState, useCallback, useEffect } from 'react';

const useValidation = () => {
  const [errors, setErrors] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  // Validation rules
  const validateName = (name) => {
    if (!name || !name.trim()) {
      return 'Họ tên không được để trống';
    }
    if (name.trim().length < 2) {
      return 'Họ tên phải có ít nhất 2 ký tự';
    }
    if (name.trim().length > 50) {
      return 'Họ tên không được quá 50 ký tự';
    }
    if (!/^[a-zA-ZÀ-ỹà-ỹ\s]+$/.test(name.trim())) {
      return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) {
      return 'Email không được để trống';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Email không đúng định dạng';
    }
    if (email.trim().length > 100) {
      return 'Email không được quá 100 ký tự';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password || !password.trim()) {
      return 'Mật khẩu không được để trống';
    }
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (password.length > 50) {
      return 'Mật khẩu không được quá 50 ký tự';
    }
    return '';
  };

  // Validate single field với debounce
  const validateField = useCallback((field, value) => {
    // Clear existing timer for this field
    if (debounceTimers[field]) {
      clearTimeout(debounceTimers[field]);
    }
    
    // Set new timer (300ms debounce)
    const timer = setTimeout(() => {
      let error = '';
      switch (field) {
        case 'name':
          error = validateName(value);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'password':
          error = validatePassword(value);
          break;
        default:
          break;
      }
      
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
      
      // Clean up timer reference
      setDebounceTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[field];
        return newTimers;
      });
    }, 300);
    
    // Save timer reference
    setDebounceTimers(prev => ({
      ...prev,
      [field]: timer
    }));
    
    return true; // Return true immediately for real-time feedback
  }, [debounceTimers]);

  // Validate all fields - không dùng debounce để có kết quả ngay lập tức
  const validateAll = (fields) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(fields).forEach(field => {
      let error = '';
      const value = fields[field];
      
      // Validate trực tiếp không qua debounce
      switch (field) {
        case 'name':
          error = validateName(value);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'password':
          error = validatePassword(value);
          break;
        default:
          break;
      }
      
      if (error) {
        isValid = false;
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Clear error for specific field
  const clearError = (field) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  // Clear all errors
  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateField,
    validateAll,
    clearError,
    clearAllErrors
  };
};

export default useValidation;