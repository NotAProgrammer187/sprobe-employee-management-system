import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { Assessment as AssessmentIcon, Info as InfoIcon } from '@mui/icons-material';
import { getScoreColor, getScoreLabel } from '../utils/validation';

const OverallScore = ({ score, criteria }) => {
  const completedCriteria = criteria.filter(c => c.score > 0).length;
  const progressPercentage = criteria.length > 0 ? (completedCriteria / criteria.length) * 100 : 0;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 1 }} />
            Overall Performance Score
          </Typography>
          <Tooltip title="Calculated from weighted criteria scores">
            <IconButton size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, mr: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              color={getScoreColor(score)}
              sx={{ height: 12, borderRadius: 6, mb: 1 }}
            />
            <Typography variant="body2" color="textSecondary">
              Progress: {completedCriteria} of {criteria.length} criteria scored
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h3" color={`${getScoreColor(score)}.main`}>
              {score.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              out of 5.0
            </Typography>
            <Chip
              label={getScoreLabel(score)}
              color={getScoreColor(score)}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OverallScore;