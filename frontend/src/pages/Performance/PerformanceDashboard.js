import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Button,
  Alert,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { reviewService, employeeService } from '../../services';
import { calculateReviewScore, safeToNumber, formatDate, getScoreGrade, getEmployeeInitials } from '../../utils/performanceUtils';

export const usePerformanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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

  const calculateAverageScore = useCallback((reviews) => {
    if (!reviews || reviews.length === 0) return 0;

    const reviewsWithValidScores = reviews
      .map(review => calculateReviewScore(review))
      .filter(score => score > 0);
    
    if (reviewsWithValidScores.length === 0) return 0;
    
    const total = reviewsWithValidScores.reduce((sum, score) => sum + score, 0);
    return Math.round((total / reviewsWithValidScores.length) * 10) / 10;
  }, []);

  const calculateTopPerformers = useCallback((reviews, employeesData) => {
    if (!reviews || !employeesData || reviews.length === 0 || employeesData.length === 0) {
      return [];
    }

    const employeeScores = {};
    
    reviews.forEach(review => {
      const reviewScore = calculateReviewScore(review);
      if (reviewScore > 0) {
        if (!employeeScores[review.employee_id]) {
          employeeScores[review.employee_id] = {
            scores: [],
            count: 0
          };
        }
        employeeScores[review.employee_id].scores.push(reviewScore);
        employeeScores[review.employee_id].count++;
      }
    });

    const performers = Object.entries(employeeScores)
      .map(([employeeId, data]) => {
        const employee = employeesData.find(emp => emp.id === parseInt(employeeId));
        if (!employee) return null;
        
        const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
        
        return {
          employee,
          averageScore: Math.round(averageScore * 10) / 10,
          reviewCount: data.count
        };
      })
      .filter(p => p !== null)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    return performers;
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [
        allReviews,
        employeesData,
        upcomingReviews,
        completedReviews
      ] = await Promise.all([
        reviewService.retrieveReviews(),
        employeeService.retrieveActiveEmployees(),
        reviewService.retrieveUpcomingReviews(5),
        reviewService.retrieveCompletedReviews()
      ]);

      setEmployees(employeesData || []);

      const stats = {
        totalReviews: allReviews?.length || 0,
        completedReviews: allReviews?.filter(r => r.status === 'completed' || r.status === 'approved').length || 0,
        pendingReviews: allReviews?.filter(r => r.status === 'pending').length || 0,
        averageScore: calculateAverageScore(completedReviews || []),
        totalEmployees: employeesData?.length || 0
      };

      const recentReviews = allReviews
        ?.filter(r => r.status === 'completed' || r.status === 'approved')
        ?.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        ?.slice(0, 5) || [];

      const topPerformers = calculateTopPerformers(completedReviews || [], employeesData || []);

      const reviewsByStatus = {
        draft: allReviews?.filter(r => r.status === 'draft').length || 0,
        pending: allReviews?.filter(r => r.status === 'pending').length || 0,
        completed: allReviews?.filter(r => r.status === 'completed').length || 0,
        approved: allReviews?.filter(r => r.status === 'approved').length || 0,
        rejected: allReviews?.filter(r => r.status === 'rejected').length || 0
      };

      setDashboardData({
        stats,
        recentReviews,
        upcomingReviews: upcomingReviews || [],
        topPerformers,
        reviewsByStatus,
        monthlyTrends: []
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateAverageScore, calculateTopPerformers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const getEmployeeName = useCallback((employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  }, [employees]);

  const getEmployee = useCallback((employeeId) => {
    return employees.find(emp => emp.id === employeeId);
  }, [employees]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    loading,
    error,
    setError,
    employees,
    refreshing,
    dashboardData,
    handleRefresh,
    getEmployeeName,
    getEmployee,
    loadDashboardData
  };
};

// Dashboard Component
const PerformanceDashboard = () => {
  const {
    loading,
    error,
    setError,
    refreshing,
    dashboardData,
    handleRefresh,
    getEmployeeName,
    getEmployee
  } = usePerformanceDashboard();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => {
            setError('');
            handleRefresh();
          }}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const { stats, recentReviews, upcomingReviews, topPerformers, reviewsByStatus } = dashboardData;

  return (
    <Box>
      {/* Header with Refresh Button */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Typography variant="h5" component="h2">
          Performance Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Reviews
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="primary">
                {stats.totalReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Completed
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="success.main">
                {stats.completedReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="warning.main">
                {stats.pendingReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PeopleIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Employees
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="info.main">
                {stats.totalEmployees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Average Score Card */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Performance Score
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" component="div" color="primary" sx={{ mr: 2 }}>
                  {stats.averageScore.toFixed(1)}
                </Typography>
                <Box>
                  {stats.averageScore > 0 && (
                    <Chip 
                      label={getScoreGrade(stats.averageScore)?.grade || 'N/A'}
                      color={stats.averageScore >= 4 ? 'success' : stats.averageScore >= 3 ? 'primary' : 'warning'}
                      size="small"
                    />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {getScoreGrade(stats.averageScore)?.level || 'No data'}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.averageScore / 5) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Reviews by Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reviews by Status
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(reviewsByStatus).map(([status, count]) => (
                  <Grid item xs={6} key={status}>
                    <Box textAlign="center">
                      <Typography variant="h4" component="div">
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {status}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reviews and Top Performers */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reviews
            </Typography>
            {recentReviews.length > 0 ? (
              <List>
                {recentReviews.map((review, index) => {
                  const employee = getEmployee(review.employee_id);
                  const score = calculateReviewScore(review);
                  const grade = getScoreGrade(score);
                  
                  return (
                    <React.Fragment key={review.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: grade.color }}>
                            {employee ? getEmployeeInitials(employee.first_name, employee.last_name) : '??'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={getEmployeeName(review.employee_id)}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Score: {score.toFixed(1)} • {formatDate(review.updated_at)}
                              </Typography>
                              <Chip 
                                label={review.status.toUpperCase()} 
                                size="small" 
                                color={review.status === 'completed' ? 'success' : 'default'}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentReviews.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No recent reviews found
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Performers
            </Typography>
            {topPerformers.length > 0 ? (
              <List>
                {topPerformers.map((performer, index) => {
                  const { employee, averageScore, reviewCount } = performer;
                  const grade = getScoreGrade(averageScore);
                  
                  return (
                    <React.Fragment key={employee.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: grade.color }}>
                            {index === 0 && <StarIcon />}
                            {index !== 0 && getEmployeeInitials(employee.first_name, employee.last_name)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${employee.first_name} ${employee.last_name}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Average Score: {averageScore.toFixed(1)} • {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                              </Typography>
                              <Chip 
                                label={grade.grade}
                                size="small"
                                sx={{ 
                                  mt: 0.5,
                                  backgroundColor: grade.color + '20',
                                  color: grade.color 
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < topPerformers.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No performance data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Reviews */}
      {upcomingReviews.length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming Reviews
          </Typography>
          <List>
            {upcomingReviews.map((review, index) => (
              <React.Fragment key={review.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getEmployeeName(review.employee_id)}
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Due: {formatDate(review.due_date)} • Period: {review.review_period || 'Not specified'}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < upcomingReviews.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default PerformanceDashboard;