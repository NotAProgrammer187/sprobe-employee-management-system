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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  RateReview as ReviewIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import { reviewService, employeeService } from '../../services';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    myEmployees: [],
    pendingReviews: [],
    myReviews: [],
    stats: {
      totalEmployees: 0,
      pendingReviews: 0,
      completedReviews: 0,
      averageTeamScore: 0
    }
  });

  // Load manager-specific data
  useEffect(() => {
    if (user) {
      loadManagerData();
    }
  }, [user]);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get manager's name from user data
      const managerName = user.name;
      
      // Load employees managed by this manager
      const allEmployees = await employeeService.retrieveActiveEmployees();
      const myEmployees = allEmployees.filter(emp => 
        emp.manager_name === managerName || 
        emp.manager_name === `${user.name}` ||
        emp.manager_id === user.id // If you have manager_id field
      );

      // Load all reviews to find manager's reviews
      const allReviews = await reviewService.retrieveReviews();
      
      // Get reviews where current user is the reviewer
      const myReviews = allReviews.filter(review => 
        review.reviewer_id === user.id ||
        review.reviewer_name === managerName
      );

      // Get pending reviews assigned to this manager
      const pendingReviews = myReviews.filter(review => 
        review.status === 'pending' || review.status === 'draft'
      );

      // Get completed reviews by this manager
      const completedReviews = myReviews.filter(review => 
        review.status === 'completed' || review.status === 'approved'
      );

      // Calculate average team score
      const averageTeamScore = calculateAverageTeamScore(completedReviews);

      const stats = {
        totalEmployees: myEmployees.length,
        pendingReviews: pendingReviews.length,
        completedReviews: completedReviews.length,
        averageTeamScore
      };

      setDashboardData({
        myEmployees,
        pendingReviews: pendingReviews.slice(0, 5), // Show latest 5
        myReviews: myReviews.slice(0, 5), // Show latest 5
        stats
      });

    } catch (err) {
      setError('Failed to load manager dashboard data');
      console.error('Error loading manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageTeamScore = (reviews) => {
    const reviewsWithScores = reviews.filter(r => r.overall_score > 0);
    if (reviewsWithScores.length === 0) return 0;
    
    const total = reviewsWithScores.reduce((sum, r) => sum + r.overall_score, 0);
    return Math.round((total / reviewsWithScores.length) * 10) / 10;
  };

  const handleCreateReview = (employeeId = null) => {
    if (employeeId) {
      navigate(`/performance/reviews/new?employee_id=${employeeId}`);
    } else {
      navigate('/performance/reviews/new');
    }
  };

  const handleViewReview = (reviewId) => {
    navigate(`/performance/reviews/${reviewId}`);
  };

  const handleEditReview = (reviewId) => {
    navigate(`/performance/reviews/${reviewId}/edit`);
  };

  const getEmployeeInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
              Manager Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user.name}! Here's your team overview.
            </Typography>
          </Box>
          
          {/* Logout Button */}
          <Button
            variant="outlined"
            color="error"
            onClick={async () => {
              try {
                // Clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to login
                window.location.href = '/login';
              } catch (error) {
                console.error('Logout error:', error);
                // Force redirect even if error
                window.location.href = '/login';
              }
            }}
            sx={{ minWidth: '100px' }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {dashboardData.stats.totalEmployees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {dashboardData.stats.pendingReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {dashboardData.stats.completedReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {dashboardData.stats.averageTeamScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Team Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* My Team Members */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  My Team Members
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateReview()}
                >
                  New Review
                </Button>
              </Box>
              
              {dashboardData.myEmployees.length > 0 ? (
                <List>
                  {dashboardData.myEmployees.map((employee, index) => (
                    <React.Fragment key={employee.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {getEmployeeInitials(employee.first_name, employee.last_name)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${employee.first_name} ${employee.last_name}`}
                          secondary={`${employee.position} • ${employee.department}`}
                        />
                        <Tooltip title="Create Review">
                          <IconButton
                            size="small"
                            onClick={() => handleCreateReview(employee.id)}
                            color="primary"
                          >
                            <ReviewIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                      {index < dashboardData.myEmployees.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No team members found. Contact admin if this seems incorrect.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Reviews */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Pending Reviews
                </Typography>
                {dashboardData.stats.pendingReviews > 0 && (
                  <Chip
                    label={`${dashboardData.stats.pendingReviews} pending`}
                    color="warning"
                    size="small"
                  />
                )}
              </Box>
              
              {dashboardData.pendingReviews.length > 0 ? (
                <List>
                  {dashboardData.pendingReviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getStatusColor(review.status) + '.main' }}>
                            <AssignmentIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={review.title}
                          secondary={`Due: ${review.review_period_end ? formatDate(review.review_period_end) : 'Not set'}`}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => handleViewReview(review.id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditReview(review.id)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                      {index < dashboardData.pendingReviews.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No pending reviews. Great job staying on top of things!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reviews Table */}
      {dashboardData.myReviews.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Reviews
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Review Title</TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.myReviews.map((review) => (
                        <TableRow key={review.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {review.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {/* You might need to fetch employee name from employee_id */}
                            Employee #{review.employee_id}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={review.status}
                              color={getStatusColor(review.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {review.overall_score ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  color={getScoreColor(review.overall_score) + '.main'}
                                >
                                  {review.overall_score}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  /5.0
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Not scored
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(review.updated_at || review.created_at)}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => handleViewReview(review.id)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {(review.status === 'draft' || review.status === 'pending') && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditReview(review.id)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<ReviewIcon />}
                onClick={() => handleCreateReview()}
              >
                Create New Review
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/performance/reviews')}
              >
                View All Reviews
              </Button>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/performance/dashboard')}
              >
                Full Performance Dashboard
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;