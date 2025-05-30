import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Stack,
  Box,
  alpha,
  useTheme,
  Tooltip
} from '@mui/material';
import { getStatusConfig } from '../../utils/performanceUtils';

export const StatusDistribution = ({ reviewsByStatus, totalReviews }) => {
  const theme = useTheme();

  const statusOrder = ['draft', 'pending', 'completed', 'approved', 'rejected'];

  return (
    <Card sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
        }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Review Status Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time overview of all performance reviews
          </Typography>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {statusOrder.map((status) => {
              const count = reviewsByStatus[status] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const config = getStatusConfig(status);
              
              return (
                <Grid item xs={6} sm={4} md={2.4} key={status}>
                  <Tooltip 
                    title={`${count} ${status} reviews (${percentage.toFixed(1)}%)`}
                    arrow
                    placement="top"
                  >
                    <Paper
                      sx={{
                        p: 2.5,
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: config.bgColor,
                        border: `2px solid ${alpha(config.textColor, 0.2)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px) scale(1.05)',
                          boxShadow: `0 12px 24px ${alpha(config.textColor, 0.25)}`,
                          borderColor: config.textColor,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: `${Math.max(percentage, 3)}%`,
                          background: `linear-gradient(0deg, ${config.textColor}, ${alpha(config.textColor, 0.7)})`,
                          transition: 'height 0.3s ease',
                        }
                      }}
                    >
                      <Typography 
                        variant="h4" 
                        fontWeight="800" 
                        color={config.textColor}
                        sx={{ position: 'relative', zIndex: 1 }}
                      >
                        {count}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          textTransform: 'uppercase', 
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          color: config.textColor,
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        {status}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ 
                          mt: 1.5, 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(config.textColor, 0.2),
                          position: 'relative',
                          zIndex: 1,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: config.textColor,
                            borderRadius: 3,
                          }
                        }}
                      />
                    </Paper>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};