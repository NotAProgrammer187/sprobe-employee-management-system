import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Avatar,
  Box,
  alpha,
  useTheme,
  Badge
} from '@mui/material';
import { getScoreGrade } from '../../utils/performanceUtils';

export const TopPerformersPanel = ({ topPerformers }) => {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha('#FFD700', 0.1)} 0%, ${alpha('#FFA500', 0.05)} 100%)`
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,215,0,0.3)'
            }}>
              <Typography variant="h6">🏆</Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Top Performers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Highest scoring team members
              </Typography>
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {topPerformers.length > 0 ? (
            <Stack spacing={2}>
              {topPerformers.map((performer, index) => {
                const grade = getScoreGrade(performer.averageScore);
                const isChampion = index === 0;
                
                return (
                  <Paper
                    key={performer.employee?.id || index}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: isChampion ? 
                        'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%)' : 
                        'transparent',
                      border: isChampion ? '2px solid #FFD700' : `1px solid ${theme.palette.divider}`,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isChampion ? 
                          '0 12px 24px rgba(255,215,0,0.3)' : 
                          theme.shadows[8]
                      }
                    }}
                  >
                    {isChampion && (
                      <Box sx={{
                        position: 'absolute',
                        top: -10,
                        right: 10,
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        boxShadow: '0 4px 8px rgba(255,215,0,0.4)'
                      }}>
                        🥇 Champion
                      </Box>
                    )}
                    
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Badge
                        badgeContent={`#${index + 1}`}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            bgcolor: grade.color,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.7rem'
                          }
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: isChampion ? '#FFD700' : grade.color,
                            color: isChampion ? '#131A22' : 'white',
                            fontWeight: 'bold',
                            width: 48,
                            height: 48,
                            boxShadow: isChampion ? 
                              '0 6px 16px rgba(255,215,0,0.4)' : 
                              `0 4px 12px ${alpha(grade.color, 0.3)}`
                          }}
                        >
                          {performer.employee?.first_name?.[0]}{performer.employee?.last_name?.[0]}
                        </Avatar>
                      </Badge>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {performer.employee?.first_name} {performer.employee?.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {performer.reviewCount} review{performer.reviewCount !== 1 ? 's' : ''} • {grade.level}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          color={grade.color}
                        >
                          {performer.averageScore.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Grade: {grade.grade}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>
                🎯
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                No Performance Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete some reviews to see top performers
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};