import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  Chip
} from '@mui/material';
import {
  Comment as CommentIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

const OverallCommentsSection = ({
  formData,
  onInputChange,
  loading,
  formStatus,
  overallScore,
  completedCriteria,
  totalCriteria
}) => {
  const isReadOnly = formStatus !== 'draft';
  const characterCount = formData.overall_comments?.length || 0;
  const maxCharacters = 2000;

  const getPerformanceLevel = (score) => {
    if (score >= 4.5) return { label: 'Outstanding Performance', color: 'success' };
    if (score >= 3.5) return { label: 'Good Performance', color: 'info' };
    if (score >= 2.5) return { label: 'Satisfactory Performance', color: 'warning' };
    if (score > 0) return { label: 'Needs Improvement', color: 'error' };
    return { label: 'Not Evaluated', color: 'default' };
  };

  const performanceLevel = getPerformanceLevel(overallScore);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        mb: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'info.50',
        borderBottom: '1px solid',
        borderColor: 'info.200'
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CommentIcon sx={{ color: 'info.main' }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.25rem',
                color: 'text.primary'
              }}
            >
              Overall Review Summary
            </Typography>
          </Box>
          
          {overallScore > 0 && (
            <Chip
              label={performanceLevel.label}
              color={performanceLevel.color}
              variant="outlined"
              sx={{ 
                fontWeight: 500,
                bgcolor: 'white'
              }}
            />
          )}
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Provide comprehensive feedback, key achievements, development areas, and future goals
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Performance Summary */}
        {overallScore > 0 && (
          <Alert 
            severity={performanceLevel.color === 'success' ? 'success' : 
                     performanceLevel.color === 'info' ? 'info' : 
                     performanceLevel.color === 'warning' ? 'warning' : 'error'}
            variant="outlined"
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Performance Score: {overallScore.toFixed(1)} / 5.0
                </Typography>
                <Typography variant="body2">
                  Based on {completedCriteria} evaluated criteria
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  opacity: 0.8
                }}
              >
                {overallScore.toFixed(1)}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Comments Field */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Overall Review Comments"
            value={formData.overall_comments}
            onChange={(e) => onInputChange('overall_comments', e.target.value)}
            placeholder="Provide a comprehensive summary including:&#10;• Key achievements and strengths&#10;• Areas for improvement and development&#10;• Specific examples and feedback&#10;• Goals and recommendations for the next period&#10;• Recognition and acknowledgments"
            disabled={loading || isReadOnly}
            inputProps={{
              maxLength: maxCharacters
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isReadOnly ? 'grey.50' : 'white',
                '& fieldset': {
                  borderColor: 'grey.300'
                },
                '&:hover fieldset': {
                  borderColor: isReadOnly ? 'grey.300' : 'primary.main'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main'
                }
              },
              '& .MuiInputBase-input': {
                lineHeight: 1.6
              }
            }}
            InputLabelProps={{
              sx: {
                fontSize: '0.875rem',
                fontWeight: 500
              }
            }}
          />
          
          {/* Character Count */}
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: characterCount > maxCharacters * 0.9 ? 'warning.main' : 'text.secondary' 
              }}
            >
              {characterCount} / {maxCharacters} characters
            </Typography>
            
            {characterCount === 0 && completedCriteria === totalCriteria && (
              <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500 }}>
                ⚠️ Overall comments recommended before submission
              </Typography>
            )}
          </Box>
        </Box>

        {/* Guidelines */}
        <Box sx={{ 
          p: 3,
          bgcolor: 'info.50',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'info.200'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LightbulbIcon sx={{ color: 'info.main', fontSize: '1.25rem' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
              Writing Effective Review Comments
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2
          }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                ✅ Do Include:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                • Specific examples and achievements<br/>
                • Constructive feedback with solutions<br/>
                • Recognition of strengths and growth<br/>
                • Clear goals for next period
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
                ❌ Avoid:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                • Vague or generic statements<br/>
                • Personal attacks or bias<br/>
                • Focusing only on negatives<br/>
                • Unrealistic expectations
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Status Message */}
        {isReadOnly && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 3,
              borderRadius: '8px'
            }}
          >
            This review has been {formStatus === 'pending' ? 'submitted for approval' : formStatus} 
            and can no longer be edited.
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default OverallCommentsSection;