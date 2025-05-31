import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  FormHelperText
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  AccountCircle as ReviewerIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const ReviewBasicInfo = ({
  formData,
  employees,
  templates,
  loading,
  onInputChange,
  errors = {}
}) => {
  const getFieldIcon = (field) => {
    switch (field) {
      case 'employee_id': return <PersonIcon sx={{ fontSize: '1rem' }} />;
      case 'review_template_id': return <AssignmentIcon sx={{ fontSize: '1rem' }} />;
      case 'reviewer_id': return <ReviewerIcon sx={{ fontSize: '1rem' }} />;
      case 'review_date': return <CalendarIcon sx={{ fontSize: '1rem' }} />;
      default: return null;
    }
  };

  const FormSection = ({ title, children }) => (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2,
          fontSize: '1rem',
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: '8px',
        bgcolor: '#fafafa'
      }}
    >
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <AssignmentIcon sx={{ mr: 1.5, color: 'primary.main' }} />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            fontSize: '1.25rem',
            color: 'text.primary'
          }}
        >
          Review Information
        </Typography>
      </Box>
      
      <FormSection title="Basic Details">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth 
              error={!!errors.employee_id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'grey.300'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            >
              <InputLabel sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {getFieldIcon('employee_id')}
                Employee *
              </InputLabel>
              <Select
                value={formData.employee_id}
                label="Employee *"
                onChange={(e) => onInputChange('employee_id', e.target.value)}
                disabled={loading}
                sx={{ 
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                {employees.map((employee) => (
                  <MenuItem 
                    key={employee.id} 
                    value={employee.id}
                    sx={{ 
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'primary.50'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, paddingRight: '200px' }}>
                      <PersonIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      {employee.first_name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.employee_id && (
                <FormHelperText>{errors.employee_id}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth 
              error={!!errors.review_template_id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'grey.300'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            >
              <InputLabel sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {getFieldIcon('review_template_id')}
                Review Template *
              </InputLabel>
              <Select
                value={formData.review_template_id}
                label="Review Template *"
                onChange={(e) => onInputChange('review_template_id', e.target.value)}
                disabled={loading}
              >
                {templates.map((template) => (
                  <MenuItem 
                    key={template.id} 
                    value={template.id}
                    sx={{ 
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'primary.50'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      {template.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.review_template_id && (
                <FormHelperText>{errors.review_template_id}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'grey.300'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            >
              <InputLabel sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {getFieldIcon('reviewer_id')}
                Reviewer
              </InputLabel>
              <Select
                value={formData.reviewer_id}
                label="Reviewer"
                onChange={(e) => onInputChange('reviewer_id', e.target.value)}
                disabled={loading}
              >
                {employees.map((employee) => (
                  <MenuItem 
                    key={employee.id} 
                    value={employee.id}
                    sx={{ 
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'primary.50'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReviewerIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      {employee.first_name} {employee.last_name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Review Date"
              value={formData.review_date}
              onChange={(e) => onInputChange('review_date', e.target.value)}
              InputLabelProps={{ 
                shrink: true,
                sx: {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }
              }}
              InputProps={{
                startAdornment: getFieldIcon('review_date')
              }}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'grey.300'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Review Title"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              placeholder="Performance Review - Employee Name"
              disabled={loading}
              error={!!errors.title}
              helperText={errors.title || 'This will be auto-generated when you select an employee'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'grey.300'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            />
          </Grid>
        </Grid>
      </FormSection>

      <Divider sx={{ my: 3 }} />

      <FormSection title="Review Period">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Period Start"
              value={formData.review_period_start}
              onChange={(e) => onInputChange('review_period_start', e.target.value)}
              InputLabelProps={{ 
                shrink: true,
                sx: {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'grey.300'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Period End"
              value={formData.review_period_end}
              onChange={(e) => onInputChange('review_period_end', e.target.value)}
              InputLabelProps={{ 
                shrink: true,
                sx: {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'grey.300'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="Brief description of this review cycle..."
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'grey.300'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            />
          </Grid>
        </Grid>
      </FormSection>
    </Paper>
  );
};

export default ReviewBasicInfo;