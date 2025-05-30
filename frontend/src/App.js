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

// Simple Dashboard for non-admin users
const SimpleDashboard = () => {
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
      <button 
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
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
  
  if (user.role === USER_ROLES.ADMIN) {
    return <AdminDashboard />;
  }
  
  return <SimpleDashboard />;
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
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;