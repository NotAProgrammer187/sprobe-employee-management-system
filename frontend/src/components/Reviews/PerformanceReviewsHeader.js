import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PerformanceReviewsHeader = ({
  searchTerm,
  onSearchChange,
  activeFilters = [],
  onFilterChange,
  onClearFilters,
  totalReviews = 0,
  filteredCount = 0
}) => {
  const navigate = useNavigate();
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);

  const filterOptions = [
    { value: 'draft', label: 'Draft', color: 'default' },
    { value: 'pending', label: 'Pending Review', color: 'warning' },
    { value: 'completed', label: 'Completed', color: 'info' },
    { value: 'approved', label: 'Approved', color: 'success' },
    { value: 'rejected', label: 'Rejected', color: 'error' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'employee', label: 'Employee Name' },
    { value: 'status', label: 'Status' },
    { value: 'score', label: 'Score (High to Low)' }
  ];

  const handleFilterSelect = (filterValue) => {
    onFilterChange(filterValue);
    setFilterMenuAnchor(null);
  };

  const handleRemoveFilter = (filterToRemove) => {
    onFilterChange(filterToRemove); // Toggle off the filter
  };

  const getFilterLabel = (filterValue) => {
    const option = filterOptions.find(opt => opt.value === filterValue);
    return option ? option.label : filterValue;
  };

  const getFilterColor = (filterValue) => {
    const option = filterOptions.find(opt => opt.value === filterValue);
    return option ? option.color : 'default';
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Main Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 3 
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              mb: 1
            }}
          >
            Performance Reviews
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage and track employee performance evaluations
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/performance/reviews/new')}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
            }
          }}
        >
          New Review
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: '8px',
          bgcolor: '#fafafa'
        }}
      >
        {/* Search and Controls Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          mb: activeFilters.length > 0 ? 2 : 0
        }}>
          {/* Search Field */}
          <TextField
            placeholder="Search reviews by employee name, title, or status..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'grey.300'
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange('')}
                    sx={{ p: 0.5 }}
                  >
                    <ClearIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Filter Button */}
          <Tooltip title="Filter reviews">
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: '8px',
                borderColor: 'grey.300',
                color: 'text.primary',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
            >
              Filter
            </Button>
          </Tooltip>

          {/* Sort Button */}
          <Tooltip title="Sort reviews">
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={(e) => setSortMenuAnchor(e.currentTarget)}
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: '8px',
                borderColor: 'grey.300',
                color: 'text.primary',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
            >
              Sort
            </Button>
          </Tooltip>

          {/* More Actions */}
          <Tooltip title="More actions">
            <IconButton
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              sx={{
                p: 1.25,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Active Filters and Results Count */}
        {(activeFilters.length > 0 || searchTerm) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              {/* Active Filters */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {activeFilters.length > 0 && (
                  <>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                      Filters:
                    </Typography>
                    {activeFilters.map((filter) => (
                      <Chip
                        key={filter}
                        label={getFilterLabel(filter)}
                        color={getFilterColor(filter)}
                        variant="outlined"
                        size="small"
                        onDelete={() => handleRemoveFilter(filter)}
                        sx={{
                          borderRadius: '6px',
                          fontWeight: 500,
                          '& .MuiChip-deleteIcon': {
                            fontSize: '1rem'
                          }
                        }}
                      />
                    ))}
                    <Button
                      size="small"
                      onClick={onClearFilters}
                      sx={{ 
                        ml: 1,
                        color: 'text.secondary',
                        textTransform: 'none',
                        fontSize: '0.75rem'
                      }}
                    >
                      Clear all
                    </Button>
                  </>
                )}
              </Box>

              {/* Results Count */}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {searchTerm || activeFilters.length > 0 ? (
                  `${filteredCount} of ${totalReviews} reviews`
                ) : (
                  `${totalReviews} reviews total`
                )}
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 200
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Filter by Status
          </Typography>
        </Box>
        <Divider />
        {filterOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleFilterSelect(option.value)}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: 'primary.50'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={option.label}
                color={option.color}
                size="small"
                variant={activeFilters.includes(option.value) ? "filled" : "outlined"}
                sx={{ borderRadius: '4px' }}
              />
              {activeFilters.includes(option.value) && (
                <Typography variant="caption" sx={{ color: 'success.main', ml: 'auto' }}>
                  ✓
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 180
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Sort by
          </Typography>
        </Box>
        <Divider />
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => setSortMenuAnchor(null)}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: 'primary.50'
              }
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* More Actions Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
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
        <MenuItem
          onClick={() => setMoreMenuAnchor(null)}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: 'primary.50'
            }
          }}
        >
          <DownloadIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          Export Reviews
        </MenuItem>
        <MenuItem
          onClick={() => setMoreMenuAnchor(null)}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: 'primary.50'
            }
          }}
        >
          <FilterIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          Advanced Filters
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PerformanceReviewsHeader;