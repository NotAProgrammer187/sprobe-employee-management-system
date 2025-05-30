import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Box } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && user) {
    const hasAccess = allowedRoles.includes(user.role);
    
    if (!hasAccess) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            Access denied. You don't have permission to access this page.
            Your role: {user.role}. Required roles: {allowedRoles.join(', ')}.
          </Alert>
        </Box>
      );
    }
  }

  return children;
};

export default ProtectedRoute;