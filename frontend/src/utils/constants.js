// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  ADMIN: '/admin',
  USERS: '/users',
};

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  USER: '/user',
  USERS: '/users',
  DASHBOARD_STATS: '/dashboard/stats',
};

// User Status
export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

// Role Colors for UI
export const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'error',
  [USER_ROLES.MANAGER]: 'warning',
  [USER_ROLES.EMPLOYEE]: 'info',
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters',
};