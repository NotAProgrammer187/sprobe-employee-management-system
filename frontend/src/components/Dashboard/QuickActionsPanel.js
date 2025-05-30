import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

export const QuickActionsPanel = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const actions = [
    { 
      label: 'Create New Review', 
      icon: <AddIcon />, 
      path: '/performance/reviews/new',
      color: '#FF9900',
      description: 'Start a new performance evaluation'
    },
    { 
      label: 'View All Reviews', 
      icon: <AssessmentIcon />, 
      path: '/performance/reviews',
      color: '#232F3E',
      description: 'Browse all performance reviews'
    },
    { 
      label: 'Manage Templates', 
      icon: <SettingsIcon />, 
      path: '/performance/templates',
      color: '#146EB4',
      description: 'Configure review templates'
    }
  ];

  return (
    <Card sx={{ 
      borderRadius: 3, 
      mb: 3, 
      background: 'linear-gradient(135deg, #232F3E 0%, #131A22 100%)',
      color: 'white',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'rgba(255,153,0,0.1)',
      }} />
      
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Quick Actions
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Streamline your performance management workflow
          </Typography>
        </Box>
        
        <Stack spacing={2}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="contained"
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              fullWidth
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(255,153,0,0.2)',
                  borderColor: '#FF9900',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255,153,0,0.3)',
                }
              }}
            >
              <Box sx={{ textAlign: 'left', flex: 1 }}>
                <Typography variant="button" fontWeight={600}>
                  {action.label}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, textTransform: 'none' }}>
                  {action.description}
                </Typography>
              </Box>
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};