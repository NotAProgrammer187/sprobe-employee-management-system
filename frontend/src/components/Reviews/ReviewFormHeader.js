import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ReviewFormHeader = ({ 
  isEditing, 
  reviewStatus, 
  employeeName,
  overallScore,
  completedCriteria,
  totalCriteria 
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft';
  };

  return (
    <Box sx={{ 
      mb: 4,
      pb: 3,
      borderBottom: '1px solid',
      borderColor: 'grey.200'
    }}>
      {/* Navigation */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs sx={{ fontSize: '0.875rem' }}>
          <Link
            color="inherit"
            href="/performance"
            onClick={(e) => {
              e.preventDefault();
              navigate('/performance');
            }}
            sx={{ 
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Performance Management
          </Link>
          <Link
            color="inherit"
            href="/performance/reviews"
            onClick={(e) => {
              e.preventDefault();
              navigate('/performance/reviews');
            }}
            sx={{ 
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Reviews
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
            {isEditing ? 'Edit Review' : 'Create Review'}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header with Back Button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/performance/reviews')}
            sx={{ 
              p: 1,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.300',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.75rem',
                color: 'text.primary',
                mb: 0.5
              }}
            >
              {isEditing ? 'Edit Performance Review' : 'Create Performance Review'}
            </Typography>
            
            {employeeName && (
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  fontSize: '1rem'
                }}
              >
                for {employeeName}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Status and Progress */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {reviewStatus && (
            <Chip
              label={getStatusLabel(reviewStatus)}
              color={getStatusColor(reviewStatus)}
              variant="outlined"
              sx={{ 
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            />
          )}
          
          {totalCriteria > 0 && (
            <Tooltip title="Completed criteria progress">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'grey.50',
                px: 2,
                py: 1,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                <InfoIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {completedCriteria}/{totalCriteria} criteria
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Overall Score Display */}
      {overallScore > 0 && (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          p: 2,
          bgcolor: 'primary.50',
          border: '1px solid',
          borderColor: 'primary.200',
          borderRadius: '8px'
        }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Overall Score
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {overallScore.toFixed(1)} / 5.0
            </Typography>
          </Box>
          
          <Box sx={{ 
            width: '1px', 
            height: '40px', 
            bgcolor: 'primary.200' 
          }} />
          
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Progress
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {Math.round((completedCriteria / totalCriteria) * 100)}% Complete
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ReviewFormHeader;