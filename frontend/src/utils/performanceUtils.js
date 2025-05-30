

/**
 * Performance calculation utilities
 * Used across the dashboard for consistent data handling
 */

export const safeToFixed = (value, decimals = 1) => {
  const numValue = parseFloat(value);
  return isNaN(numValue) ? '0.0' : numValue.toFixed(decimals);
};

export const safeToNumber = (value, defaultValue = 0) => {
  const numValue = parseFloat(value);
  return isNaN(numValue) ? defaultValue : numValue;
};

export const calculateReviewScore = (review) => {
  if (!review) return 0;
  
  // Check if review has overall_score (legacy)
  if (review.overall_score) {
    return safeToNumber(review.overall_score, 0);
  }
  
  // Calculate from criteria if available
  if (!review.reviewCriteria || review.reviewCriteria.length === 0) {
    return 0;
  }

  const criteria = review.reviewCriteria;
  const totalWeight = criteria.reduce((sum, c) => sum + safeToNumber(c.weight, 0), 0);
  
  if (totalWeight === 0) return 0;
  
  const weightedScore = criteria.reduce((sum, c) => 
    sum + (safeToNumber(c.score, 0) * safeToNumber(c.weight, 0) / 100), 0
  );
  
  return Math.round(weightedScore * 10) / 10;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getStatusConfig = (status) => {
  const configs = {
    draft: { 
      color: 'default', 
      bgColor: '#f5f5f5', 
      textColor: '#666',
      priority: 1 
    },
    pending: { 
      color: 'warning', 
      bgColor: '#fff3e0', 
      textColor: '#f57c00',
      priority: 2 
    },
    completed: { 
      color: 'info', 
      bgColor: '#e3f2fd', 
      textColor: '#1976d2',
      priority: 3 
    },
    approved: { 
      color: 'success', 
      bgColor: '#e8f5e8', 
      textColor: '#2e7d32',
      priority: 4 
    },
    rejected: { 
      color: 'error', 
      bgColor: '#ffebee', 
      textColor: '#d32f2f',
      priority: 0 
    }
  };
  return configs[status] || configs.draft;
};

export const getScoreGrade = (score) => {
  const numScore = safeToNumber(score, 0);
  if (numScore >= 4.5) return { grade: 'A+', color: '#2e7d32', level: 'Outstanding' };
  if (numScore >= 4.0) return { grade: 'A', color: '#388e3c', level: 'Excellent' };
  if (numScore >= 3.5) return { grade: 'B+', color: '#1976d2', level: 'Good' };
  if (numScore >= 3.0) return { grade: 'B', color: '#1976d2', level: 'Satisfactory' };
  if (numScore >= 2.5) return { grade: 'C', color: '#f57c00', level: 'Needs Improvement' };
  return { grade: 'D', color: '#d32f2f', level: 'Poor' };
};

export const calculateCompletionRate = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const calculatePerformancePercentage = (score, maxScore = 5) => {
  if (score <= 0 || maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
};

export const getEmployeeInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}` || '??';
};

export const sortByStatus = (reviews) => {
  const statusOrder = { rejected: 0, draft: 1, pending: 2, completed: 3, approved: 4 };
  return reviews.sort((a, b) => {
    const aOrder = statusOrder[a.status] ?? 1;
    const bOrder = statusOrder[b.status] ?? 1;
    return bOrder - aOrder;
  });
};