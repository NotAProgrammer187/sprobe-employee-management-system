import api from './api';

// Get criteria by review
const retrieveCriteriaByReview = async (reviewId) => {
  const req = api.get(`/reviews/${reviewId}/criteria`).then(({ data }) => data.data);
  return await req;
};

// Get single review criteria
const retrieveReviewCriteria = async (reviewId, criteriaId) => {
  const req = api.get(`/reviews/${reviewId}/criteria/${criteriaId}`).then(({ data }) => data.data);
  return await req;
};

// Create review criteria
const createReviewCriteria = async (reviewId, criteriaData) => {
  const req = api.post(`/reviews/${reviewId}/criteria`, criteriaData).then(({ data }) => data.data);
  return await req;
};

// Update review criteria
const updateReviewCriteria = async (reviewId, criteriaId, criteriaData) => {
  const req = api.put(`/reviews/${reviewId}/criteria/${criteriaId}`, criteriaData).then(({ data }) => data.data);
  return await req;
};

// Bulk update review criteria
const bulkUpdateReviewCriteria = async (reviewId, criteriaList) => {
  const req = api.put(`/reviews/${reviewId}/criteria/bulk`, { criteria: criteriaList }).then(({ data }) => data.data);
  return await req;
};

// Delete review criteria
const deleteReviewCriteria = async (reviewId, criteriaId) => {
  const req = api.delete(`/reviews/${reviewId}/criteria/${criteriaId}`).then(({ data }) => data);
  return await req;
};

// Score review criteria
const scoreReviewCriteria = async (reviewId, criteriaId, score, comments = '') => {
  const req = api.patch(`/reviews/${reviewId}/criteria/${criteriaId}/score`, {
    score,
    comments
  }).then(({ data }) => data.data);
  return await req;
};

// Get criteria by template
const retrieveCriteriaByTemplate = async (templateId) => {
  const req = api.get(`/review-templates/${templateId}/criteria`).then(({ data }) => data.data);
  return await req;
};

// Copy criteria from template
const copyCriteriaFromTemplate = async (reviewId, templateId) => {
  const req = api.post(`/reviews/${reviewId}/criteria/copy-from-template`, {
    template_id: templateId
  }).then(({ data }) => data.data);
  return await req;
};

// Reorder criteria
const reorderCriteria = async (reviewId, criteriaOrder) => {
  const req = api.patch(`/reviews/${reviewId}/criteria/reorder`, {
    order: criteriaOrder
  }).then(({ data }) => data.data);
  return await req;
};

// Get criteria statistics
const retrieveCriteriaStats = async (reviewId) => {
  const req = api.get(`/reviews/${reviewId}/criteria/stats`).then(({ data }) => data.data);
  return await req;
};

// Get unscored criteria
const retrieveUnscoredCriteria = async (reviewId) => {
  const req = api.get(`/reviews/${reviewId}/criteria?unscored=1`).then(({ data }) => data.data);
  return await req;
};

// Get scored criteria
const retrieveScoredCriteria = async (reviewId) => {
  const req = api.get(`/reviews/${reviewId}/criteria?scored=1`).then(({ data }) => data.data);
  return await req;
};

// Calculate weighted score
const calculateWeightedScore = async (reviewId) => {
  const req = api.get(`/reviews/${reviewId}/criteria/weighted-score`).then(({ data }) => data.data);
  return await req;
};

// Validate criteria completion
const validateCriteriaCompletion = async (reviewId) => {
  const req = api.get(`/reviews/${reviewId}/criteria/validate`).then(({ data }) => data.data);
  return await req;
};

export const reviewCriteriaService = {
  retrieveCriteriaByReview,
  retrieveReviewCriteria,
  createReviewCriteria,
  updateReviewCriteria,
  bulkUpdateReviewCriteria,
  deleteReviewCriteria,
  scoreReviewCriteria,
  retrieveCriteriaByTemplate,
  copyCriteriaFromTemplate,
  reorderCriteria,
  retrieveCriteriaStats,
  retrieveUnscoredCriteria,
  retrieveScoredCriteria,
  calculateWeightedScore,
  validateCriteriaCompletion,
};