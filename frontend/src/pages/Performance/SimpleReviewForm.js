import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewService, employeeService, reviewTemplateService } from '../../services';

const SimpleReviewForm = () => {
  const { id: reviewId } = useParams();
  const navigate = useNavigate();
  const isEditing = reviewId && reviewId !== 'new';

  // Basic state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data - FIXED: Added missing fields and default reviewer_id
  const [formData, setFormData] = useState({
    title: '',
    employee_id: '',
    review_template_id: '',
    reviewer_id: 1, // FIXED: Default to employee ID 1 (change to a valid employee ID)
    review_date: new Date().toISOString().split('T')[0],
    review_period_start: '', // FIXED: Added missing field
    review_period_end: '',   // FIXED: Added missing field
    description: '',         // FIXED: Added missing field
    status: 'draft',
    overall_comments: ''
  });

  // Dropdown data
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Criteria state
  const [criteria, setCriteria] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    if (isEditing) {
      loadReview();
    }
  }, [reviewId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [employeesData, templatesData] = await Promise.all([
        employeeService.retrieveActiveEmployees(),
        reviewTemplateService.retrieveReviewTemplates()
      ]);
      
      setEmployees(employeesData || []);
      setTemplates(templatesData || []);
      
      // FIXED: Auto-set reviewer_id to first available employee if none set
      if (employeesData && employeesData.length > 0 && !formData.reviewer_id) {
        setFormData(prev => ({
          ...prev,
          reviewer_id: employeesData[0].id
        }));
      }
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReview = async () => {
    try {
      setLoading(true);
      const reviewData = await reviewService.retrieveReview(reviewId);
      
      setFormData({
        title: reviewData.title || '',
        employee_id: reviewData.employee_id || '',
        review_template_id: reviewData.review_template_id || '',
        reviewer_id: reviewData.reviewer_id || 1, // FIXED: Default to 1 if null
        review_date: reviewData.review_date ? reviewData.review_date.split('T')[0] : new Date().toISOString().split('T')[0],
        review_period_start: reviewData.review_period_start ? reviewData.review_period_start.split('T')[0] : '', // FIXED
        review_period_end: reviewData.review_period_end ? reviewData.review_period_end.split('T')[0] : '',     // FIXED
        description: reviewData.description || '',    // FIXED
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
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
  };

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
          score: 0, // Start with 0 score
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

  // Handle criteria score changes
  const handleCriteriaChange = (index, field, value) => {
    setCriteria(prev => prev.map((criterion, i) => 
      i === index ? { ...criterion, [field]: value } : criterion
    ));
  };

  // Calculate overall score
  const calculateOverallScore = () => {
    if (criteria.length === 0) return 0;
    
    const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (totalWeight === 0) return 0;
    
    const weightedScore = criteria.reduce((sum, c) => 
      sum + ((c.score || 0) * (c.weight || 0) / 100), 0
    );
    
    return Math.round(weightedScore * 10) / 10; // Round to 1 decimal place
  };

  // Save review - FIXED: Send all required fields
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      // Basic validation
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!formData.employee_id) {
        setError('Employee must be selected');
        return;
      }
      if (!formData.review_template_id) {
        setError('Review template must be selected');
        return;
      }

      // FIXED: Send all required fields to match backend expectations
      const reviewData = {
        employee_id: parseInt(formData.employee_id),
        review_template_id: parseInt(formData.review_template_id),
        reviewer_id: parseInt(formData.reviewer_id) || 1, // FIXED: Ensure not null
        title: formData.title,
        description: formData.description || '',  // FIXED: Include description
        review_period_start: formData.review_period_start || null,  // FIXED: Include period start
        review_period_end: formData.review_period_end || null,      // FIXED: Include period end
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

      console.log('Sending review data:', reviewData); // Debug log

      let result;
      if (isEditing) {
        result = await reviewService.updateReview(reviewId, reviewData);
        setSuccess('Review updated successfully');
      } else {
        result = await reviewService.createReview(reviewData);
        setSuccess('Review created successfully');
        // Navigate to edit mode with the new ID
        if (result && result.id) {
          navigate(`/performance/reviews/${result.id}/edit`);
        }
      }
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
    } catch (err) {
      setError(err.message || 'Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  const overallScore = calculateOverallScore();
  const completedCriteria = criteria.filter(c => c.score > 0).length;
  const canSubmit = criteria.length > 0 && completedCriteria === criteria.length && formData.status === 'draft';

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Review' : 'Create New Review'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Basic Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Review Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Employee</InputLabel>
              <Select
                value={formData.employee_id}
                label="Employee"
                onChange={(e) => handleInputChange('employee_id', e.target.value)}
                disabled={loading}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Review Template</InputLabel>
              <Select
                value={formData.review_template_id}
                label="Review Template"
                onChange={(e) => handleInputChange('review_template_id', e.target.value)}
                disabled={loading}
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Reviewer</InputLabel>
              <Select
                value={formData.reviewer_id}
                label="Reviewer"
                onChange={(e) => handleInputChange('reviewer_id', e.target.value)}
                disabled={loading}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Review Date"
              value={formData.review_date}
              onChange={(e) => handleInputChange('review_date', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Review Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              margin="normal"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Review Period Start"
              value={formData.review_period_start}
              onChange={(e) => handleInputChange('review_period_start', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Review Period End"
              value={formData.review_period_end}
              onChange={(e) => handleInputChange('review_period_end', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Overall Score Display */}
      {criteria.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Overall Score: {overallScore.toFixed(1)} / 5.0
          </Typography>
          <Typography variant="body2">
            Progress: {completedCriteria} of {criteria.length} criteria completed 
            ({Math.round((completedCriteria / criteria.length) * 100)}%)
          </Typography>
        </Paper>
      )}

      {/* Criteria Section */}
      {criteria.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Criteria
          </Typography>
          
          {criteria.map((criterion, index) => (
            <Card key={criterion.id || index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {criterion.criteria_name}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    (Weight: {criterion.weight}%)
                  </Typography>
                </Typography>

                {criterion.criteria_description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {criterion.criteria_description}
                  </Typography>
                )}

                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Typography component="legend" gutterBottom>
                      Rating (Required)
                    </Typography>
                    <Rating
                      value={criterion.score}
                      onChange={(event, newValue) => handleCriteriaChange(index, 'score', newValue || 0)}
                      max={5}
                      size="large"
                      icon={<StarIcon fontSize="inherit" />}
                      emptyIcon={<StarIcon fontSize="inherit" />}
                      disabled={loading || formData.status !== 'draft'}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Current: {criterion.score}/5
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Comments"
                      value={criterion.comments}
                      onChange={(e) => handleCriteriaChange(index, 'comments', e.target.value)}
                      placeholder="Provide specific feedback and examples..."
                      disabled={loading || formData.status !== 'draft'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}

      {/* Overall Comments */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Overall Comments
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Overall Review Comments"
          value={formData.overall_comments}
          onChange={(e) => handleInputChange('overall_comments', e.target.value)}
          placeholder="Provide overall feedback, summary, and recommendations..."
          disabled={loading || formData.status !== 'draft'}
        />
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/performance/reviews')}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Save Review
        </Button>

        {isEditing && formData.status === 'draft' && (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Submit for Approval
          </Button>
        )}
      </Box>

      {/* Helpful Info */}
      {criteria.length > 0 && completedCriteria < criteria.length && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Please rate all {criteria.length} criteria before submitting the review. 
          {criteria.length - completedCriteria} criteria still need ratings.
        </Alert>
      )}
    </Box>
  );
};

export default SimpleReviewForm;