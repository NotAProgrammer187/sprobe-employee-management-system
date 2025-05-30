import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LinearProgress,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

import { reviewService, employeeService, dashboardService } from '../../services';

const PerformanceDashboard = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalReviews: 0,
      completedReviews: 0,
      pendingReviews: 0,
      averageScore: 0,
      totalEmployees: 0
    },
    recentReviews: [],
    upcomingReviews: [],
    topPerformers: [],
    reviewsByStatus: {},
    monthlyTrends: []
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load multiple data sources
      const [
        allReviews,
        employees,
        upcomingReviews,
        completedReviews
      ] = await Promise.all([
        reviewService.retrieveReviews(),
        employeeService.retrieveActiveEmployees(),
        reviewService.retrieveUpcomingReviews(5),
        reviewService.retrieveCompletedReviews()
      ]);

      // Calculate statistics
      const stats = {
        totalReviews: allReviews.length,
        completedReviews: allReviews.filter(r => r.status === 'completed' || r.status === 'approved').length,
        pendingReviews: allReviews.filter(r => r.status === 'pending').length,
        averageScore: calculateAverageScore(completedReviews),
        totalEmployees: employees.length
      };

      // Get recent reviews (last 5 completed/approved)
      const recentReviews = allReviews
        .filter(r => r.status === 'completed' || r.status === 'approved')
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5);

      // Calculate top performers (employees with highest average scores)
      const topPerformers = calculateTopPerformers(completedReviews, employees);

      // Group reviews by status
      const reviewsByStatus = {
        draft: allReviews.filter(r => r.status === 'draft').length,
        pending: allReviews.filter(r => r.status === 'pending').length,
        completed: allReviews.filter(r => r.status === 'completed').length,
        approved: allReviews.filter(r => r.status === 'approved').length,
        rejected: allReviews.filter(r => r.status === 'rejected').length
      };

      setDashboardData({
        stats,
        recentReviews,
        upcomingReviews: upcomingReviews || [],
        topPerformers,
        reviewsByStatus,
        monthlyTrends: [] // Could be implemented with historical data
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
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

  const calculateTopPerformers = (reviews, employees) => {
    // Group reviews by employee and calculate average scores
    const employeeScores = {};
    
    reviews.forEach(review => {
      if (review.overall_score > 0) {
        if (!employeeScores[review.employee_id]) {
          employeeScores[review.employee_id] = {
            scores: [],
            count: 0
          };
        }
        employeeScores[review.employee_id].scores.push(review.overall_score);
        employeeScores[review.employee_id].count++;
      }
    });

    // Calculate averages and create top performers list
    const performers = Object.entries(employeeScores)
      .map(([employeeId, data]) => {
        const employee = employees.find(emp => emp.id === parseInt(employeeId));
        const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
        
        return {
          employee,
          averageScore: Math.round(averageScore * 10) / 10,
          reviewCount: data.count
        };
      })
      .filter(p => p.employee) // Only include valid employees
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    return performers;
  };

  const getEmployeeName = (employeeId, employees) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
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
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Key Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {dashboardData.stats.totalReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {dashboardData.stats.completedReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {dashboardData.stats.pendingReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {dashboardData.stats.averageScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                {dashboardData.stats.totalEmployees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Review Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Status Distribution
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(dashboardData.reviewsByStatus).map(([status, count]) => (
                  <Grid item xs={6} sm={4} md={2.4} key={status}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h5" color={`${getStatusColor(status)}.main`}>
                        {count}
                      </Typography>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                        {status}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(count / dashboardData.stats.totalReviews) * 100}
                        color={getStatusColor(status)}
                        sx={{ mt: 1, height: 4 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Quick Actions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/performance/reviews/new')}
                  fullWidth
                >
                  Create New Review
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/performance/reviews')}
                  fullWidth
                >
                  View All Reviews
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/performance/templates')}
                  fullWidth
                >
                  Manage Templates
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reviews and Top Performers */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Recent Reviews */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Reviews
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/performance/reviews')}
                >
                  View All
                </Button>
              </Box>
              
              {dashboardData.recentReviews.length > 0 ? (
                <List>
                  {dashboardData.recentReviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: getScoreColor(review.overall_score) + '.main' }}>
                            {review.overall_score || '?'}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={review.title}
                          secondary={`${getEmployeeName(review.employee_id, [])} • ${formatDate(review.updated_at)}`}
                        />
                        <Chip
                          label={review.status}
                          color={getStatusColor(review.status)}
                          size="small"
                        />
                        <Tooltip title="View Review">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/performance/reviews/${review.id}`)}
                            sx={{ ml: 1 }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                      {index < dashboardData.recentReviews.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No recent reviews found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              
              {dashboardData.topPerformers.length > 0 ? (
                <List>
                  {dashboardData.topPerformers.map((performer, index) => (
                    <React.Fragment key={performer.employee?.id || index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            #{index + 1}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={`${performer.employee?.first_name} ${performer.employee?.last_name}`}
                          secondary={`${performer.reviewCount} review${performer.reviewCount !== 1 ? 's' : ''}`}
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color={getScoreColor(performer.averageScore) + '.main'}>
                            {performer.averageScore}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            avg score
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < dashboardData.topPerformers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No performance data available yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Reviews */}
      {dashboardData.upcomingReviews.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Upcoming Reviews
                  </Typography>
                  <Chip
                    icon={<ScheduleIcon />}
                    label={`${dashboardData.upcomingReviews.length} pending`}
                    color="warning"
                    variant="outlined"
                  />
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Review Title</TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.upcomingReviews.map((review) => (
                        <TableRow key={review.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {review.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getEmployeeName(review.employee_id, [])}
                          </TableCell>
                          <TableCell>
                            {review.review_period_end ? formatDate(review.review_period_end) : 'Not set'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={review.status}
                              color={getStatusColor(review.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/performance/reviews/${review.id}/edit`)}
                            >
                              Continue
                            </Button>
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

      {/* Performance Insights */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h6" color="primary.main">
                  Performance Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Key metrics and recommendations
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {dashboardData.stats.completedReviews > 0 ? 
                      Math.round((dashboardData.stats.completedReviews / dashboardData.stats.totalReviews) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2">
                    Completion Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="info.main">
                    {dashboardData.stats.averageScore > 0 ? 
                      Math.round((dashboardData.stats.averageScore / 5) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2">
                    Average Performance
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {dashboardData.topPerformers.length}
                  </Typography>
                  <Typography variant="body2">
                    Top Performers
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {dashboardData.stats.pendingReviews > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  You have {dashboardData.stats.pendingReviews} pending review{dashboardData.stats.pendingReviews !== 1 ? 's' : ''} 
                  that need attention. Consider reviewing them to maintain performance evaluation schedules.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceDashboard;