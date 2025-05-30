import React from 'react';
import { Box, Typography, Chip, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getScoreColor, getStatusColor } from '../utils/validation';

const ReviewHeader = ({ review, reviewId }) => {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/performance" color="inherit">
          Performance
        </Link>
        <Link component={RouterLink} to="/performance/reviews" color="inherit">
          Reviews
        </Link>
        <Typography color="text.primary">
          {reviewId ? 'Edit Review' : 'New Review'}
        </Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {reviewId ? 'Performance Review' : 'New Performance Review'}
          </Typography>
          
          {review.title && (
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {review.title}
            </Typography>
          )}
        </Box>

        {/* Status Badges */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {review.status && (
            <Chip
              label={review.status.toUpperCase().replace('_', ' ')}
              color={getStatusColor(review.status)}
              variant="outlined"
              size="medium"
            />
          )}
          
          {review.overall_score > 0 && (
            <Chip
              label={`Score: ${review.overall_score.toFixed(1)}/5.0`}
              color={getScoreColor(review.overall_score)}
              variant="filled"
              size="medium"
            />
          )}
        </Box>
      </Box>

      {/* Employee Info */}
      {review.employee && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body1">
            <strong>Employee:</strong> {review.employee.first_name} {review.employee.last_name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {review.employee.position} • {review.employee.department}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReviewHeader;