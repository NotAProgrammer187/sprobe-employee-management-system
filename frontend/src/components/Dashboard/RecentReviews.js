import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Box,
  alpha,
  useTheme,
  Badge
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { calculateReviewScore, getStatusConfig, getScoreGrade, formatDate } from '../../utils/performanceUtils';

export const RecentReviews = ({ recentReviews, getEmployeeName }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Recent Reviews
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest completed performance evaluations
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/performance/reviews')}
              sx={{ borderRadius: 2 }}
            >
              View All
            </Button>
          </Stack>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {recentReviews.length > 0 ? (
            <Stack spacing={2}>
              {recentReviews.map((review, index) => {
                const reviewScore = calculateReviewScore(review);
                const scoreGrade = getScoreGrade(reviewScore);
                const statusConfig = getStatusConfig(review.status);
                
                return (
                  <Paper
                    key={review.id}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      background: `linear-gradient(135deg, ${alpha(scoreGrade.color, 0.02)} 0%, ${alpha(scoreGrade.color, 0.05)} 100%)`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: scoreGrade.color,
                        transform: 'translateX(8px)',
                        boxShadow: `0 8px 25px ${alpha(scoreGrade.color, 0.15)}`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: `linear-gradient(180deg, ${scoreGrade.color}, ${alpha(scoreGrade.color, 0.7)})`,
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Badge
                        badgeContent={scoreGrade.grade}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            bgcolor: scoreGrade.color,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.7rem'
                          }
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha(scoreGrade.color, 0.15),
                            color: scoreGrade.color,
                            fontWeight: 'bold',
                            width: 56,
                            height: 56,
                            fontSize: '1.2rem'
                          }}
                        >
                          {reviewScore > 0 ? reviewScore.toFixed(1) : '?'}
                        </Avatar>
                      </Badge>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {review.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {getEmployeeName(review.employee_id)} • {formatDate(review.updated_at)}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={review.status}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.bgColor,
                              color: statusConfig.textColor,
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}
                          />
                          {reviewScore > 0 && (
                            <Chip
                              icon={<StarIcon sx={{ fontSize: 14 }} />}
                              label={scoreGrade.level}
                              size="small"
                              sx={{
                                bgcolor: alpha(scoreGrade.color, 0.1),
                                color: scoreGrade.color,
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Stack>
                      </Box>

                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => navigate(`/performance/reviews/${review.id}`)}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <AssignmentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.7 }} />
              <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom>
                No Recent Reviews
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                Start building your team's performance history by creating your first review
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/performance/reviews/new')}
                sx={{ borderRadius: 2 }}
              >
                Create First Review
              </Button>
            </Paper>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};