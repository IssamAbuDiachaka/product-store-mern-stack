/**
 * Custom hook for form state management with validation
 * Provides reusable form logic with error handling and validation
 */

import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update single field value
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Update multiple field values
  const setValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Mark field as touched
  const setTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Validate single field
  const validateField = useCallback((name, value) => {
    if (!validationSchema || !validationSchema[name]) return null;

    const fieldValidation = validationSchema[name];
    
    // Handle function validation
    if (typeof fieldValidation === 'function') {
      return fieldValidation(value, values);
    }

    // Handle object validation (with rules)
    if (typeof fieldValidation === 'object') {
      const { required, min, max, pattern, custom } = fieldValidation;

      // Required validation
      if (required && (!value || value.toString().trim() === '')) {
        return fieldValidation.message || `${name} is required`;
      }

      // Skip other validations if field is empty and not required
      if (!value) return null;

      // Min length validation
      if (min && value.toString().length < min) {
        return `${name} must be at least ${min} characters`;
      }

      // Max length validation
      if (max && value.toString().length > max) {
        return `${name} must be less than ${max} characters`;
      }

      // Pattern validation
      if (pattern && !pattern.test(value)) {
        return fieldValidation.patternMessage || `${name} format is invalid`;
      }

      // Custom validation
      if (custom && typeof custom === 'function') {
        return custom(value, values);
      }
    }

    return null;
  }, [validationSchema, values]);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validationSchema) return true;

    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationSchema, values, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    try {
      // Validate form before submission
      const isValid = validateForm();
      
      if (!isValid) {
        setIsSubmitting(false);
        return false;
      }

      // Call the submit handler
      await onSubmit(values);
      
      return true;
    } catch (error) {
      setErrors({ submit: error.message || 'Submission failed' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  // Get field props for easy binding to inputs
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => {
      setTouched(name, true);
      const error = validateField(name, values[name]);
      if (error) {
        setFieldError(name, error);
      }
    },
    error: touched[name] ? errors[name] : null,
  }), [values, errors, touched, setValue, setTouched, validateField, setFieldError]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setValues,
    setTouched,
    setFieldError,
    clearErrors,
    resetForm,
    validateField,
    validateForm,
    handleSubmit,
    getFieldProps,
  };
};

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required') => ({
    required: true,
    message,
  }),
  
  minLength: (min, message) => ({
    min,
    message: message || `Must be at least ${min} characters`,
  }),
  
  maxLength: (max, message) => ({
    max,
    message: message || `Must be less than ${max} characters`,
  }),
  
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Please enter a valid email address',
  },
  
  url: {
    pattern: /^https?:\/\/.+\..+/,
    patternMessage: 'Please enter a valid URL',
  },
  
  number: (min = 0, message) => ({
    custom: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < min) {
        return message || `Must be a number greater than or equal to ${min}`;
      }
      return null;
    },
  }),
  
  integer: (min = 0, message) => ({
    custom: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < min) {
        return message || `Must be a whole number greater than or equal to ${min}`;
      }
      return null;
    },
  }),
};
