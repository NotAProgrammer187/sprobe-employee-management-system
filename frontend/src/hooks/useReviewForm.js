import { useState, useCallback } from 'react';
import { reviewService, employeeService, reviewTemplateService, reviewCriteriaService } from '../services';

const DEFAULT_REVIEW = {
  employee_id: '',
  review_template_id: '',
  title: '',
  description: '',
  review_period_start: null,
  review_period_end: null,
  review_date: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
  status: 'draft',
  overall_comments: '',
  overall_score: 0
};

export const useReviewForm = (reviewId) => {
  const [review, setReview] = useState(DEFAULT_REVIEW);
  const [criteria, setCriteria] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load employees and templates
      const [employeesData, templatesData] = await Promise.all([
        employeeService.retrieveActiveEmployees(),
        reviewTemplateService.retrieveReviewTemplates()
      ]);
      
      setEmployees(employeesData || []);
      setTemplates(templatesData || []);

      // Load existing review if editing
      if (reviewId && reviewId !== 'new') {
        try {
          const [reviewData, criteriaData] = await Promise.all([
            reviewService.retrieveReview(reviewId),
            reviewCriteriaService.retrieveCriteriaByReview(reviewId)
          ]);

          setReview({
            ...reviewData,
            review_period_start: reviewData.review_period_start ? 
              (typeof reviewData.review_period_start === 'string' ? reviewData.review_period_start.split('T')[0] : reviewData.review_period_start) : null,
            review_period_end: reviewData.review_period_end ? 
              (typeof reviewData.review_period_end === 'string' ? reviewData.review_period_end.split('T')[0] : reviewData.review_period_end) : null,
            review_date: reviewData.review_date ? 
              (typeof reviewData.review_date === 'string' ? reviewData.review_date.split('T')[0] : reviewData.review_date) : new Date().toISOString().split('T')[0]
          });
          setCriteria(criteriaData || []);
        } catch (err) {
          console.error('Error loading existing review:', err);
          setError('Failed to load review data');
        }
      }
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error loading review form data:', err);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  const handleReviewChange = useCallback((field, value) => {
    setReview(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate title when employee changes
    if (field === 'employee_id' && value) {
      const employee = employees.find(emp => emp.id === parseInt(value));
      if (employee) {
        setReview(prev => ({
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
  }, [employees]);

  const loadTemplateCriteria = async (templateId) => {
    try {
      setLoading(true);
      const templateCriteria = await reviewTemplateService.retrieveReviewTemplateCriteria(templateId);
      
      if (templateCriteria && Array.isArray(templateCriteria)) {
        const newCriteria = templateCriteria.map((criteriaTemplate, index) => ({
          id: `temp_${index}`,
          criteria_name: criteriaTemplate.criteria_name || criteriaTemplate.name || `Criteria ${index + 1}`,
          criteria_description: criteriaTemplate.criteria_description || criteriaTemplate.description || '',
          weight: criteriaTemplate.weight || 20,
          score: 0,
          comments: '',
          sort_order: criteriaTemplate.sort_order || index,
          max_score: 5
        }));
        
        setCriteria(newCriteria);
      } else {
        // If no template criteria found, create default criteria
        const defaultCriteria = [
          {
            id: 'temp_0',
            criteria_name: 'Overall Performance',
            criteria_description: 'General assessment of employee performance',
            weight: 100,
            score: 0,
            comments: '',
            sort_order: 0,
            max_score: 5
          }
        ];
        setCriteria(defaultCriteria);
      }
    } catch (err) {
      setError('Failed to load template criteria');
      console.error('Error loading template criteria:', err);
      
      // Create default criteria on error
      const defaultCriteria = [
        {
          id: 'temp_0',
          criteria_name: 'Overall Performance',
          criteria_description: 'General assessment of employee performance',
          weight: 100,
          score: 0,
          comments: '',
          sort_order: 0,
          max_score: 5
        }
      ];
      setCriteria(defaultCriteria);
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaChange = useCallback((index, field, value) => {
    setCriteria(prev => prev.map((criteria, i) => 
      i === index ? { ...criteria, [field]: value } : criteria
    ));
  }, []);

  const calculateOverallScore = useCallback(() => {
    if (criteria.length === 0) return 0;
    
    const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (totalWeight === 0) return 0;
    
    const weightedScore = criteria.reduce((sum, c) => 
      sum + ((c.score || 0) * (c.weight || 0) / 100), 0
    );
    
    return Math.round(weightedScore * 10) / 10;
  }, [criteria]);

  const saveReview = useCallback(async (customReview = null) => {
    try {
      setLoading(true);
      setError('');
      
      const reviewData = {
        ...(customReview || review),
        overall_score: calculateOverallScore(),
        criteria: criteria.map(c => ({
          criteria_name: c.criteria_name,
          criteria_description: c.criteria_description,
          weight: c.weight,
          score: c.score,
          comments: c.comments,
          sort_order: c.sort_order
        }))
      };

      const result = reviewId && reviewId !== 'new'
        ? await reviewService.updateReview(reviewId, reviewData)
        : await reviewService.createReview(reviewData);
      
      setSuccess('Review saved successfully');
      
      // Update the review state with the returned data
      if (result && result.id) {
        setReview(prev => ({ ...prev, id: result.id }));
      }
      
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save review';
      setError(errorMessage);
      console.error('Error saving review:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [review, criteria, reviewId, calculateOverallScore]);

  const submitReview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Ensure we have a valid review ID
      if (!review.id && (!reviewId || reviewId === 'new')) {
        setError('Please save the review first before submitting');
        return;
      }
      
      const idToUse = review.id || reviewId;
      await reviewService.submitReview(idToUse);
      setSuccess('Review submitted for approval');
      await loadReview(); // Refresh data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit review';
      setError(errorMessage);
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  }, [review.id, reviewId, loadReview]);

  const approveReview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const idToUse = review.id || reviewId;
      await reviewService.approveReview(idToUse);
      setSuccess('Review approved successfully');
      await loadReview(); // Refresh data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to approve review';
      setError(errorMessage);
      console.error('Error approving review:', err);
    } finally {
      setLoading(false);
    }
  }, [review.id, reviewId, loadReview]);

  return {
    review,
    criteria,
    employees,
    templates,
    loading,
    error,
    success,
    setError,
    setSuccess,
    handleReviewChange,
    handleCriteriaChange,
    loadReview,
    saveReview,
    submitReview,
    approveReview,
    calculateOverallScore
  };
};