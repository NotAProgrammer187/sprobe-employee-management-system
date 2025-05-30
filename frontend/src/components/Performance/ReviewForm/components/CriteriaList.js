import React from 'react';
import { Box } from '@mui/material';
import CriteriaItem from './CriteriaItem';

const CriteriaList = ({ criteria, onChange, canEdit }) => (
  <Box sx={{ mb: 3 }}>
    {criteria.map((criterion, index) => (
      <CriteriaItem
        key={criterion.id || index}
        criterion={criterion}
        index={index}
        onChange={onChange}
        canEdit={canEdit}
      />
    ))}
  </Box>
);

export default CriteriaList;