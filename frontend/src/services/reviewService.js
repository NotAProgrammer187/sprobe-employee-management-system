import api from './api';

// Get all reviews
const retrieveReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const req = api.get(`/reviews${queryString ? `?${queryString}` : ''}`).then(({ data }) => data.data);
  return await req;
};

// Get single review
const retrieveReview = async (id) => {
  const req = api.get(`/reviews/${id}`).then(({ data }) => data.data);
  return await req;
};

// Create review
const createReview = async (reviewData) => {
  const req = api.post('/reviews', reviewData).then(({ data }) => data.data);
  return await req;
};

// Update review
const updateReview = async (id, reviewData) => {
  const req = api.put(`/reviews/${id}`, reviewData).then(({ data }) => data.data);
  return await req;
};

// Delete review
const deleteReview = async (id) => {
  const req = api.delete(`/reviews/${id}`).then(({ data }) => data);
  return await req;
};

// Get reviews by employee
const retrieveReviewsByEmployee = async (employeeId) => {
  const req = api.get(`/employees/${employeeId}/reviews`).then(({ data }) => data.data);
  return await req;
};

// Get reviews by status
const retrieveReviewsByStatus = async (status) => {
  const req = api.get(`/reviews?status=${status}`).then(({ data }) => data.data);
  return await req;
};

// Get pending reviews
const retrievePendingReviews = async () => {
  const req = api.get('/reviews?status=pending').then(({ data }) => data.data);
  return await req;
};

// Get completed reviews
const retrieveCompletedReviews = async () => {
  const req = api.get('/reviews?status=completed').then(({ data }) => data.data);
  return await req;
};

// Get approved reviews
const retrieveApprovedReviews = async () => {
  const req = api.get('/reviews?status=approved').then(({ data }) => data.data);
  return await req;
};

// Submit review
const submitReview = async (id, reviewData) => {
  const req = api.post(`/reviews/${id}/submit`, reviewData).then(({ data }) => data.data);
  return await req;
};

// Approve review
const approveReview = async (id) => {
  const req = api.post(`/reviews/${id}/approve`).then(({ data }) => data.data);
  return await req;
};

// Reject review
const rejectReview = async (id, reason) => {
  const req = api.post(`/reviews/${id}/reject`, { reason }).then(({ data }) => data.data);
  return await req;
};

// Get review statistics
const retrieveReviewStats = async (id) => {
  const req = api.get(`/reviews/${id}/stats`).then(({ data }) => data.data);
  return await req;
};

// Get reviews for period
const retrieveReviewsForPeriod = async (startDate, endDate) => {
  const req = api.get(`/reviews?start_date=${startDate}&end_date=${endDate}`).then(({ data }) => data.data);
  return await req;
};

// Get upcoming reviews
const retrieveUpcomingReviews = async (limit = 10) => {
  const req = api.get(`/reviews/upcoming?limit=${limit}`).then(({ data }) => data.data);
  return await req;
};

// Get overdue reviews
const retrieveOverdueReviews = async () => {
  const req = api.get('/reviews/overdue').then(({ data }) => data.data);
  return await req;
};

// Start review
const startReview = async (id) => {
  const req = api.post(`/reviews/${id}/start`).then(({ data }) => data.data);
  return await req;
};

// Complete review
const completeReview = async (id) => {
  const req = api.post(`/reviews/${id}/complete`).then(({ data }) => data.data);
  return await req;
};

// Restore deleted review
const restoreReview = async (id) => {
  const req = api.post(`/reviews/${id}/restore`).then(({ data }) => data.data);
  return await req;
};

export const reviewService = {
  retrieveReviews,
  retrieveReview,
  createReview,
  updateReview,
  deleteReview,
  retrieveReviewsByEmployee,
  retrieveReviewsByStatus,
  retrievePendingReviews,
  retrieveCompletedReviews,
  retrieveApprovedReviews,
  submitReview,
  approveReview,
  rejectReview,
  retrieveReviewStats,
  retrieveReviewsForPeriod,
  retrieveUpcomingReviews,
  retrieveOverdueReviews,
  startReview,
  completeReview,
  restoreReview,
};