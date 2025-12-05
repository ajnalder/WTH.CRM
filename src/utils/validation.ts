export const sanitizeHtml = async (input: string): Promise<string> => {
  const DOMPurify = (await import('dompurify')).default;
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7 && cleanPhone.length <= 15;
};

export const sanitizeString = (input: string, maxLength: number = 255): string => {
  return input.trim().slice(0, maxLength);
};

export const validateUrl = (url: string): boolean => {
  if (!url || url.length > 2048) return false; // Reasonable URL length limit
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export const validateCurrency = (amount: number): boolean => {
  return amount >= 0 && amount <= 999999999.99 && Number.isFinite(amount);
};

// New validation functions for enhanced security
export const validatePositiveNumber = (value: number, max: number = Number.MAX_SAFE_INTEGER): boolean => {
  return Number.isFinite(value) && value >= 0 && value <= max;
};

export const validateStringLength = (input: string, minLength: number = 0, maxLength: number = 255): boolean => {
  return input.length >= minLength && input.length <= maxLength;
};

export const validateRequiredString = (input: string): boolean => {
  return typeof input === 'string' && input.trim().length > 0;
};

export const validateDropboxUrl = (url: string): boolean => {
  if (!validateUrl(url)) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('dropbox.com') || urlObj.hostname.includes('dl.dropboxusercontent.com');
  } catch {
    return false;
  }
};

export const sanitizeAndValidateInput = (input: string, maxLength: number = 255): { value: string; isValid: boolean } => {
  const sanitized = sanitizeString(input, maxLength);
  return {
    value: sanitized,
    isValid: validateStringLength(sanitized, 0, maxLength)
  };
};
