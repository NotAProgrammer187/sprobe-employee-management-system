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
import EmployeeDashboard from './pages/Performance/EmployeeDashboard';

// Helper function to safely parse user data
const safeParseUser = () => {
  try {
    const userData = localStorage.getItem('user');
    
    if (!userData || userData === 'undefined' || userData === 'null') {
      return null;
    }
    
    const parsed = JSON.parse(userData);
    
    if (!parsed || typeof parsed !== 'object' || !parsed.role) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

// Dashboard Router - decides which dashboard to show based on role
const DashboardRouter = () => {
  const user = safeParseUser();
  
  // If no valid user data, redirect to login
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  
  switch (user.role) {
    case USER_ROLES.ADMIN:
      return <AdminDashboard />;
    case USER_ROLES.MANAGER:
      return <Navigate to="/performance/" replace />;
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