import api from './api';

// Get all employees
const retrieveEmployees = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const req = api.get(`/employees${queryString ? `?${queryString}` : ''}`).then(({ data }) => data.data);
  return await req;
};

// Get single employee
const retrieveEmployee = async (id) => {
  const req = api.get(`/employees/${id}`).then(({ data }) => data.data);
  return await req;
};

// Create employee
const createEmployee = async (employeeData) => {
  const req = api.post('/employees', employeeData).then(({ data }) => data.data);
  return await req;
};

// Update employee
const updateEmployee = async (id, employeeData) => {
  const req = api.put(`/employees/${id}`, employeeData).then(({ data }) => data.data);
  return await req;
};

// Delete employee
const deleteEmployee = async (id) => {
  const req = api.delete(`/employees/${id}`).then(({ data }) => data);
  return await req;
};

// Search employees
const searchEmployees = async (query) => {
  const req = api.get(`/employees/search?q=${encodeURIComponent(query)}`).then(({ data }) => data.data);
  return await req;
};

// Get employees by department
const retrieveEmployeesByDepartment = async (department) => {
  const req = api.get(`/employees?department=${encodeURIComponent(department)}`).then(({ data }) => data.data);
  return await req;
};

// Get employees by status
const retrieveEmployeesByStatus = async (status) => {
  const req = api.get(`/employees?status=${status}`).then(({ data }) => data.data);
  return await req;
};

// Get active employees
const retrieveActiveEmployees = async () => {
  const req = api.get('/employees?status=active').then(({ data }) => data.data);
  return await req;
};

// Get employee reviews
const retrieveEmployeeReviews = async (id) => {
  const req = api.get(`/employees/${id}/reviews`).then(({ data }) => data.data);
  return await req;
};

// Get employee statistics
const retrieveEmployeeStats = async (id) => {
  const req = api.get(`/employees/${id}/stats`).then(({ data }) => data.data);
  return await req;
};

// Restore deleted employee
const restoreEmployee = async (id) => {
  const req = api.post(`/employees/${id}/restore`).then(({ data }) => data.data);
  return await req;
};

// Get departments list
const retrieveDepartments = async () => {
  const req = api.get('/employees/departments').then(({ data }) => data.data);
  return await req;
};

// Get positions list
const retrievePositions = async () => {
  const req = api.get('/employees/positions').then(({ data }) => data.data);
  return await req;
};

export const employeeService = {
  retrieveEmployees,
  retrieveEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  retrieveEmployeesByDepartment,
  retrieveEmployeesByStatus,
  retrieveActiveEmployees,
  retrieveEmployeeReviews,
  retrieveEmployeeStats,
  restoreEmployee,
  retrieveDepartments,
  retrievePositions,
};