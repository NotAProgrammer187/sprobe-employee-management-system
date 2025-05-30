import api from './api';

// Get all review templates
const retrieveReviewTemplates = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/review-templates${queryString ? `?${queryString}` : ''}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving review templates:', error);
    throw error;
  }
};

// Get single review template
const retrieveReviewTemplate = async (id) => {
  try {
    const response = await api.get(`/review-templates/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving review template:', error);
    throw error;
  }
};

// Create review template with criteria
const createReviewTemplate = async (templateData) => {
  try {
    console.log('Creating template with data:', templateData);
    
    // Transform criteria data to match backend expectations
    const payload = {
      name: templateData.name,
      description: templateData.description,
      type: templateData.type || 'annual',
      active: templateData.is_active !== undefined ? templateData.is_active : templateData.active,
      criteria: templateData.criteria.map((criteria, index) => ({
        name: criteria.name || criteria.criteria_name,
        description: criteria.description || criteria.criteria_description,
        weight: parseInt(criteria.weight) || 0,
        sort_order: index + 1
      }))
    };

    console.log('Transformed payload:', payload);
    
    const response = await api.post('/review-templates', payload);
    
    console.log('Backend response:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Error creating review template:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Update review template with criteria
const updateReviewTemplate = async (id, templateData) => {
  try {
    console.log('Updating template with data:', templateData);
    
    // Transform criteria data to match backend expectations
    const payload = {
      name: templateData.name,
      description: templateData.description,
      type: templateData.type || 'annual',
      active: templateData.is_active !== undefined ? templateData.is_active : templateData.active,
      criteria: templateData.criteria.map((criteria, index) => ({
        id: criteria.id, // Include ID for existing criteria
        name: criteria.name || criteria.criteria_name,
        description: criteria.description || criteria.criteria_description,
        weight: parseInt(criteria.weight) || 0,
        sort_order: index + 1
      }))
    };

    console.log('Transformed update payload:', payload);
    
    const response = await api.put(`/review-templates/${id}`, payload);
    
    console.log('Backend update response:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Error updating review template:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Delete review template
const deleteReviewTemplate = async (id) => {
  try {
    const response = await api.delete(`/review-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review template:', error);
    throw error;
  }
};

// Get active review templates
const retrieveActiveReviewTemplates = async () => {
  try {
    const response = await api.get('/review-templates?active=1');
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving active review templates:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Get review template criteria - MAIN FUNCTION FOR LOADING CRITERIA
const retrieveReviewTemplateCriteria = async (id) => {
  try {
    console.log(`Fetching criteria for template ID: ${id}`);
    
    const response = await api.get(`/review-templates/${id}/criteria`);
    
    console.log('API Response:', response.data);
    
    if (response.data.success) {
      const criteria = response.data.data;
      
      console.log(`Retrieved ${criteria.length} criteria for template ${id}:`, criteria);
      
      // Transform criteria to match frontend expectations
      const transformedCriteria = criteria.map(criterion => ({
        id: criterion.id,
        name: criterion.criteria_name,
        description: criterion.criteria_description,
        weight: parseFloat(criterion.weight),
        sort_order: criterion.sort_order,
        criteria_name: criterion.criteria_name, // Keep both for compatibility
        criteria_description: criterion.criteria_description
      }));
      
      console.log('Transformed criteria:', transformedCriteria);
      
      return transformedCriteria;
    } else {
      console.warn('API returned success=false:', response.data);
      return [];
    }
  } catch (error) {
    console.error(`Error retrieving criteria for template ${id}:`, error);
    
    // Log more details about the error
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Get review templates by type
const retrieveReviewTemplatesByType = async (type) => {
  try {
    const response = await api.get(`/review-templates?type=${type}`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving review templates by type:', error);
    throw error;
  }
};

// Add criteria to existing template
const addCriteriaToTemplate = async (templateId, criteriaData) => {
  try {
    console.log('Adding criteria to template:', templateId, criteriaData);
    
    const payload = {
      criteria_name: criteriaData.name || criteriaData.criteria_name,
      criteria_description: criteriaData.description || criteriaData.criteria_description,
      weight: parseInt(criteriaData.weight) || 0
    };
    
    const response = await api.post(`/review-templates/${templateId}/criteria`, payload);
    return response.data.data;
  } catch (error) {
    console.error('Error adding criteria to template:', error);
    throw error;
  }
};

// Update specific criteria
const updateTemplateCriteria = async (templateId, criteriaId, criteriaData) => {
  try {
    console.log('Updating criteria:', templateId, criteriaId, criteriaData);
    
    const payload = {
      criteria_name: criteriaData.name || criteriaData.criteria_name,
      criteria_description: criteriaData.description || criteriaData.criteria_description,
      weight: parseInt(criteriaData.weight) || 0
    };
    
    const response = await api.put(`/review-templates/${templateId}/criteria/${criteriaId}`, payload);
    return response.data.data;
  } catch (error) {
    console.error('Error updating template criteria:', error);
    throw error;
  }
};

// Delete specific criteria
const deleteTemplateCriteria = async (templateId, criteriaId) => {
  try {
    const response = await api.delete(`/review-templates/${templateId}/criteria/${criteriaId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting template criteria:', error);
    throw error;
  }
};

// Duplicate review template
const duplicateReviewTemplate = async (id, newName) => {
  try {
    const response = await api.post(`/review-templates/${id}/duplicate`, { name: newName });
    return response.data.data;
  } catch (error) {
    console.error('Error duplicating review template:', error);
    throw error;
  }
};

// Activate review template
const activateReviewTemplate = async (id) => {
  try {
    const response = await api.patch(`/review-templates/${id}/activate`);
    return response.data.data;
  } catch (error) {
    console.error('Error activating review template:', error);
    throw error;
  }
};

// Deactivate review template
const deactivateReviewTemplate = async (id) => {
  try {
    const response = await api.patch(`/review-templates/${id}/deactivate`);
    return response.data.data;
  } catch (error) {
    console.error('Error deactivating review template:', error);
    throw error;
  }
};

// Get review template usage stats
const retrieveReviewTemplateStats = async (id) => {
  try {
    const response = await api.get(`/review-templates/${id}/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving review template stats:', error);
    throw error;
  }
};

// Get template types
const retrieveTemplateTypes = async () => {
  try {
    const response = await api.get('/review-templates/types');
    return response.data.data;
  } catch (error) {
    console.error('Error retrieving template types:', error);
    throw error;
  }
};

// Restore deleted review template
const restoreReviewTemplate = async (id) => {
  try {
    const response = await api.post(`/review-templates/${id}/restore`);
    return response.data.data;
  } catch (error) {
    console.error('Error restoring review template:', error);
    throw error;
  }
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
  addCriteriaToTemplate,
  updateTemplateCriteria,
  deleteTemplateCriteria,
  duplicateReviewTemplate,
  activateReviewTemplate,
  deactivateReviewTemplate,
  retrieveReviewTemplateStats,
  retrieveTemplateTypes,
  restoreReviewTemplate,
};