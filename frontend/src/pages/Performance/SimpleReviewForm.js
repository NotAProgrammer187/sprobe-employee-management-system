import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Alert,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { reviewService, employeeService, reviewTemplateService } from '../../services';

// Import our new modular components
import ReviewFormHeader from '../../components/Reviews/ReviewFormHeader';
import ReviewBasicInfo from '../../components/Reviews/ReviewBasicInfo';
import PerformanceCriteriaSection from '../../components/Reviews/PerformanceCriteriaSection';
import OverallCommentsSection from '../../components/Reviews/OverallCommentsSection';
import ReviewFormActions from '../../components/Reviews/ReviewFormActions';

const SimpleReviewForm = () => {
  const { id: reviewId } = useParams();
  const isEditing = reviewId && reviewId !== 'new';

  // Basic state
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Form data with all required fields
  const [formData, setFormData] = useState({
    title: '',
    employee_id: '',
    review_template_id: '',
    reviewer_id: 1,
    review_date: new Date().toISOString().split('T')[0],
    review_period_start: '',
    review_period_end: '',
    description: '',
    status: 'draft',
    overall_comments: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Dropdown data
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Criteria state
  const [criteria, setCriteria] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load review if editing
  useEffect(() => {
    if (isEditing) {
      loadReview();
    } else {
      setPageLoading(false);
    }
  }, [reviewId, isEditing]);

  const loadInitialData = async () => {
    try {
      const [employeesData, templatesData] = await Promise.all([
        employeeService.retrieveActiveEmployees(),
        reviewTemplateService.retrieveReviewTemplates()
      ]);
      
      setEmployees(employeesData || []);
      setTemplates(templatesData || []);
      
      // Auto-set reviewer_id to first available employee if none set
      if (employeesData && employeesData.length > 0 && !formData.reviewer_id) {
        setFormData(prev => ({
          ...prev,
          reviewer_id: employeesData[0].id
        }));
      }
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error loading data:', err);
    }
  };

  const loadReview = async () => {
    try {
      setPageLoading(true);
      const reviewData = await reviewService.retrieveReview(reviewId);
      
      setFormData({
        title: reviewData.title || '',
        employee_id: reviewData.employee_id || '',
        review_template_id: reviewData.review_template_id || '',
        reviewer_id: reviewData.reviewer_id || 1,
        review_date: reviewData.review_date ? reviewData.review_date.split('T')[0] : new Date().toISOString().split('T')[0],
        review_period_start: reviewData.review_period_start ? reviewData.review_period_start.split('T')[0] : '',
        review_period_end: reviewData.review_period_end ? reviewData.review_period_end.split('T')[0] : '',
        description: reviewData.description || '',
        status: reviewData.status || 'draft',
        overall_comments: reviewData.overall_comments || ''
      });

      // Load criteria if they exist
      if (reviewData.reviewCriteria && reviewData.reviewCriteria.length > 0) {
        setCriteria(reviewData.reviewCriteria);
      }
    } catch (err) {
      setError('Failed to load review');
      console.error('Error loading review:', err);
    } finally {
      setPageLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Auto-generate title when employee changes
    if (field === 'employee_id' && value) {
      const employee = employees.find(emp => emp.id === parseInt(value));
      if (employee) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          title: `Performance Review - ${employee.first_name} ${employee.last_name}`
        }));
      }
    }
    
    // Load template criteria when template changes
    if (field === 'review_template_id' && value) {
      loadTemplateCriteria(value);
    }
  }, [employees, errors]);

  // Load criteria from selected template
  const loadTemplateCriteria = async (templateId) => {
    try {
      const templateCriteria = await reviewTemplateService.retrieveReviewTemplateCriteria(templateId);
      
      if (templateCriteria && templateCriteria.length > 0) {
        const newCriteria = templateCriteria.map((criterion, index) => ({
          id: `criteria_${index}`,
          criteria_name: criterion.criteria_name || criterion.name,
          criteria_description: criterion.criteria_description || criterion.description || '',
          weight: criterion.weight || 20,
          score: 0,
          comments: '',
          sort_order: index
        }));
        setCriteria(newCriteria);
      }
    } catch (err) {
      setError('Failed to load template criteria');
      console.error('Error loading criteria:', err);
    }
  };

  // Handle criteria changes
  const handleCriteriaChange = useCallback((index, field, value) => {
    setCriteria(prev => prev.map((criterion, i) => 
      i === index ? { ...criterion, [field]: value } : criterion
    ));
    setHasUnsavedChanges(true);
  }, []);

  // Calculate overall score
  const calculateOverallScore = () => {
    if (criteria.length === 0) return 0;
    
    const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (totalWeight === 0) return 0;
    
    const weightedScore = criteria.reduce((sum, c) => 
      sum + ((c.score || 0) * (c.weight || 0) / 100), 0
    );
    
    return Math.round(weightedScore * 10) / 10;
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee must be selected';
    }
    if (!formData.review_template_id) {
      newErrors.review_template_id = 'Review template must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save review
  const handleSave = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving');
        return;
      }

      setLoading(true);
      setError('');

      const reviewData = {
        employee_id: parseInt(formData.employee_id),
        review_template_id: parseInt(formData.review_template_id),
        reviewer_id: parseInt(formData.reviewer_id) || 1,
        title: formData.title,
        description: formData.description || '',
        review_period_start: formData.review_period_start || null,
        review_period_end: formData.review_period_end || null,
        review_date: formData.review_date,
        status: formData.status,
        overall_comments: formData.overall_comments || '',
        criteria: criteria.map(c => ({
          criteria_name: c.criteria_name,
          criteria_description: c.criteria_description || '',
          weight: parseFloat(c.weight) || 0,
          score: parseFloat(c.score) || 0,
          comments: c.comments || '',
          sort_order: c.sort_order || 0
        }))
      };

      let result;
      if (isEditing) {
        result = await reviewService.updateReview(reviewId, reviewData);
        setSuccess('Review updated successfully');
      } else {
        result = await reviewService.createReview(reviewData);
        setSuccess('Review created successfully');
        // Navigate to edit mode with the new ID
        if (result && result.id) {
          window.history.replaceState(null, '', `/performance/reviews/${result.id}/edit`);
        }
      }
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date().toISOString());
    } catch (err) {
      console.error('Error saving review:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  // Submit review
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if all criteria are scored
      const unscoredCriteria = criteria.filter(c => !c.score || c.score <= 0);
      if (unscoredCriteria.length > 0) {
        setError(`Please rate all criteria before submitting. ${unscoredCriteria.length} criteria need scores.`);
        return;
      }

      await reviewService.submitReview(reviewId);
      setSuccess('Review submitted successfully');
      
      // Refresh the review data
      await loadReview();
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derived values
  const overallScore = calculateOverallScore();
  const completedCriteria = criteria.filter(c => c.score > 0).length;
  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employee_id));
  const employeeName = selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : '';

  // Loading state
  if (pageLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      {/* Loading Backdrop */}
      <Backdrop 
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
        {/* Header */}
        <ReviewFormHeader
          isEditing={isEditing}
          reviewStatus={formData.status}
          employeeName={employeeName}
          overallScore={overallScore}
          completedCriteria={completedCriteria}
          totalCriteria={criteria.length}
        />

        {/* Error/Success Messages */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: '8px' }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: '8px' }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Basic Information */}
        <ReviewBasicInfo
          formData={formData}
          employees={employees}
          templates={templates}
          loading={loading}
          onInputChange={handleInputChange}
          errors={errors}
        />

        {/* Performance Criteria */}
        <PerformanceCriteriaSection
          criteria={criteria}
          onCriteriaChange={handleCriteriaChange}
          loading={loading}
          formStatus={formData.status}
          overallScore={overallScore}
        />

        {/* Overall Comments */}
        <OverallCommentsSection
          formData={formData}
          onInputChange={handleInputChange}
          loading={loading}
          formStatus={formData.status}
          overallScore={overallScore}
          completedCriteria={completedCriteria}
          totalCriteria={criteria.length}
        />

        {/* Action Buttons */}
        <ReviewFormActions
          isEditing={isEditing}
          loading={loading}
          formStatus={formData.status}
          completedCriteria={completedCriteria}
          totalCriteria={criteria.length}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          onSubmit={handleSubmit}
          lastSaved={lastSaved}
        />
      </Container>
    </>
  );
};

export default SimpleReviewForm;