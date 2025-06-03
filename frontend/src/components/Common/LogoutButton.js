import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LogoutButton = ({ 
  variant = 'button', // 'button', 'text'
  size = 'medium',
  showConfirmDialog = true,
  onLogoutStart,
  onLogoutComplete
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleLogoutClick = () => {
    if (showConfirmDialog) {
      setShowDialog(true);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setShowDialog(false);
      
      // Call onLogoutStart callback if provided
      if (onLogoutStart) onLogoutStart();
      
      // Perform logout
      await logout();
      
      // Call onLogoutComplete callback if provided
      if (onLogoutComplete) onLogoutComplete();
      
      // Navigate to login
      navigate('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  // Text variant
  if (variant === 'text') {
    return (
      <>
        <Button
          onClick={handleLogoutClick}
          disabled={loading}
          size={size}
          id="logout-text-btn"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.50'
            }
          }}
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </Button>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <Dialog
            open={showDialog}
            onClose={handleDialogClose}
            id="logout-confirm-dialog"
            PaperProps={{
              sx: {
                borderRadius: '12px',
                minWidth: 400
              }
            }}
          >
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sign Out
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Are you sure you want to sign out of your account?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={handleDialogClose}
                variant="outlined"
                sx={{ mr: 1 }}
                id="logout-dialog-cancel-btn"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleLogout}
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                id="logout-dialog-confirm-btn"
              >
                Sign Out
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <Button
        onClick={handleLogoutClick}
        disabled={loading}
        variant="outlined"
        size={size}
        startIcon={loading ? <CircularProgress size={16} /> : <LogoutIcon />}
        id="logout-main-btn"
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          borderColor: 'error.main',
          color: 'error.main',
          '&:hover': {
            bgcolor: 'error.50',
            borderColor: 'error.dark'
          },
          '&:disabled': {
            borderColor: 'grey.300',
            color: 'grey.500'
          }
        }}
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </Button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Dialog
          open={showDialog}
          onClose={handleDialogClose}
          id="logout-confirm-dialog"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 400
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Sign Out
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to sign out of your account?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={handleDialogClose}
              variant="outlined"
              sx={{ mr: 1 }}
              id="logout-dialog-cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              id="logout-dialog-confirm-btn"
            >
              Sign Out
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default LogoutButton;