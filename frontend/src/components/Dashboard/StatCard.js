import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
  Chip,
  Skeleton,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  subtitle, 
  loading = false,
  progress = null,
  onClick = null
}) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, overflow: 'hidden', height: 180 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={40} />
            </Box>
            <Skeleton variant="circular" width={56} height={56} />
          </Stack>
          <Skeleton variant="text" width="40%" height={16} />
          <Skeleton variant="rectangular" width="100%" height={6} sx={{ mt: 1, borderRadius: 3 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        height: 180,
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(color, 0.02)} 0%, ${alpha(color, 0.08)} 100%)`,
        border: `1px solid ${alpha(color, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: onClick ? 'translateY(-4px) scale(1.02)' : 'translateY(-2px)',
          boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.3),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
        }
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight="800" 
              sx={{ 
                lineHeight: 1,
                background: `linear-gradient(45deg, ${color}, ${alpha(color, 0.8)})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.15),
              color: color,
              width: 56,
              height: 56,
              boxShadow: `0 8px 16px ${alpha(color, 0.2)}`,
            }}
          >
            {icon}
          </Avatar>
        </Stack>

        <Box sx={{ mt: 'auto' }}>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
          
          {progress !== null && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(color, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 3,
                }
              }}
            />
          )}

          {trend && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              {trend.includes('+') ? (
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography 
                variant="caption" 
                color={trend.includes('+') ? 'success.main' : 'error.main'}
                fontWeight={600}
              >
                {trend}
              </Typography>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};