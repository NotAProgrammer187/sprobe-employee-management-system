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
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ReviewInformation = ({ review, employees, templates, onChange, permissions }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                  value={review.employee_id}
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
                  value={review.review_template_id}
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
                value={review.title}
                onChange={(e) => onChange('title', e.target.value)}
                disabled={!permissions.canEdit}
                placeholder="Enter a descriptive title for this review"
                helperText="This title will be visible to the employee and managers"
              />
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Review Period Start"
                value={review.review_period_start}
                onChange={(date) => onChange('review_period_start', date)}
                disabled={!permissions.canEdit}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    required
                    helperText="Start of the performance review period"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Review Period End"
                value={review.review_period_end}
                onChange={(date) => onChange('review_period_end', date)}
                disabled={!permissions.canEdit}
                minDate={review.review_period_start}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    required
                    helperText="End of the performance review period"
                  />
                )}
              />
            </Grid>

            {/* Review Date */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Review Date"
                value={review.review_date}
                onChange={(date) => onChange('review_date', date)}
                disabled={!permissions.canEdit}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth
                    helperText="Date when the review was conducted"
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Review Description"
                value={review.description}
                onChange={(e) => onChange('description', e.target.value)}
                disabled={!permissions.canEdit}
                placeholder="Brief overview of the review purpose, scope, and any special considerations..."
                helperText="Optional: Provide context about this review"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
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