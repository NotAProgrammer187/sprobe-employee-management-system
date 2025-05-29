import api from './api';

// Login user
const login = async (credentials) => {
  const req = api.post('/login', credentials).then(({ data }) => data);
  return await req;
};

// Register user
const register = async (userData) => {
  const req = api.post('/register', userData).then(({ data }) => data);
  return await req;
};

// Logout user
const logout = async () => {
  const req = api.post('/logout').then(({ data }) => data);
  return await req;
};

// Get current user
const getUser = async () => {
  const req = api.get('/user').then(({ data }) => data);
  return await req;
};

// Refresh token
const refreshToken = async () => {
  const req = api.post('/refresh').then(({ data }) => data);
  return await req;
};

// Forgot password
const forgotPassword = async (email) => {
  const req = api.post('/forgot-password', { email }).then(({ data }) => data);
  return await req;
};

// Reset password
const resetPassword = async (token, password, passwordConfirmation) => {
  const req = api.post('/reset-password', {
    token,
    password,
    password_confirmation: passwordConfirmation
  }).then(({ data }) => data);
  return await req;
};

// Change password
const changePassword = async (currentPassword, newPassword, passwordConfirmation) => {
  const req = api.post('/change-password', {
    current_password: currentPassword,
    password: newPassword,
    password_confirmation: passwordConfirmation
  }).then(({ data }) => data);
  return await req;
};

export const authService = {
  login,
  register,
  logout,
  getUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
};