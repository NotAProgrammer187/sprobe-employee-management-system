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
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
  Logout as LogoutIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import { reviewService, employeeService } from '../../services';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Force logout even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Employee Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.name || employeeData.employeeProfile?.first_name}!
            </Typography>
          </Box>
          
          {/* Logout Button */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Employee Profile Card */}
      {employeeData.employeeProfile && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">
                  {employeeData.employeeProfile.first_name} {employeeData.employeeProfile.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employeeData.employeeProfile.position} • {employeeData.employeeProfile.department}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manager: {employeeData.employeeProfile.manager_name || 'Not assigned'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color={getScoreColor(employeeData.stats.averageScore) + '.main'}>
                  {employeeData.stats.averageScore || '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Score
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {employeeData.stats.totalReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {employeeData.stats.completedReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {employeeData.stats.averageScore || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {getPerformanceLevel(employeeData.stats.averageScore)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Recent Reviews
              </Typography>
              
              {employeeData.recentReviews.length > 0 ? (
                <List>
                  {employeeData.recentReviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getScoreColor(review.overall_score) + '.main' }}>
                            {review.overall_score || '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={review.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(review.updated_at)} • {getPerformanceLevel(review.overall_score)}
                              </Typography>
                              {review.overall_comments && (
                                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                  "{review.overall_comments.substring(0, 100)}{review.overall_comments.length > 100 ? '...' : ''}"
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          <Chip
                            label={review.status}
                            color={getStatusColor(review.status)}
                            size="small"
                          />
                          <Tooltip title="View Review">
                            <IconButton
                              size="small"
                              onClick={() => handleViewReview(review.id)}
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
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No reviews found. Your manager will create reviews for you.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Info & Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Info
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {user?.role || 'Employee'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {user?.email}
                  </Typography>
                </Box>
                
                {employeeData.stats.lastReviewDate && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Overview
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overall Performance
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(employeeData.stats.averageScore / 5) * 100}
                    color={getScoreColor(employeeData.stats.averageScore)}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {employeeData.stats.averageScore}/5.0 • {getPerformanceLevel(employeeData.stats.averageScore)}
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Keep up the great work! Your performance is being tracked and reviewed regularly.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;