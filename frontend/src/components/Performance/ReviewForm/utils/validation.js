import { VALIDATION_MESSAGES, FORM_FIELD_RULES, SCORE_THRESHOLDS } from './constants';

export const validateReviewForm = (review, criteria) => {
  // Employee validation
  if (!review.employee_id) {
    return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED_EMPLOYEE };
  }
  
  // Template validation
  if (!review.review_template_id) {
    return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED_TEMPLATE };
  }
  
  // Title validation
  if (!review.title?.trim()) {
    return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED_TITLE };
  }

  if (review.title.length < FORM_FIELD_RULES.TITLE.MIN_LENGTH) {
    return { isValid: false, message: VALIDATION_MESSAGES.TITLE_TOO_SHORT };
  }

  if (review.title.length > FORM_FIELD_RULES.TITLE.MAX_LENGTH) {
    return { isValid: false, message: VALIDATION_MESSAGES.TITLE_TOO_LONG };
  }

  // Date validation
  if (!review.review_period_start) {
    return { isValid: false, message: 'Please select review period start date' };
  }

  if (!review.review_period_end) {
    return { isValid: false, message: 'Please select review period end date' };
  }

  if (review.review_period_start >= review.review_period_end) {
    return { isValid: false, message: VALIDATION_MESSAGES.INVALID_DATE_RANGE };
  }

  return { isValid: true };
};

export const validateCriteriaCompletion = (criteria) => {
  const unscored = criteria.filter(c => !c.score || c.score === 0);
  
  if (unscored.length > 0) {
    return {
      isValid: false,
      message: `Please score all criteria. ${unscored.length} criteria remaining.`
    };
  }
  
  return { isValid: true };
};

export const getScoreColor = (score) => {
  if (score >= SCORE_THRESHOLDS.EXCEEDS) return 'success';
  if (score >= SCORE_THRESHOLDS.MEETS) return 'info';
  if (score >= SCORE_THRESHOLDS.PARTIAL) return 'warning';
  return 'error';
};

export const getScoreLabel = (score) => {
  if (score >= SCORE_THRESHOLDS.EXCEEDS) return 'Exceeds Expectations';
  if (score >= SCORE_THRESHOLDS.MEETS) return 'Meets Expectations';
  if (score >= SCORE_THRESHOLDS.PARTIAL) return 'Partially Meets';
  if (score >= SCORE_THRESHOLDS.BELOW) return 'Below Expectations';
  return 'Does Not Meet';
};

export const calculateCompletionPercentage = (criteria) => {
  if (criteria.length === 0) return 0;
  const completed = criteria.filter(c => c.score > 0).length;
  return Math.round((completed / criteria.length) * 100);
};

export const formatScoreDisplay = (score, maxScore = 5) => {
  return `${score.toFixed(1)}/${maxScore.toFixed(1)}`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'draft': return 'default';
    case 'pending': return 'warning';
    case 'completed': return 'info';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default: return 'default';
  }
};