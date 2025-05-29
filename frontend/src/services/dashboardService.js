import api from './api';

// Get dashboard statistics
const retrieveDashboardStats = async () => {
  const req = api.get('/dashboard/stats').then(({ data }) => data.data);
  return await req;
};

// Get recent activity
const retrieveRecentActivity = async (limit = 10) => {
  const req = api.get(`/dashboard/recent-activity?limit=${limit}`).then(({ data }) => data.data);
  return await req;
};

// Get upcoming reviews
const retrieveUpcomingReviews = async (limit = 5) => {
  const req = api.get(`/dashboard/upcoming-reviews?limit=${limit}`).then(({ data }) => data.data);
  return await req;
};

// Get pending reviews
const retrievePendingReviews = async () => {
  const req = api.get('/dashboard/pending-reviews').then(({ data }) => data.data);
  return await req;
};

// Get overdue reviews
const retrieveOverdueReviews = async () => {
  const req = api.get('/dashboard/overdue-reviews').then(({ data }) => data.data);
  return await req;
};

// Get employee performance summary
const retrieveEmployeePerformanceSummary = async (period = 'month') => {
  const req = api.get(`/dashboard/employee-performance?period=${period}`).then(({ data }) => data.data);
  return await req;
};

// Get department statistics
const retrieveDepartmentStats = async () => {
  const req = api.get('/dashboard/department-stats').then(({ data }) => data.data);
  return await req;
};

// Get review completion rates
const retrieveReviewCompletionRates = async (period = 'month') => {
  const req = api.get(`/dashboard/review-completion-rates?period=${period}`).then(({ data }) => data.data);
  return await req;
};

// Get top performers
const retrieveTopPerformers = async (limit = 10, period = 'month') => {
  const req = api.get(`/dashboard/top-performers?limit=${limit}&period=${period}`).then(({ data }) => data.data);
  return await req;
};

// Get review trends
const retrieveReviewTrends = async (period = '6months') => {
  const req = api.get(`/dashboard/review-trends?period=${period}`).then(({ data }) => data.data);
  return await req;
};

// Get user notifications
const retrieveUserNotifications = async (limit = 10) => {
  const req = api.get(`/dashboard/notifications?limit=${limit}`).then(({ data }) => data.data);
  return await req;
};

// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
  const req = api.patch(`/dashboard/notifications/${notificationId}/read`).then(({ data }) => data.data);
  return await req;
};

// Mark all notifications as read
const markAllNotificationsAsRead = async () => {
  const req = api.patch('/dashboard/notifications/mark-all-read').then(({ data }) => data.data);
  return await req;
};

// Get quick actions
const retrieveQuickActions = async () => {
  const req = api.get('/dashboard/quick-actions').then(({ data }) => data.data);
  return await req;
};

// Get system alerts
const retrieveSystemAlerts = async () => {
  const req = api.get('/dashboard/system-alerts').then(({ data }) => data.data);
  return await req;
};

// Get user profile summary
const retrieveUserProfileSummary = async () => {
  const req = api.get('/dashboard/profile-summary').then(({ data }) => data.data);
  return await req;
};

export const dashboardService = {
  retrieveDashboardStats,
  retrieveRecentActivity,
  retrieveUpcomingReviews,
  retrievePendingReviews,
  retrieveOverdueReviews,
  retrieveEmployeePerformanceSummary,
  retrieveDepartmentStats,
  retrieveReviewCompletionRates,
  retrieveTopPerformers,
  retrieveReviewTrends,
  retrieveUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  retrieveQuickActions,
  retrieveSystemAlerts,
  retrieveUserProfileSummary,
};