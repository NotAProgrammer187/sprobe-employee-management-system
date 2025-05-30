import { useState, useCallback } from 'react';
import { reviewService, employeeService, reviewTemplateService, reviewCriteriaService } from '../services';

const DEFAULT_REVIEW = {
  employee_id: '',
  review_template_id: '',
  title: '',
  description: '',
  review_period_start: null,
  review_period_end: null,
  review_date: new Date(),
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
        reviewTemplateService.retrieveActiveReviewTemplates()
      ]);
      
      setEmployees(employeesData);
      setTemplates(templatesData);

      // Load existing review if editing
      if (reviewId) {
        const [reviewData, criteriaData] = await Promise.all([
          reviewService.retrieveReview(reviewId),
          reviewCriteriaService.retrieveCriteriaByReview(reviewId)
        ]);

        setReview({
          ...reviewData,
          review_period_start: reviewData.review_period_start ? new Date(reviewData.review_period_start) : null,
          review_period_end: reviewData.review_period_end ? new Date(reviewData.review_period_end) : null,
          review_date: new Date(reviewData.review_date)
        });
        setCriteria(criteriaData || []);
      }
    } catch (err) {
      setError('Failed to load review data');
      console.error('Error loading review:', err);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  const handleReviewChange = useCallback((field, value) => {
    setReview(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate title when employee changes
    if (field === 'employee_id' && value) {
      const employee = employees.find(emp => emp.id === value);
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
      
      const newCriteria = templateCriteria.map((criteriaTemplate, index) => ({
        id: `temp_${index}`,
        criteria_name: criteriaTemplate.criteria_name || criteriaTemplate.name,
        criteria_description: criteriaTemplate.criteria_description || criteriaTemplate.description,
        weight: criteriaTemplate.weight || 20,
        score: 0,
        comments: '',
        sort_order: index,
        max_score: 5
      }));
      
      setCriteria(newCriteria);
    } catch (err) {
      setError('Failed to load template criteria');
      console.error('Error loading template criteria:', err);
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

  const saveReview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const reviewData = {
        ...review,
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

      const result = reviewId 
        ? await reviewService.updateReview(reviewId, reviewData)
        : await reviewService.createReview(reviewData);
      
      setSuccess('Review saved successfully');
      return { success: true, data: result };
    } catch (err) {
      setError('Failed to save review');
      console.error('Error saving review:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [review, criteria, reviewId, calculateOverallScore]);

  const submitReview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      await reviewService.submitReview(reviewId);
      setSuccess('Review submitted for approval');
      await loadReview(); // Refresh data
    } catch (err) {
      setError('Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  }, [reviewId, loadReview]);

  const approveReview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      await reviewService.approveReview(reviewId);
      setSuccess('Review approved successfully');
      await loadReview(); // Refresh data
    } catch (err) {
      setError('Failed to approve review');
      console.error('Error approving review:', err);
    } finally {
      setLoading(false);
    }
  }, [reviewId, loadReview]);

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