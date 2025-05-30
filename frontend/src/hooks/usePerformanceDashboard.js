import { useState, useEffect, useCallback } from 'react';
import { reviewService, employeeService } from '../services';
import { calculateReviewScore, safeToNumber } from '../utils/performanceUtils';

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
    getEmployeeName
  };
};