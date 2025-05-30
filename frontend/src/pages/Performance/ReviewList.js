import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

import { reviewService, employeeService } from '../../services';

const REVIEW_STATUS_COLORS = {
  draft: 'default',
  pending: 'warning',
  completed: 'info',
  approved: 'success',
  rejected: 'error'
};

const REVIEW_STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending Review',
  completed: 'Completed',
  approved: 'Approved',
  rejected: 'Rejected'
};

const ReviewsList = () => {
  const navigate = useNavigate();
  
  // State
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    employee_id: ''
  });
  
  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    reviewId: null,
    reviewTitle: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    completed: 0,
    approved: 0
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [page, rowsPerPage, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const [reviewsData, employeesData] = await Promise.all([
        reviewService.retrieveReviews(params),
        employeeService.retrieveActiveEmployees()
      ]);
      
      setReviews(reviewsData.data || reviewsData);
      setEmployees(employeesData);
      
      // Calculate stats
      const allReviews = await reviewService.retrieveReviews();
      const reviewStats = {
        total: allReviews.length,
        draft: allReviews.filter(r => r.status === 'draft').length,
        pending: allReviews.filter(r => r.status === 'pending').length,
        completed: allReviews.filter(r => r.status === 'completed').length,
        approved: allReviews.filter(r => r.status === 'approved').length
      };
      setStats(reviewStats);
      
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      employee_id: ''
    });
    setPage(0);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Action handlers
  const handleView = (reviewId) => {
    navigate(`/performance/reviews/${reviewId}`);
  };

  const handleEdit = (reviewId) => {
    navigate(`/performance/reviews/${reviewId}/edit`);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await reviewService.deleteReview(deleteDialog.reviewId);
      setDeleteDialog({ open: false, reviewId: null, reviewTitle: '' });
      await loadData(); // Refresh data
    } catch (err) {
      setError('Failed to delete review');
      console.error('Error deleting review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/performance/reviews/new');
  };

  // Get employee name
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && reviews.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="grey.600">
                {stats.draft}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Draft
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header and Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Performance Reviews
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          New Review
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search reviews..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={filters.employee_id}
                label="Employee"
                onChange={(e) => handleFilterChange('employee_id', e.target.value)}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterIcon />}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reviews Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Review Period</TableCell>
                <TableCell>Overall Score</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {review.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {review.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getEmployeeName(review.employee_id)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={REVIEW_STATUS_LABELS[review.status]}
                      color={REVIEW_STATUS_COLORS[review.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {review.review_period_start && review.review_period_end ? (
                      <>
                        {formatDate(review.review_period_start)} - {formatDate(review.review_period_end)}
                      </>
                    ) : (
                      'Not specified'
                    )}
                  </TableCell>
                  <TableCell>
                    {review.overall_score ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color="primary">
                          {review.overall_score}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / 5.0
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not scored
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(review.created_at)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => handleView(review.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(review.id)}
                        disabled={review.status === 'approved'}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({
                          open: true,
                          reviewId: review.id,
                          reviewTitle: review.title
                        })}
                        disabled={review.status === 'approved'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={stats.total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, reviewId: null, reviewTitle: '' })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the review "{deleteDialog.reviewTitle}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, reviewId: null, reviewTitle: '' })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewsList;