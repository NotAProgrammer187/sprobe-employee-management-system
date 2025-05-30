import { VALIDATION_MESSAGES } from './constants';

// Base validation rules
export const required = (message = VALIDATION_MESSAGES.REQUIRED) => (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return message;
  }
  return '';
};

export const email = (message = VALIDATION_MESSAGES.EMAIL_INVALID) => (value) => {
  if (value && !/\S+@\S+\.\S+/.test(value)) {
    return message;
  }
  return '';
};

export const minLength = (min, message) => (value) => {
  if (value && value.length < min) {
    return message || `Must be at least ${min} characters`;
  }
  return '';
};

export const passwordMatch = (confirmField, message = VALIDATION_MESSAGES.PASSWORD_MISMATCH) => (value, allValues) => {
  if (value && allValues[confirmField] && value !== allValues[confirmField]) {
    return message;
  }
  return '';
};

// Pre-configured validation rules
export const loginValidation = {
  email: [
    required(),
    email(),
  ],
  password: [
    required(),
    minLength(6, 'Password must be at least 6 characters'),
  ],
};

export const registerValidation = {
  name: [
    required(),
    minLength(2, VALIDATION_MESSAGES.NAME_MIN_LENGTH),
  ],
  email: [
    required(),
    email(),
  ],
  password: [
    required(),
    minLength(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH),
  ],
  password_confirmation: [
    required(),
    passwordMatch('password'),
  ],
};

export const userFormValidation = {
  name: [
    required(),
    minLength(2, VALIDATION_MESSAGES.NAME_MIN_LENGTH),
  ],
  email: [
    required(),
    email(),
  ],
  role: [
    required(),
  ],
};