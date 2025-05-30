import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { AuthProvider } from './context/AuthContext';
import theme from './styles/theme';
import { ROUTES, USER_ROLES } from './utils/constants';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PerformanceMain from './pages/Performance/PerformanceMain';
import ManagerDashboard from './pages/Performance/ManagerDashboard';

// Employee Dashboard for regular employees
const EmployeeDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to Employee Management System</h1>
      <p>You are successfully logged in as {user?.role}!</p>
      <p>Welcome, {user?.name}</p>
      
      {/* Employee-specific information */}
      <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '500px', margin: '2rem auto' }}>
        <h3>Employee Dashboard</h3>
        <p>As an employee, you can:</p>
        <ul>
          <li>View your performance reviews</li>
          <li>Update your profile information</li>
          <li>View company announcements</li>
          <li>Access employee resources</li>
        </ul>
      </div>
      
      <button 
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Logout
      </button>
    </div>
  );
};

// Dashboard Router - decides which dashboard to show based on role
const DashboardRouter = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  switch (user.role) {
    case USER_ROLES.ADMIN:
      return <AdminDashboard />;
    case USER_ROLES.MANAGER:
      return <ManagerDashboard />;
    case USER_ROLES.EMPLOYEE:
      return <EmployeeDashboard />;
    default:
      // Fallback for unknown roles
      return <EmployeeDashboard />;
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            {/* Performance Management Routes - For Admins and Managers */}
            <Route
              path="/performance/*"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
                  <PerformanceMain />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;