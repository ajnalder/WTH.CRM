
import { useState, useCallback } from 'react';
import { 
  validateEmail, 
  validatePhone, 
  validateUrl, 
  validateRequiredString, 
  validateStringLength, 
  validatePositiveNumber,
  sanitizeAndValidateInput 
} from '@/utils/validation';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  type?: 'email' | 'phone' | 'url' | 'number' | 'text';
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

interface ValidationErrors {
  [key: string]: string[];
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((fieldName: string, value: any, rules: ValidationRule): string[] => {
    const fieldErrors: string[] = [];

    // Required validation
    if (rules.required && !validateRequiredString(String(value))) {
      fieldErrors.push(`${fieldName} is required`);
      return fieldErrors; // Return early if required field is empty
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return fieldErrors;
    }

    const stringValue = String(value);

    // Length validation
    if (rules.minLength && !validateStringLength(stringValue, rules.minLength)) {
      fieldErrors.push(`${fieldName} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && !validateStringLength(stringValue, 0, rules.maxLength)) {
      fieldErrors.push(`${fieldName} must be less than ${rules.maxLength} characters`);
    }

    // Type-specific validation
    switch (rules.type) {
      case 'email':
        if (stringValue && !validateEmail(stringValue)) {
          fieldErrors.push(`${fieldName} must be a valid email address`);
        }
        break;
      case 'phone':
        if (stringValue && !validatePhone(stringValue)) {
          fieldErrors.push(`${fieldName} must be a valid phone number`);
        }
        break;
      case 'url':
        if (stringValue && !validateUrl(stringValue)) {
          fieldErrors.push(`${fieldName} must be a valid URL`);
        }
        break;
      case 'number':
        const numValue = Number(value);
        if (!validatePositiveNumber(numValue, rules.max)) {
          fieldErrors.push(`${fieldName} must be a valid positive number`);
        }
        if (rules.min !== undefined && numValue < rules.min) {
          fieldErrors.push(`${fieldName} must be at least ${rules.min}`);
        }
        break;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    return fieldErrors;
  }, []);

  const validateForm = useCallback((formData: Record<string, any>, validationRules: Record<string, ValidationRule>) => {
    const newErrors: ValidationErrors = {};

    Object.entries(validationRules).forEach(([fieldName, rules]) => {
      const fieldErrors = validateField(fieldName, formData[fieldName], rules);
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateForm,
    validateField,
    clearErrors,
    clearFieldError
  };
};
