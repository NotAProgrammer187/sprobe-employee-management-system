import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  TextField,
  Rating
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Star as StarIcon } from '@mui/icons-material';
import { getScoreLabel } from '../utils/validation';

const CriteriaItem = ({ criterion, index, onChange, canEdit }) => {
  const handleScoreChange = (newScore) => {
    onChange(index, 'score', newScore || 0);
  };

  const handleCommentsChange = (comments) => {
    onChange(index, 'comments', comments);
  };

  return (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {criterion.criteria_name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Weight: {criterion.weight}% • Score: {criterion.score?.toFixed(1) || '0.0'}/5.0
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Rating
              value={criterion.score}
              readOnly
              size="small"
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon fontSize="inherit" />}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <CriteriaContent
          criterion={criterion}
          onScoreChange={handleScoreChange}
          onCommentsChange={handleCommentsChange}
          canEdit={canEdit}
        />
      </AccordionDetails>
    </Accordion>
  );
};

const CriteriaContent = ({ criterion, onScoreChange, onCommentsChange, canEdit }) => (
  <Grid container spacing={3}>
    {criterion.criteria_description && (
      <Grid item xs={12}>
        <Typography variant="body2" color="textSecondary" paragraph>
          {criterion.criteria_description}
        </Typography>
      </Grid>
    )}

    <Grid item xs={12} md={4}>
      <Box>
        <Typography component="legend" variant="body2" gutterBottom>
          Performance Rating *
        </Typography>
        <Rating
          value={criterion.score}
          onChange={(event, newValue) => onScoreChange(newValue)}
          max={5}
          size="large"
          disabled={!canEdit}
          icon={<StarIcon fontSize="inherit" />}
          emptyIcon={<StarIcon fontSize="inherit" />}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {criterion.score > 0 ? getScoreLabel(criterion.score) : 'Not rated'}
        </Typography>
      </Box>
    </Grid>

    <Grid item xs={12} md={8}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Detailed Comments"
        value={criterion.comments}
        onChange={(e) => onCommentsChange(e.target.value)}
        disabled={!canEdit}
        placeholder="Provide specific examples and detailed feedback..."
      />
    </Grid>
  </Grid>
);

export default CriteriaItem;