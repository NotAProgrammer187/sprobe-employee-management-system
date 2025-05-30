import React from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  Alert,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ReviewFormActions = ({
  isEditing,
  loading,
  formStatus,
  completedCriteria,
  totalCriteria,
  hasUnsavedChanges,
  onSave,
  onSubmit,
  lastSaved
}) => {
  const navigate = useNavigate();
  
  const canSubmit = 
    isEditing && 
    formStatus === 'draft' && 
    totalCriteria > 0 && 
    completedCriteria === totalCriteria;

  const canSave = formStatus === 'draft';
  const isComplete = completedCriteria === totalCriteria && totalCriteria > 0;

  const getReadinessStatus = () => {
    if (totalCriteria === 0) {
      return {
        type: 'info',
        message: 'Select a review template to begin evaluation',
        icon: <WarningIcon />
      };
    }
    
    if (completedCriteria < totalCriteria) {
      return {
        type: 'warning',
        message: `${totalCriteria - completedCriteria} criteria still need to be rated`,
        icon: <WarningIcon />
      };
    }
    
    return {
      type: 'success',
      message: 'All criteria evaluated - ready for submission',
      icon: <CheckCircleIcon />
    };
  };

  const readinessStatus = getReadinessStatus();

  return (
    <Paper 
      elevation={0}
      sx={{ 
        position: 'sticky',
        bottom: 0,
        mt: 4,
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: '8px 8px 0 0',
        bgcolor: 'white',
        zIndex: 10
      }}
    >
      {/* Status Bar */}
      <Box sx={{ 
        px: 3, 
        py: 2,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Alert
              severity={readinessStatus.type}
              variant="outlined"
              icon={readinessStatus.icon}
              sx={{ 
                py: 0,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            >
              {readinessStatus.message}
            </Alert>
            
            {totalCriteria > 0 && (
              <Chip
                label={`${completedCriteria}/${totalCriteria} criteria`}
                color={isComplete ? 'success' : 'warning'}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {hasUnsavedChanges && (
              <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
                • Unsaved changes
              </Typography>
            )}
            
            {lastSaved && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </Typography>
            )}
            
            <Chip
              label={formStatus?.toUpperCase() || 'DRAFT'}
              color={
                formStatus === 'approved' ? 'success' :
                formStatus === 'completed' ? 'info' :
                formStatus === 'pending' ? 'warning' :
                formStatus === 'rejected' ? 'error' : 'default'
              }
              variant="filled"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Left side - Cancel */}
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/performance/reviews')}
            disabled={loading}
            sx={{ 
              minWidth: '120px',
              borderColor: 'grey.300',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'grey.50'
              }
            }}
          >
            Cancel
          </Button>

          {/* Right side - Primary Actions */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {canSave && (
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={onSave}
                disabled={loading}
                sx={{ 
                  minWidth: '120px',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.50'
                  }
                }}
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
            )}

            {canSubmit && (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                onClick={onSubmit}
                disabled={loading || !isComplete}
                sx={{ 
                  minWidth: '140px',
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark'
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300'
                  }
                }}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            )}

            {!canSubmit && isEditing && formStatus !== 'draft' && (
              <Button
                variant="contained"
                disabled
                sx={{ 
                  minWidth: '140px',
                  bgcolor: 'grey.300'
                }}
              >
                {formStatus === 'pending' ? 'Awaiting Approval' :
                 formStatus === 'approved' ? 'Review Approved' :
                 formStatus === 'completed' ? 'Review Complete' :
                 'Review Submitted'}
              </Button>
            )}

            {!isEditing && canSave && (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={onSave}
                disabled={loading || totalCriteria === 0}
                sx={{ minWidth: '140px' }}
              >
                {loading ? 'Creating...' : 'Create Review'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Help Text */}
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {!isEditing ? (
              'Fill in the review information and select a template to begin evaluation'
            ) : formStatus === 'draft' ? (
              'Save your progress anytime. Submit when all criteria are evaluated.'
            ) : (
              `This review is ${formStatus} and cannot be modified.`
            )}
          </Typography>
          
          {canSubmit && (
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
              ✓ Ready for submission
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ReviewFormActions;