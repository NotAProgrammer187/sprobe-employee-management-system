import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  LinearProgress,
  Alert,
  alpha,
  useTheme
} from '@mui/material';

export const PerformanceInsightsPanel = ({ stats }) => {
  const theme = useTheme();
  
  const insights = [
    {
      label: 'Completion Rate',
      value: stats.totalReviews > 0 ? 
        Math.round((stats.completedReviews / stats.totalReviews) * 100) : 0,
      color: theme.palette.success.main,
      suffix: '%',
      target: 90
    },
    {
      label: 'Team Performance',
      value: stats.averageScore > 0 ? 
        Math.round((stats.averageScore / 5) * 100) : 0,
      color: theme.palette.info.main,
      suffix: '%',
      target: 80
    },
    {
      label: 'Active Reviews',
      value: stats.pendingReviews,
      color: theme.palette.warning.main,
      suffix: '',
      target: null
    }
  ];

  const getInsightStatus = (value, target, suffix) => {
    if (!target) return 'neutral';
    const numValue = suffix === '%' ? value : value;
    if (numValue >= target) return 'excellent';
    if (numValue >= target * 0.8) return 'good';
    if (numValue >= target * 0.6) return 'fair';
    return 'poor';
  };

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(33,150,243,0.3)'
            }}>
              <Typography variant="h6">📊</Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Performance Insights
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Key metrics and trends
              </Typography>
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {insights.map((insight, index) => {
              const status = getInsightStatus(insight.value, insight.target, insight.suffix);
              const statusColors = {
                excellent: theme.palette.success.main,
                good: theme.palette.info.main,
                fair: theme.palette.warning.main,
                poor: theme.palette.error.main,
                neutral: insight.color
              };
              
              return (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {insight.label}
                    </Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.5}>
                      <Typography 
                        variant="h6" 
                        color={statusColors[status]} 
                        fontWeight="bold"
                      >
                        {insight.value}
                      </Typography>
                      <Typography variant="caption" color={statusColors[status]}>
                        {insight.suffix}
                      </Typography>
                      {insight.target && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          / {insight.target}{insight.suffix}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  
                  <LinearProgress
                    variant="determinate"
                    value={insight.suffix === '%' ? insight.value : Math.min((insight.value / 10) * 100, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(statusColors[status], 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: statusColors[status],
                        borderRadius: 4,
                      }
                    }}
                  />
                  
                  {insight.target && (
                    <Box sx={{ mt: 0.5, textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        Target: {insight.target}{insight.suffix}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>

          {/* Performance Alerts */}
          {stats.pendingReviews > 5 && (
            <Alert 
              severity="warning" 
              sx={{ 
                mt: 3, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                High pending count: {stats.pendingReviews} reviews need attention
              </Typography>
            </Alert>
          )}

          {stats.averageScore > 0 && stats.averageScore < 2.5 && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 3, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Low performance detected. Consider team development initiatives.
              </Typography>
            </Alert>
          )}

          {stats.completedReviews > 0 && stats.averageScore >= 4.0 && (
            <Alert 
              severity="success" 
              sx={{ 
                mt: 3, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                🎉 Excellent team performance! Keep up the great work.
              </Typography>
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};