// src/components/Performance/ReviewForm/utils/constants.js

export const REVIEW_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  COMPLETED: 'completed',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const SCORE_THRESHOLDS = {
  EXCEEDS: 4.5,
  MEETS: 3.5,
  PARTIAL: 2.5,
  BELOW: 1.5
};

export const SCORE_LABELS = {
  5: 'Significantly Exceeds Expectations',
  4: 'Exceeds Expectations', 
  3: 'Meets Expectations',
  2: 'Partially Meets Expectations',
  1: 'Does Not Meet Expectations'
};

export const REVIEW_TYPES = {
  ANNUAL: 'annual',
  QUARTERLY: 'quarterly',
  MONTHLY: 'monthly',
  PROBATION: 'probation',
  PROJECT: 'project'
};

export const DEFAULT_CRITERION = {
  criteria_name: '',
  criteria_description: '',
  weight: 20,
  score: 0,
  comments: '',
  sort_order: 0,
  max_score: 5
};

export const FORM_FIELD_RULES = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255
  },
  DESCRIPTION: {
    MAX_LENGTH: 1000
  },
  COMMENTS: {
    MAX_LENGTH: 2000
  },
  CRITERIA_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  }
};

export const VALIDATION_MESSAGES = {
  REQUIRED_EMPLOYEE: 'Please select an employee',
  REQUIRED_TEMPLATE: 'Please select a review template',
  REQUIRED_TITLE: 'Please enter a review title',
  REQUIRED_DATES: 'Please select review period dates',
  INVALID_DATE_RANGE: 'End date must be after start date',
  INCOMPLETE_CRITERIA: 'Please score all criteria before submitting',
  TITLE_TOO_SHORT: 'Title must be at least 5 characters',
  TITLE_TOO_LONG: 'Title cannot exceed 255 characters'
};