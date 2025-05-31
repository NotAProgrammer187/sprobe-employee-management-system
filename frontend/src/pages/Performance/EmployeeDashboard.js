import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import { reviewService, employeeService } from '../../services';
import LogoutButton from '../../components/Common/LogoutButton';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState({
    myReviews: [],
    recentReviews: [],
    employeeProfile: null,
    stats: {
      totalReviews: 0,
      completedReviews: 0,
      averageScore: 0,
      lastReviewDate: null
    }
  });

  // Load employee-specific data
  useEffect(() => {
    if (user) {
      loadEmployeeData();
    }
  }, [user]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load employee profile
      let employeeProfile = null;
      try {
        const allEmployees = await employeeService.retrieveActiveEmployees();
        employeeProfile = allEmployees.find(emp => 
          emp.email === user.email || 
          emp.user_id === user.id
        );
      } catch (profileError) {
        console.warn('Could not load employee profile:', profileError);
      }

      // Load employee's reviews
      let myReviews = [];
      let recentReviews = [];
      try {
        const allReviews = await reviewService.retrieveReviews();
        
        // Filter reviews where this user is the employee being reviewed
        myReviews = allReviews.filter(review => 
          review.employee_id === employeeProfile?.id ||
          review.employee_email === user.email
        );
        
        // Get recent reviews (last 3)
        recentReviews = myReviews
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 3);
          
      } catch (reviewError) {
        console.warn('Could not load reviews:', reviewError);
      }

      // Calculate stats
      const completedReviews = myReviews.filter(r => 
        r.status === 'completed' || r.status === 'approved'
      );
      
      const averageScore = calculateAverageScore(completedReviews);
      const lastReviewDate = myReviews.length > 0 ? 
        Math.max(...myReviews.map(r => new Date(r.updated_at))) : null;

      const stats = {
        totalReviews: myReviews.length,
        completedReviews: completedReviews.length,
        averageScore,
        lastReviewDate
      };

      setEmployeeData({
        myReviews,
        recentReviews,
        employeeProfile,
        stats
      });

    } catch (err) {
      console.error('Employee dashboard loading error:', err);
      setError('Some features may not be available. Please check your connection.');
      
      // Set default empty data
      setEmployeeData({
        myReviews: [],
        recentReviews: [],
        employeeProfile: null,
        stats: {
          totalReviews: 0,
          completedReviews: 0,
          averageScore: 0,
          lastReviewDate: null
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageScore = (reviews) => {
    const reviewsWithScores = reviews.filter(r => r.overall_score > 0);
    if (reviewsWithScores.length === 0) return 0;
    
    const total = reviewsWithScores.reduce((sum, r) => sum + r.overall_score, 0);
    return Math.round((total / reviewsWithScores.length) * 10) / 10;
  };

  const handleViewReview = (reviewId) => {
    navigate(`/performance/reviews/${reviewId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'warning',
      completed: 'info',
      approved: 'success',
      rejected: 'error'
    };
    return colors[status] || 'default';
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'success';
    if (score >= 3.5) return 'info';
    if (score >= 2.5) return 'warning';
    return 'error';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Satisfactory';
    if (score > 0) return 'Needs Improvement';
    return 'Not Rated';
  };

  // Get user info for display
  const getUserDisplayName = () => {
    if (!user) return 'Unknown User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    if (user.name) return user.name;
    if (employeeData.employeeProfile) {
      return `${employeeData.employeeProfile.first_name} ${employeeData.employeeProfile.last_name}`;
    }
    if (user.email) return user.email;
    
    return 'Unknown User';
  };

  const getUserInitials = () => {
    if (!user) return '??';
    
    // Try user data first
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    // Try employee profile data
    if (employeeData.employeeProfile) {
      const empFirst = employeeData.employeeProfile.first_name || '';
      const empLast = employeeData.employeeProfile.last_name || '';
      if (empFirst && empLast) {
        return `${empFirst.charAt(0)}${empLast.charAt(0)}`.toUpperCase();
      }
    }
    
    if (user.name) {
      const parts = user.name.split(' ');
      return parts.length >= 2 
        ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
        : user.name.substring(0, 2).toUpperCase();
    }
    
    return user.email ? user.email.substring(0, 2).toUpperCase() : '??';
  };

  const getUserRole = () => {
    if (!user) return 'Employee';
    const role = user.role || user.userRole || 'Employee';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const getRoleColor = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'employee': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Enhanced Header with User Info and Logout */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 4,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        {/* Left side - Title and Welcome */}
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              mb: 1
            }}
          >
            Employee Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Welcome back, {getUserDisplayName()}!
          </Typography>
        </Box>

        {/* Right side - User Info and Logout */}
        {user && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            ml: 2 
          }}>
            {/* User Info Card */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              px: 2,
              py: 1,
              bgcolor: 'grey.50',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {getUserInitials()}
              </Avatar>
              
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {getUserDisplayName()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={getUserRole()}
                    color={getRoleColor()}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.675rem',
                      height: '20px',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  {employeeData.employeeProfile?.department && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {employeeData.employeeProfile.department}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Enhanced Logout Button */}
            <LogoutButton 
              variant="button" 
              size="small"
              showConfirmDialog={true}
              onLogoutStart={() => console.log('Employee logging out...')}
              onLogoutComplete={() => console.log('Employee logout completed')}
            />
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {/* Employee Profile Card - Enhanced */}
      {employeeData.employeeProfile && (
        <Card 
          elevation={0}
          sx={{ 
            mb: 3,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: '12px'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main', 
                  width: 80, 
                  height: 80,
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                {getUserInitials()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {employeeData.employeeProfile.first_name} {employeeData.employeeProfile.last_name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                  {employeeData.employeeProfile.position} • {employeeData.employeeProfile.department}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Manager: {employeeData.employeeProfile.manager_name || 'Not assigned'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: getScoreColor(employeeData.stats.averageScore) + '.main',
                    fontWeight: 700,
                    mb: 0.5
                  }}
                >
                  {employeeData.stats.averageScore || '—'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Average Score
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {getPerformanceLevel(employeeData.stats.averageScore)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Enhanced */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '8px'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
                {employeeData.stats.totalReviews}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Total Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '8px'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 700, mb: 1 }}>
                {employeeData.stats.completedReviews}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '8px'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <StarIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h3" sx={{ color: 'warning.main', fontWeight: 700, mb: 1 }}>
                {employeeData.stats.averageScore || '—'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '8px'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'info.main', fontWeight: 700, mb: 1, fontSize: '1.2rem' }}>
                {getPerformanceLevel(employeeData.stats.averageScore)}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Performance Level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Reviews */}
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '8px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                My Recent Reviews
              </Typography>
              
              {employeeData.recentReviews.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {employeeData.recentReviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getScoreColor(review.overall_score) + '.main' }}>
                            {review.overall_score || '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {review.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(review.updated_at)} • {getPerformanceLevel(review.overall_score)}
                              </Typography>
                              {review.overall_comments && (
                                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
                                  "{review.overall_comments.substring(0, 100)}{review.overall_comments.length > 100 ? '...' : ''}"
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          <Chip
                            label={review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            color={getStatusColor(review.status)}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: '6px' }}
                          />
                          <Tooltip title="View Review">
                            <IconButton
                              size="small"
                              onClick={() => handleViewReview(review.id)}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'primary.50'
                                }
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                      {index < employeeData.recentReviews.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No reviews found yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your manager will create reviews for you
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Info & Performance Overview */}
        <Grid item xs={12} md={4}>
          {/* Quick Info */}
          <Card 
            elevation={0}
            sx={{ 
              mb: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '8px'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Info
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Role
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {user?.role || 'Employee'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {user?.email}
                  </Typography>
                </Box>
                
                {employeeData.stats.lastReviewDate && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Last Review
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(employeeData.stats.lastReviewDate)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          {employeeData.stats.averageScore > 0 && (
            <Card 
              elevation={0}
              sx={{ 
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: '8px'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Performance Overview
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    Overall Performance
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(employeeData.stats.averageScore / 5) * 100}
                    color={getScoreColor(employeeData.stats.averageScore)}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {employeeData.stats.averageScore}/5.0 • {getPerformanceLevel(employeeData.stats.averageScore)}
                  </Typography>
                </Box>

                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 2,
                    borderRadius: '8px'
                  }}
                >
                  <Typography variant="body2">
                    Keep up the great work! Your performance is being tracked and reviewed regularly.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmployeeDashboard;