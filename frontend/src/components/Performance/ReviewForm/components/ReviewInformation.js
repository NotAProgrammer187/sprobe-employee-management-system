import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar
} from '@mui/material';

const ReviewInformation = ({ review, employees, templates, onChange, permissions }) => {
  // Helper function to format date for input (YYYY-MM-DD format)
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    try {
      let dateObj;
      
      if (typeof date === 'string') {
        // Handle various string formats
        if (date.includes('T')) {
          // ISO string format
          dateObj = new Date(date);
        } else if (date.includes('-')) {
          // YYYY-MM-DD format
          dateObj = new Date(date + 'T00:00:00');
        } else {
          dateObj = new Date(date);
        }
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        return '';
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      // Format as YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return '';
    }
  };

  // Helper function to handle date input changes
  const handleDateInput = (field, value) => {
    if (value) {
      // Value is already in YYYY-MM-DD format from the input
      onChange(field, value);
    } else {
      onChange(field, null);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Review Information
        </Typography>
        
        <Grid container spacing={3}>
          {/* Employee Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Employee</InputLabel>
              <Select
                value={review.employee_id || ''}
                label="Employee"
                onChange={(e) => onChange('employee_id', e.target.value)}
                disabled={!permissions.canEdit}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    <EmployeeOption employee={employee} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Template Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Review Template</InputLabel>
              <Select
                value={review.review_template_id || ''}
                label="Review Template"
                onChange={(e) => onChange('review_template_id', e.target.value)}
                disabled={!permissions.canEdit}
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    <TemplateOption template={template} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Review Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Review Title"
              value={review.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              disabled={!permissions.canEdit}
              placeholder="Enter a descriptive title for this review"
              helperText="This title will be visible to the employee and managers"
            />
          </Grid>

          {/* Date Range - Using standard date inputs */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="Review Period Start"
              value={formatDateForInput(review.review_period_start)}
              onChange={(e) => handleDateInput('review_period_start', e.target.value)}
              disabled={!permissions.canEdit}
              helperText="Start of the performance review period"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="Review Period End"
              value={formatDateForInput(review.review_period_end)}
              onChange={(e) => handleDateInput('review_period_end', e.target.value)}
              disabled={!permissions.canEdit}
              helperText="End of the performance review period"
              inputProps={{
                min: formatDateForInput(review.review_period_start)
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {/* Review Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Review Date"
              value={formatDateForInput(review.review_date)}
              onChange={(e) => handleDateInput('review_date', e.target.value)}
              disabled={!permissions.canEdit}
              helperText="Date when the review was conducted"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {/* Status Display (if editing existing review) */}
          {review.id && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Status"
                value={review.status || 'draft'}
                disabled
                helperText="Current review status"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          )}

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Review Description"
              value={review.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              disabled={!permissions.canEdit}
              placeholder="Brief overview of the review purpose, scope, and any special considerations..."
              helperText="Optional: Provide context about this review"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Employee Option Component
const EmployeeOption = ({ employee }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
      {employee.first_name?.[0]}{employee.last_name?.[0]}
    </Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
        {employee.first_name} {employee.last_name}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {employee.position} • {employee.department}
      </Typography>
    </Box>
  </Box>
);

// Template Option Component
const TemplateOption = ({ template }) => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
      {template.name}
    </Typography>
    <Typography variant="caption" color="textSecondary">
      {template.type} • {template.description}
    </Typography>
  </Box>
);

export default ReviewInformation;