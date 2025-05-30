import React from 'react';
import { Card, CardContent, Typography, TextField } from '@mui/material';

const OverallComments = ({ value, onChange, canEdit }) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Overall Review Summary
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={6}
        label="Overall Comments and Summary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!canEdit}
        placeholder="Provide an overall summary of performance, achievements, and recommendations..."
      />
    </CardContent>
  </Card>
);

export default OverallComments;