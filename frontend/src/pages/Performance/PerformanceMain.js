import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Container,
  Breadcrumbs,
  Link,
  Avatar,
  Chip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Assignment as ReviewIcon,
  Description as TemplateIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Import your page components
import ReviewsList from './ReviewList';
import ReviewTemplates from './ReviewTemplates';
import PerformanceDashboard from './PerformanceDashboard';
import SimpleReviewForm from './SimpleReviewForm';
import LogoutButton from '../../components/Common/LogoutButton';

const PerformanceMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine current tab based on path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/reviews/new') || (path.includes('/reviews/') && path.includes('/edit'))) {
      return 1; // Reviews tab when creating/editing
    } else if (path.includes('/reviews')) {
      return 1; // Reviews tab
    } else if (path.includes('/templates')) {
      return 2; // Templates tab
    } else if (path.includes('/dashboard')) {
      return 0; // Dashboard tab
    }
    return 0; // Default to dashboard
  };

  const [currentTab, setCurrentTab] = useState(getCurrentTab());

  // Update tab when location changes
  useEffect(() => {
    setCurrentTab(getCurrentTab());
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    
    switch (newValue) {
      case 0:
        navigate('/performance/dashboard');
        break;
      case 1:
        navigate('/performance/reviews');
        break;
      case 2:
        navigate('/performance/templates');
        break;
      default:
        navigate('/performance/dashboard');
    }
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [
      { label: 'Performance Management', href: '/performance/dashboard' }
    ];

    if (path.includes('/reviews')) {
      breadcrumbs.push({ label: 'Reviews', href: '/performance/reviews' });
      
      if (path.includes('/new')) {
        breadcrumbs.push({ label: 'New Review' });
      } else if (path.includes('/edit')) {
        breadcrumbs.push({ label: 'Edit Review' });
      }
    } else if (path.includes('/templates')) {
      breadcrumbs.push({ label: 'Templates', href: '/performance/templates' });
    } else if (path.includes('/dashboard')) {
      breadcrumbs.push({ label: 'Dashboard' });
    }

    return breadcrumbs;
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = getBreadcrumbs();
    
    return (
      <Breadcrumbs sx={{ mb: 2 }}>
        {breadcrumbs.map((crumb, index) => (
          index === breadcrumbs.length - 1 ? (
            <Typography key={index} color="text.primary">
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={index}
              color="inherit"
              href={crumb.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(crumb.href);
              }}
              sx={{ cursor: 'pointer' }}
            >
              {crumb.label}
            </Link>
          )
        ))}
      </Breadcrumbs>
    );
  };

  // Get user info for display
  const getUserDisplayName = () => {
    if (!user) return 'Unknown User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    if (user.name) return user.name;
    if (user.email) return user.email;
    
    return 'Unknown User';
  };

  const getUserInitials = () => {
    if (!user) return '??';
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    if (user.name) {
      const parts = user.name.split(' ');
      return parts.length >= 2 
        ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
        : user.name.substring(0, 2).toUpperCase();
    }
    
    return user.email ? user.email.substring(0, 2).toUpperCase() : '??';
  };

  const getUserRole = () => {
    if (!user) return 'User';
    const role = user.role || user.userRole || 'User';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const getRoleColor = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'employee': return 'info';
      default: return 'default';
    }
  };

  // Don't show tabs when creating/editing reviews
  const showTabs = !location.pathname.includes('/reviews/new') && 
                   !(location.pathname.includes('/reviews/') && location.pathname.includes('/edit'));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }} id="performance-main">
      {/* Header with User Info and Logout */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        {/* Left side - Title and Breadcrumbs */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Performance Management
          </Typography>
          {renderBreadcrumbs()}
        </Box>

        {/* Right side - User Info and Logout */}
        {user && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            ml: 2 
          }}>
            {/* User Info */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              px: 2,
              py: 1,
              bgcolor: 'grey.50',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {getUserInitials()}
              </Avatar>
              
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {getUserDisplayName()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={getUserRole()}
                    color={getRoleColor()}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.675rem',
                      height: '20px',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  {user.department && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {user.department}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Logout Button */}
            <LogoutButton 
              variant="button" 
              size="small"
              showConfirmDialog={true}
              onLogoutStart={() => console.log('User logging out...')}
              onLogoutComplete={() => console.log('Logout completed')}
              id="performance-logout-btn"
            />
          </Box>
        )}
      </Box>

      {/* Navigation Tabs */}
      {showTabs && (
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: '8px'
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{ px: 2 }}
            variant="fullWidth"
            id="performance-main-tabs"
            TabIndicatorProps={{
              sx: {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab
              icon={<DashboardIcon />}
              label="Dashboard"
              iconPosition="start"
              id="performance-dashboard-tab"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 64,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }}
            />
            <Tab
              icon={<ReviewIcon />}
              label="Reviews"
              iconPosition="start"
              id="performance-reviews-tab"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 64,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }}
            />
            <Tab
              icon={<TemplateIcon />}
              label="Templates"
              iconPosition="start"
              id="performance-templates-tab"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 64,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }}
            />
          </Tabs>
        </Paper>
      )}

      {/* Content Area */}
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<PerformanceDashboard />} />
        <Route path="/" element={<PerformanceDashboard />} />
        
        {/* Reviews */}
        <Route path="/reviews" element={<ReviewsList />} />
        <Route path="/reviews/new" element={<SimpleReviewForm />} />
        <Route path="/reviews/:id/edit" element={<SimpleReviewForm />} />
        <Route path="/reviews/:id" element={<SimpleReviewForm />} />
        
        {/* Templates */}
        <Route path="/templates" element={<ReviewTemplates />} />
        <Route path="/templates/:id" element={<ReviewTemplates />} />
      </Routes>
    </Container>
  );
};

export default PerformanceMain;