import api from './api';

// Get all reviews
const retrieveReviews = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/reviews${queryString ? `?${queryString}` : ''}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    throw error;
  }
};

// Get single review
const retrieveReview = async (id) => {
  try {
    const response = await api.get(`/reviews/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving review:', error);
    throw error;
  }
};

// Create review
const createReview = async (reviewData) => {
  try {
    console.log('Creating review with data:', reviewData);
    
    const response = await api.post('/reviews', reviewData);
    console.log('Review created successfully:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Error creating review:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Update review
const updateReview = async (id, reviewData) => {
  try {
    console.log('Updating review:', id, reviewData);
    
    const response = await api.put(`/reviews/${id}`, reviewData);
    console.log('Review updated successfully:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Error updating review:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Delete review
const deleteReview = async (id) => {
  try {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Submit review
const submitReview = async (id) => {
  try {
    console.log('Submitting review:', id);
    
    const response = await api.post(`/reviews/${id}/submit`);
    console.log('Review submitted successfully:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    
    // Extract error message from response
    const errorMessage = error.response?.data?.message || 'Failed to submit review';
    throw new Error(errorMessage);
  }
};

// Approve review
const approveReview = async (id) => {
  try {
    const response = await api.post(`/reviews/${id}/approve`);
    return response.data.data;
  } catch (error) {
    console.error('Error approving review:', error);
    throw error;
  }
};

// Reject review
const rejectReview = async (id, reason) => {
  try {
    const response = await api.post(`/reviews/${id}/reject`, { reason });
    return response.data.data;
  } catch (error) {
    console.error('Error rejecting review:', error);
    throw error;
  }
};

// Get reviews by employee
const retrieveReviewsByEmployee = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/reviews`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving reviews by employee:', error);
    throw error;
  }
};

// Get reviews by status
const retrieveReviewsByStatus = async (status) => {
  try {
    const response = await api.get(`/reviews?status=${status}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving reviews by status:', error);
    throw error;
  }
};

// Get pending reviews
const retrievePendingReviews = async () => {
  try {
    const response = await api.get('/reviews?status=pending');
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving pending reviews:', error);
    throw error;
  }
};

// Get completed reviews
const retrieveCompletedReviews = async () => {
  try {
    const response = await api.get('/reviews/completed');
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving completed reviews:', error);
    throw error;
  }
};

// Get upcoming reviews
const retrieveUpcomingReviews = async (limit = 10) => {
  try {
    const response = await api.get(`/reviews/upcoming?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving upcoming reviews:', error);
    throw error;
  }
};

// Get approved reviews
const retrieveApprovedReviews = async () => {
  try {
    const response = await api.get('/reviews?status=approved');
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving approved reviews:', error);
    throw error;
  }
};

// Get reviews by reviewer
const retrieveReviewsByReviewer = async (reviewerId) => {
  try {
    const response = await api.get(`/reviews/by-reviewer/${reviewerId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving reviews by reviewer:', error);
    throw error;
  }
};

// Get reviews for period
const retrieveReviewsForPeriod = async (startDate, endDate) => {
  try {
    const response = await api.get(`/reviews?start_date=${startDate}&end_date=${endDate}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving reviews for period:', error);
    throw error;
  }
};

export const reviewService = {
  retrieveReviews,
  retrieveReview,
  createReview,
  updateReview,
  deleteReview,
  submitReview,
  approveReview,
  rejectReview,
  retrieveReviewsByEmployee,
  retrieveReviewsByStatus,
  retrievePendingReviews,
  retrieveCompletedReviews,
  retrieveUpcomingReviews,
  retrieveApprovedReviews,
  retrieveReviewsByReviewer,
  retrieveReviewsForPeriod,
};