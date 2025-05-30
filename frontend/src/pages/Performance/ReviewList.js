import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PerformanceReviewsHeader from '../../components/Performance/PerformanceReviewsHeader';
import { reviewService } from '../../services';

const ReviewsList = () => {
  const navigate = useNavigate();
  
  // State management
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Load reviews on component mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const reviewsData = await reviewService.retrieveReviews();
      setReviews(reviewsData || []);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.title?.toLowerCase().includes(search) ||
        review.employee_name?.toLowerCase().includes(search) ||
        review.status?.toLowerCase().includes(search)
      );
    }

    // Apply status filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(review => 
        activeFilters.includes(review.status)
      );
    }

    return filtered;
  }, [reviews, searchTerm, activeFilters]);

  // Handle filter changes
  const handleFilterChange = (filterValue) => {
    setActiveFilters(prev => 
      prev.includes(filterValue)
        ? prev.filter(f => f !== filterValue)
        : [...prev, filterValue]
    );
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setSearchTerm('');
  };

  // Action menu handlers
  const handleActionClick = (event, review) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedReview(review);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
    setSelectedReview(null);
  };

  const handleEditReview = () => {
    if (selectedReview) {
      navigate(`/performance/reviews/${selectedReview.id}/edit`);
    }
    handleActionClose();
  };

  const handleViewReview = () => {
    if (selectedReview) {
      navigate(`/performance/reviews/${selectedReview.id}`);
    }
    handleActionClose();
  };

  const handleDeleteReview = async () => {
    if (selectedReview) {
      try {
        await reviewService.deleteReview(selectedReview.id);
        await loadReviews(); // Refresh the list
      } catch (err) {
        setError('Failed to delete review');
        console.error('Error deleting review:', err);
      }
    }
    handleActionClose();
  };

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: 'default', label: 'Draft' },
      pending: { color: 'warning', label: 'Pending' },
      completed: { color: 'info', label: 'Completed' },
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' }
    };
    return configs[status] || configs.draft;
  };

  // Employee initials helper
  const getEmployeeInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  // Score display helper
  const renderScore = (score) => {
    // Convert to number and validate
    const numericScore = parseFloat(score);
    
    // Return dash if score is invalid, null, undefined, or 0
    if (!score || isNaN(numericScore) || numericScore === 0) {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          -
        </Typography>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <StarIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {numericScore.toFixed(1)}
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Search and Filters */}
      <PerformanceReviewsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalReviews={reviews.length}
        filteredCount={filteredReviews.length}
      />

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {/* Reviews Table */}
      <Paper 
        elevation={0}
        sx={{ 
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Review Title</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Review Date</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {searchTerm || activeFilters.length > 0 
                        ? 'No reviews match your search criteria'
                        : 'No performance reviews found'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => {
                  const statusConfig = getStatusConfig(review.status);
                  
                  return (
                    <TableRow 
                      key={review.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'grey.50' },
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/performance/reviews/${review.id}`)}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: 'primary.main',
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}
                          >
                            {getEmployeeInitials(review.employee_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {review.employee_name || 'Unknown Employee'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              ID: {review.employee_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {review.title || 'Untitled Review'}
                        </Typography>
                        {review.review_period && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {review.review_period}
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderRadius: '6px',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      
                      <TableCell sx={{ py: 2 }}>
                        {renderScore(review.overall_score)}
                      </TableCell>
                      
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {review.review_date 
                            ? new Date(review.review_date).toLocaleDateString()
                            : '-'
                          }
                        </Typography>
                      </TableCell>
                      
                      <TableCell sx={{ py: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(e, review);
                          }}
                          sx={{
                            '&:hover': {
                              bgcolor: 'primary.50'
                            }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionClose}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 160
          }
        }}
      >
        <MenuItem onClick={handleViewReview}>
          <ViewIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          View Review
        </MenuItem>
        <MenuItem onClick={handleEditReview}>
          <EditIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          Edit Review
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteReview}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          Delete Review
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ReviewsList;