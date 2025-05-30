import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Rating,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncompletedIcon
} from '@mui/icons-material';

const PerformanceCriteriaSection = ({
  criteria,
  onCriteriaChange,
  loading,
  formStatus,
  overallScore
}) => {
  const completedCriteria = criteria.filter(c => c.score > 0).length;
  const progressPercentage = criteria.length > 0 ? (completedCriteria / criteria.length) * 100 : 0;

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'success';
    if (score >= 3.5) return 'info';
    if (score >= 2.5) return 'warning';
    if (score > 0) return 'error';
    return 'default';
  };

  const getScoreLabel = (score) => {
    if (score >= 4.5) return 'Outstanding';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Satisfactory';
    if (score > 0) return 'Needs Improvement';
    return 'Not Rated';
  };

  if (criteria.length === 0) {
    return (
      <Alert 
        severity="info" 
        sx={{ 
          mb: 3,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'info.300',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          No Performance Criteria Available
        </Typography>
        <Typography variant="body2">
          Please select a review template to load performance criteria for evaluation.
        </Typography>
      </Alert>
    );
  }

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
        bgcolor: 'primary.50',
        borderBottom: '1px solid',
        borderColor: 'primary.200'
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssessmentIcon sx={{ color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.25rem',
                color: 'text.primary'
              }}
            >
              Performance Criteria
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`${completedCriteria}/${criteria.length} Completed`}
              color={completedCriteria === criteria.length ? 'success' : 'warning'}
              variant="outlined"
              sx={{ 
                fontWeight: 500,
                bgcolor: 'white'
              }}
            />
            
            {overallScore > 0 && (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'white',
                px: 2,
                py: 0.75,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'primary.300'
              }}>
                <StarIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {overallScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  / 5.0
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1 
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Evaluation Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {Math.round(progressPercentage)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'primary.100',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: completedCriteria === criteria.length ? 'success.main' : 'warning.main'
              }
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Rate each criterion from 1 to 5 stars and provide detailed feedback
        </Typography>
      </Box>

      {/* Criteria List */}
      <Box sx={{ p: 0 }}>
        {criteria.map((criterion, index) => (
          <Accordion 
            key={criterion.id || index}
            defaultExpanded={criterion.score === 0}
            sx={{
              '&:before': { display: 'none' },
              boxShadow: 'none',
              borderBottom: index < criteria.length - 1 ? '1px solid' : 'none',
              borderColor: 'grey.200',
              '&.Mui-expanded': {
                margin: 0
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                py: 2,
                px: 3,
                '&.Mui-expanded': {
                  minHeight: 'auto'
                },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  '&.Mui-expanded': {
                    margin: '12px 0'
                  }
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
                mr: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {criterion.score > 0 ? (
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                  ) : (
                    <UncompletedIcon sx={{ color: 'grey.400', fontSize: '1.25rem' }} />
                  )}
                  
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      {criterion.criteria_name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Weight: {criterion.weight}%
                      </Typography>
                      
                      {criterion.score > 0 && (
                        <>
                          <Box sx={{ 
                            width: '1px', 
                            height: '12px', 
                            bgcolor: 'grey.300' 
                          }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Rating
                              value={criterion.score}
                              readOnly
                              size="small"
                              icon={<StarIcon sx={{ fontSize: '0.875rem' }} />}
                              emptyIcon={<StarBorderIcon sx={{ fontSize: '0.875rem' }} />}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                              {criterion.score}/5
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>

                {criterion.score > 0 && (
                  <Chip
                    label={getScoreLabel(criterion.score)}
                    color={getScoreColor(criterion.score)}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '4px',
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 3, pt: 0, pb: 3 }}>
              {criterion.criteria_description && (
                <Alert 
                  severity="info" 
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    borderRadius: '6px',
                    bgcolor: 'info.50',
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <Typography variant="body2">
                    <strong>Evaluation Criteria:</strong> {criterion.criteria_description}
                  </Typography>
                </Alert>
              )}

              <Grid container spacing={3} alignItems="flex-start">
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: 3,
                    bgcolor: 'grey.50',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    textAlign: 'center'
                  }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 2,
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      Rating Required *
                    </Typography>
                    
                    <Rating
                      value={criterion.score}
                      onChange={(event, newValue) => onCriteriaChange(index, 'score', newValue || 0)}
                      max={5}
                      size="large"
                      icon={<StarIcon fontSize="inherit" />}
                      emptyIcon={<StarBorderIcon fontSize="inherit" />}
                      disabled={loading || formStatus !== 'draft'}
                      sx={{
                        fontSize: '2rem',
                        mb: 2,
                        '& .MuiRating-iconFilled': {
                          color: '#ffc107'
                        },
                        '& .MuiRating-iconHover': {
                          color: '#ffb300'
                        }
                      }}
                    />
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {criterion.score}/5
                    </Typography>
                    
                    {criterion.score > 0 && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontStyle: 'italic'
                        }}
                      >
                        {getScoreLabel(criterion.score)}
                      </Typography>
                    )}
                    
                    {criterion.score === 0 && (
                      <Typography 
                        variant="body2" 
                        sx={{ color: 'warning.main', fontWeight: 500 }}
                      >
                        Please provide a rating
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Detailed Comments & Feedback"
                    value={criterion.comments}
                    onChange={(e) => onCriteriaChange(index, 'comments', e.target.value)}
                    placeholder="Provide specific examples, achievements, areas for improvement, and actionable feedback..."
                    disabled={loading || formStatus !== 'draft'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: 'grey.300'
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main'
                        },
                        '&.Mui-focused fieldset': {
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
                  
                  <Box sx={{ 
                    mt: 2,
                    p: 2,
                    bgcolor: 'info.50',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: 'info.200'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      💡 Tips for effective feedback:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      • Be specific with examples • Include both strengths and areas for improvement 
                      • Suggest actionable steps • Focus on behaviors and outcomes
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Summary Footer */}
      {criteria.length > 0 && (
        <Box sx={{ 
          p: 3, 
          bgcolor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Evaluation Summary
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {completedCriteria} of {criteria.length} criteria have been rated
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: 'white',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Weighted Average:
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  color: overallScore >= 4 ? 'success.main' : 
                         overallScore >= 3 ? 'info.main' : 
                         overallScore >= 2 ? 'warning.main' : 'error.main'
                }}>
                  {overallScore.toFixed(1)} / 5.0
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default PerformanceCriteriaSection;