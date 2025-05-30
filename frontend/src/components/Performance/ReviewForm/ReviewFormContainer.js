import React, { useState, useEffect } from 'react';
import { Box, Alert, LinearProgress } from '@mui/material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

import { useReviewForm } from '../../../hooks/useReviewForm';
import { validateReviewForm } from './utils/validation';

// Component imports
import ReviewHeader from './components/ReviewHeader';
import ReviewInformation from './components/ReviewInformation';
import OverallScore from './components/OverallScore';
import CriteriaList from './components/CriteriaList';
import OverallComments from './components/OverallComments';
import ActionButtons from './components/ActionButtons';
import ConfirmationDialogs from './components/ConfirmationDialogs';

const ReviewFormContainer = ({ readOnly = false }) => {
  const { id: reviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get employee_id from URL params if creating new review
  const preSelectedEmployeeId = searchParams.get('employee_id');
  
  const {
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
  } = useReviewForm(reviewId);

  const [dialogs, setDialogs] = useState({
    submit: false,
    approve: false
  });

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  // Pre-fill employee if creating new review with employee_id param
  useEffect(() => {
    if (!reviewId && preSelectedEmployeeId && employees.length > 0) {
      const selectedEmployee = employees.find(emp => emp.id === parseInt(preSelectedEmployeeId));
      if (selectedEmployee) {
        handleReviewChange('employee_id', parseInt(preSelectedEmployeeId));
        
        // Auto-set reviewer to current user if they're a manager
        if (user && user.role === 'manager') {
          handleReviewChange('reviewer_id', user.id);
          handleReviewChange('reviewer_name', user.name);
        }
      }
    }
  }, [reviewId, preSelectedEmployeeId, employees, user]);

  // Enhanced permissions for managers
  const permissions = {
    canEdit: !readOnly && ['draft', 'pending'].includes(review.status),
    canSubmit: review.status === 'draft' && criteria.every(c => c.score > 0),
    canApprove: review.status === 'completed' && (user?.role === 'admin' || user?.role === 'manager'),
    canReject: review.status === 'completed' && (user?.role === 'admin' || user?.role === 'manager'),
    canViewAll: user?.role === 'admin',
    isReviewer: review.reviewer_id === user?.id || review.reviewer_name === user?.name,
    isManager: user?.role === 'manager',
    isAdmin: user?.role === 'admin'
  };

  const handleSave = async () => {
    const validation = validateReviewForm(review, criteria);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }
    
    // Auto-set reviewer info if creating new review as manager
    if (!reviewId && user?.role === 'manager') {
      const reviewData = {
        ...review,
        reviewer_id: user.id,
        reviewer_name: user.name
      };
      
      const result = await saveReview(reviewData);
      if (result.success && !reviewId) {
        navigate(`/performance/reviews/${result.data.id}/edit`);
      }
    } else {
      const result = await saveReview();
      if (result.success && !reviewId) {
        navigate(`/performance/reviews/${result.data.id}/edit`);
      }
    }
  };

  const handleSubmit = async () => {
    await submitReview();
    setDialogs(prev => ({ ...prev, submit: false }));
  };

  const handleApprove = async () => {
    await approveReview();
    setDialogs(prev => ({ ...prev, approve: false }));
  };

  // Filter employees based on user role
  const getFilteredEmployees = () => {
    if (user?.role === 'admin') {
      return employees; // Admins can see all employees
    } else if (user?.role === 'manager') {
      // Managers can only see their direct reports
      return employees.filter(emp => 
        emp.manager_name === user.name || 
        emp.manager_id === user.id
      );
    }
    return employees;
  };

  // Enhanced review data with manager context
  const enhancedReview = {
    ...review,
    canEditEmployeeSelection: !reviewId && (user?.role === 'admin' || user?.role === 'manager'),
    filteredEmployees: getFilteredEmployees(),
    managerContext: {
      isManager: user?.role === 'manager',
      isAdmin: user?.role === 'admin',
      currentUserId: user?.id,
      currentUserName: user?.name
    }
  };

  if (loading && !reviewId) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <ReviewHeader review={enhancedReview} reviewId={reviewId} permissions={permissions} />
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Manager-specific notice */}
      {user?.role === 'manager' && !reviewId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          As a manager, you can create reviews for your direct reports. 
          {preSelectedEmployeeId && ' The employee has been pre-selected for this review.'}
        </Alert>
      )}

      <ReviewInformation
        review={enhancedReview}
        employees={enhancedReview.filteredEmployees}
        templates={templates}
        onChange={handleReviewChange}
        permissions={permissions}
        userRole={user?.role}
      />

      {criteria.length > 0 && (
        <OverallScore
          score={calculateOverallScore()}
          criteria={criteria}
        />
      )}

      <CriteriaList
        criteria={criteria}
        onChange={handleCriteriaChange}
        canEdit={permissions.canEdit && permissions.isReviewer}
        userRole={user?.role}
      />

      <OverallComments
        value={review.overall_comments}
        onChange={(value) => handleReviewChange('overall_comments', value)}
        canEdit={permissions.canEdit && permissions.isReviewer}
        userRole={user?.role}
      />

      <ActionButtons
        permissions={permissions}
        loading={loading}
        onSave={handleSave}
        onSubmit={() => setDialogs(prev => ({ ...prev, submit: true }))}
        onApprove={() => setDialogs(prev => ({ ...prev, approve: true }))}
        onBack={() => {
          // Smart navigation based on user role
          if (user?.role === 'manager') {
            navigate('/'); // Go to manager dashboard
          } else {
            navigate('/performance/reviews');
          }
        }}
        userRole={user?.role}
      />

      <ConfirmationDialogs
        dialogs={dialogs}
        review={enhancedReview}
        overallScore={calculateOverallScore()}
        onClose={(dialogType) => setDialogs(prev => ({ ...prev, [dialogType]: false }))}
        onSubmit={handleSubmit}
        onApprove={handleApprove}
        loading={loading}
        userRole={user?.role}
      />
    </Box>
  );
};

export default ReviewFormContainer;