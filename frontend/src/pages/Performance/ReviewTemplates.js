import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CloneIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

import { reviewTemplateService } from '../../services';

const ReviewTemplates = () => {
  // State
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Template form dialog
  const [templateDialog, setTemplateDialog] = useState({
    open: false,
    mode: 'create', // 'create', 'edit', 'view'
    template: {
      id: null,
      name: '',
      description: '',
      is_active: true,
      criteria: []
    }
  });

  // Criteria form state
  const [criteriaForm, setCriteriaForm] = useState({
    name: '',
    description: '',
    weight: 20
  });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    templateId: null,
    templateName: ''
  });

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reviewTemplateService.retrieveReviewTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Template handlers
  const handleCreateTemplate = () => {
    setTemplateDialog({
      open: true,
      mode: 'create',
      template: {
        id: null,
        name: '',
        description: '',
        is_active: true,
        criteria: []
      }
    });
  };

  const handleEditTemplate = async (templateId) => {
    try {
      setLoading(true);
      const template = await reviewTemplateService.retrieveReviewTemplate(templateId);
      const criteria = await reviewTemplateService.retrieveReviewTemplateCriteria(templateId);
      
      setTemplateDialog({
        open: true,
        mode: 'edit',
        template: {
          ...template,
          criteria: criteria || []
        }
      });
    } catch (err) {
      setError('Failed to load template details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTemplate = async (templateId) => {
    try {
      setLoading(true);
      const template = await reviewTemplateService.retrieveReviewTemplate(templateId);
      const criteria = await reviewTemplateService.retrieveReviewTemplateCriteria(templateId);
      
      setTemplateDialog({
        open: true,
        mode: 'view',
        template: {
          ...template,
          criteria: criteria || []
        }
      });
    } catch (err) {
      setError('Failed to load template details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneTemplate = async (templateId) => {
    try {
      setLoading(true);
      const template = await reviewTemplateService.retrieveReviewTemplate(templateId);
      const criteria = await reviewTemplateService.retrieveReviewTemplateCriteria(templateId);
      
      setTemplateDialog({
        open: true,
        mode: 'create',
        template: {
          id: null,
          name: `${template.name} (Copy)`,
          description: template.description,
          is_active: true,
          criteria: criteria || []
        }
      });
    } catch (err) {
      setError('Failed to load template for cloning');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!templateDialog.template.name.trim()) {
        setError('Template name is required');
        return;
      }

      if (templateDialog.template.criteria.length === 0) {
        setError('At least one criteria is required');
        return;
      }

      // Validate total weight equals 100%
      const totalWeight = templateDialog.template.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
      if (totalWeight !== 100) {
        setError(`Total criteria weight must equal 100% (current: ${totalWeight}%)`);
        return;
      }

      const templateData = {
        name: templateDialog.template.name,
        description: templateDialog.template.description,
        is_active: templateDialog.template.is_active,
        criteria: templateDialog.template.criteria
      };

      if (templateDialog.mode === 'edit' && templateDialog.template.id) {
        await reviewTemplateService.updateReviewTemplate(templateDialog.template.id, templateData);
        setSuccess('Template updated successfully');
      } else {
        await reviewTemplateService.createReviewTemplate(templateData);
        setSuccess('Template created successfully');
      }

      setTemplateDialog({ open: false, mode: 'create', template: { id: null, name: '', description: '', is_active: true, criteria: [] } });
      await loadTemplates();
    } catch (err) {
      setError('Failed to save template');
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      setLoading(true);
      await reviewTemplateService.deleteReviewTemplate(deleteDialog.templateId);
      setSuccess('Template deleted successfully');
      setDeleteDialog({ open: false, templateId: null, templateName: '' });
      await loadTemplates();
    } catch (err) {
      setError('Failed to delete template');
      console.error('Error deleting template:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criteria handlers
  const handleAddCriteria = () => {
    if (!criteriaForm.name.trim()) {
      setError('Criteria name is required');
      return;
    }

    const newCriteria = {
      id: `temp_${Date.now()}`,
      name: criteriaForm.name,
      description: criteriaForm.description,
      weight: criteriaForm.weight,
      sort_order: templateDialog.template.criteria.length
    };

    setTemplateDialog(prev => ({
      ...prev,
      template: {
        ...prev.template,
        criteria: [...prev.template.criteria, newCriteria]
      }
    }));

    setCriteriaForm({ name: '', description: '', weight: 20 });
  };

  const handleEditCriteria = (index, field, value) => {
    setTemplateDialog(prev => ({
      ...prev,
      template: {
        ...prev.template,
        criteria: prev.template.criteria.map((criteria, i) => 
          i === index ? { ...criteria, [field]: value } : criteria
        )
      }
    }));
  };

  const handleRemoveCriteria = (index) => {
    setTemplateDialog(prev => ({
      ...prev,
      template: {
        ...prev.template,
        criteria: prev.template.criteria.filter((_, i) => i !== index)
      }
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalWeight = () => {
    return templateDialog.template.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  };

  if (loading && templates.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error/Success Alerts */}
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

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Review Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
        >
          New Template
        </Button>
      </Box>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.is_active ? 'Active' : 'Inactive'}
                    color={template.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description || 'No description provided'}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created:</strong> {formatDate(template.created_at)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Criteria Count:</strong> {template.criteria_count || 0}
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions>
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => handleViewTemplate(template.id)}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEditTemplate(template.id)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clone">
                  <IconButton size="small" onClick={() => handleCloneTemplate(template.id)}>
                    <CloneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    onClick={() => setDeleteDialog({
                      open: true,
                      templateId: template.id,
                      templateName: template.name
                    })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Template Form Dialog */}
      <Dialog
        open={templateDialog.open}
        onClose={() => setTemplateDialog({ open: false, mode: 'create', template: { id: null, name: '', description: '', is_active: true, criteria: [] } })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {templateDialog.mode === 'create' ? 'Create Template' : 
           templateDialog.mode === 'edit' ? 'Edit Template' : 'View Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Basic Information */}
            <TextField
              fullWidth
              label="Template Name"
              value={templateDialog.template.name}
              onChange={(e) => setTemplateDialog(prev => ({
                ...prev,
                template: { ...prev.template, name: e.target.value }
              }))}
              sx={{ mb: 2 }}
              disabled={templateDialog.mode === 'view'}
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={templateDialog.template.description}
              onChange={(e) => setTemplateDialog(prev => ({
                ...prev,
                template: { ...prev.template, description: e.target.value }
              }))}
              sx={{ mb: 2 }}
              disabled={templateDialog.mode === 'view'}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={templateDialog.template.is_active}
                  onChange={(e) => setTemplateDialog(prev => ({
                    ...prev,
                    template: { ...prev.template, is_active: e.target.checked }
                  }))}
                  disabled={templateDialog.mode === 'view'}
                />
              }
              label="Active"
              sx={{ mb: 3 }}
            />

            {/* Criteria Section */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Review Criteria
              {templateDialog.template.criteria.length > 0 && (
                <Chip
                  label={`Total Weight: ${getTotalWeight()}%`}
                  color={getTotalWeight() === 100 ? 'success' : 'warning'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>

            {/* Add Criteria Form */}
            {templateDialog.mode !== 'view' && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Add New Criteria
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Criteria Name"
                      value={criteriaForm.name}
                      onChange={(e) => setCriteriaForm(prev => ({ ...prev, name: e.target.value }))}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={criteriaForm.description}
                      onChange={(e) => setCriteriaForm(prev => ({ ...prev, description: e.target.value }))}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Weight (%)"
                      type="number"
                      value={criteriaForm.weight}
                      onChange={(e) => setCriteriaForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                      size="small"
                      inputProps={{ min: 1, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleAddCriteria}
                      size="small"
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Existing Criteria List */}
            <List>
              {templateDialog.template.criteria.map((criteria, index) => (
                <React.Fragment key={criteria.id || index}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        templateDialog.mode === 'view' ? (
                          criteria.name
                        ) : (
                          <TextField
                            value={criteria.name}
                            onChange={(e) => handleEditCriteria(index, 'name', e.target.value)}
                            variant="standard"
                            fullWidth
                          />
                        )
                      }
                      secondary={
                        templateDialog.mode === 'view' ? (
                          `${criteria.description} (Weight: ${criteria.weight}%)`
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <TextField
                              value={criteria.description}
                              onChange={(e) => handleEditCriteria(index, 'description', e.target.value)}
                              placeholder="Description"
                              variant="standard"
                              size="small"
                              sx={{ flexGrow: 1 }}
                            />
                            <TextField
                              value={criteria.weight}
                              onChange={(e) => handleEditCriteria(index, 'weight', parseInt(e.target.value) || 0)}
                              type="number"
                              inputProps={{ min: 1, max: 100 }}
                              variant="standard"
                              size="small"
                              sx={{ width: 80 }}
                            />
                          </Box>
                        )
                      }
                    />
                    {templateDialog.mode !== 'view' && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveCriteria(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>

            {templateDialog.template.criteria.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No criteria added yet
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setTemplateDialog({ open: false, mode: 'create', template: { id: null, name: '', description: '', is_active: true, criteria: [] } })}
          >
            {templateDialog.mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {templateDialog.mode !== 'view' && (
            <Button
              onClick={handleSaveTemplate}
              variant="contained"
              disabled={loading}
            >
              {templateDialog.mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, templateId: null, templateName: '' })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{deleteDialog.templateName}"?
            This action cannot be undone and will affect any reviews using this template.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, templateId: null, templateName: '' })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTemplate}
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

export default ReviewTemplates;