import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Container,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Assignment as ReviewIcon,
  Description as TemplateIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

// Import your page components
import ReviewFormContainer from '../../components/Performance/ReviewForm/ReviewFormContainer';
import ReviewsList from './ReviewList';
import ReviewTemplates from './ReviewTemplates';
import PerformanceDashboard from './PerformanceDashboard';

const PerformanceMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine current tab based on path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/reviews/new') || path.includes('/reviews/') && path.includes('/edit')) {
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

  // Don't show tabs when creating/editing reviews
  const showTabs = !location.pathname.includes('/reviews/new') && 
                   !location.pathname.includes('/reviews/') ||
                   !location.pathname.includes('/edit');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Performance Management
        </Typography>
        {renderBreadcrumbs()}
      </Box>

      {/* Navigation Tabs */}
      {showTabs && (
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{ px: 2 }}
            variant="fullWidth"
          >
            <Tab
              icon={<DashboardIcon />}
              label="Dashboard"
              iconPosition="start"
            />
            <Tab
              icon={<ReviewIcon />}
              label="Reviews"
              iconPosition="start"
            />
            <Tab
              icon={<TemplateIcon />}
              label="Templates"
              iconPosition="start"
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
        <Route path="/reviews/new" element={<ReviewFormContainer />} />
        <Route path="/reviews/:id/edit" element={<ReviewFormContainer />} />
        <Route path="/reviews/:id" element={<ReviewFormContainer readOnly />} />
        
        {/* Templates */}
        <Route path="/templates" element={<ReviewTemplates />} />
        <Route path="/templates/:id" element={<ReviewTemplates />} />
      </Routes>
    </Container>
  );
};

export default PerformanceMain;