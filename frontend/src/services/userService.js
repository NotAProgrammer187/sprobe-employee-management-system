import api from '../utils/api';

// Get all users
const retrieveUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const req = api.get(`/users${queryString ? `?${queryString}` : ''}`).then(({ data }) => data);
  return await req;
};

// Get single user
const retrieveUser = async (id) => {
  const req = api.get(`/users/${id}`).then(({ data }) => data);
  return await req;
};

// Create user
const createUser = async (userData) => {
  const req = api.post('/users', userData).then(({ data }) => data);
  return await req;
};

// Update user
const updateUser = async (id, userData) => {
  const req = api.put(`/users/${id}`, userData).then(({ data }) => data);
  return await req;
};

// Delete user
const deleteUser = async (id) => {
  const req = api.delete(`/users/${id}`).then(({ data }) => data);
  return await req;
};

// Get dashboard stats
const getDashboardStats = async () => {
  const req = api.get('/dashboard/stats').then(({ data }) => data);
  return await req;
};

export const userService = {
  retrieveUsers,
  retrieveUser,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
};