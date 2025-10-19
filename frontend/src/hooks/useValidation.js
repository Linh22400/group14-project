import { useState } from 'react';

const useValidation = () => {
  const [errors, setErrors] = useState({});

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

  // Validate single field
  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error === '';
  };

  // Validate all fields
  const validateAll = (fields) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(fields).forEach(field => {
      const error = validateField(field, fields[field]);
      if (error !== true) {
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