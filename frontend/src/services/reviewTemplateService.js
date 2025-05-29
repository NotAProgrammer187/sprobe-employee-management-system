import api from './api';

// Get all review templates
const retrieveReviewTemplates = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const req = api.get(`/review-templates${queryString ? `?${queryString}` : ''}`).then(({ data }) => data.data);
  return await req;
};

// Get single review template
const retrieveReviewTemplate = async (id) => {
  const req = api.get(`/review-templates/${id}`).then(({ data }) => data.data);
  return await req;
};

// Create review template
const createReviewTemplate = async (templateData) => {
  const req = api.post('/review-templates', templateData).then(({ data }) => data.data);
  return await req;
};

// Update review template
const updateReviewTemplate = async (id, templateData) => {
  const req = api.put(`/review-templates/${id}`, templateData).then(({ data }) => data.data);
  return await req;
};

// Delete review template
const deleteReviewTemplate = async (id) => {
  const req = api.delete(`/review-templates/${id}`).then(({ data }) => data);
  return await req;
};

// Get active review templates
const retrieveActiveReviewTemplates = async () => {
  const req = api.get('/review-templates?active=1').then(({ data }) => data.data);
  return await req;
};

// Get review template criteria
const retrieveReviewTemplateCriteria = async (id) => {
  const req = api.get(`/review-templates/${id}/criteria`).then(({ data }) => data.data);
  return await req;
};

// Get review templates by type
const retrieveReviewTemplatesByType = async (type) => {
  const req = api.get(`/review-templates?type=${type}`).then(({ data }) => data.data);
  return await req;
};

// Duplicate review template
const duplicateReviewTemplate = async (id, newName) => {
  const req = api.post(`/review-templates/${id}/duplicate`, { name: newName }).then(({ data }) => data.data);
  return await req;
};

// Activate review template
const activateReviewTemplate = async (id) => {
  const req = api.patch(`/review-templates/${id}/activate`).then(({ data }) => data.data);
  return await req;
};

// Deactivate review template
const deactivateReviewTemplate = async (id) => {
  const req = api.patch(`/review-templates/${id}/deactivate`).then(({ data }) => data.data);
  return await req;
};

// Get review template usage stats
const retrieveReviewTemplateStats = async (id) => {
  const req = api.get(`/review-templates/${id}/stats`).then(({ data }) => data.data);
  return await req;
};

// Get template types
const retrieveTemplateTypes = async () => {
  const req = api.get('/review-templates/types').then(({ data }) => data.data);
  return await req;
};

// Restore deleted review template
const restoreReviewTemplate = async (id) => {
  const req = api.post(`/review-templates/${id}/restore`).then(({ data }) => data.data);
  return await req;
};

export const reviewTemplateService = {
  retrieveReviewTemplates,
  retrieveReviewTemplate,
  createReviewTemplate,
  updateReviewTemplate,
  deleteReviewTemplate,
  retrieveActiveReviewTemplates,
  retrieveReviewTemplateCriteria,
  retrieveReviewTemplatesByType,
  duplicateReviewTemplate,
  activateReviewTemplate,
  deactivateReviewTemplate,
  retrieveReviewTemplateStats,
  retrieveTemplateTypes,
  restoreReviewTemplate,
};