import React from 'react';
import { Paper, Button } from '@mui/material';
import { Save as SaveIcon, Send as SendIcon, CheckCircle as ApproveIcon } from '@mui/icons-material';

const ActionButtons = ({ permissions, loading, onSave, onSubmit, onApprove, onBack }) => (
  <Paper sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
    <Button variant="outlined" onClick={onBack}>
      Back to Reviews
    </Button>

    {permissions.canEdit && (
      <Button
        variant="outlined"
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={loading}
      >
        Save Draft
      </Button>
    )}

    {permissions.canSubmit && (
      <Button
        variant="contained"
        startIcon={<SendIcon />}
        onClick={onSubmit}
        disabled={loading}
      >
        Submit for Approval
      </Button>
    )}

    {permissions.canApprove && (
      <Button
        variant="contained"
        color="success"
        startIcon={<ApproveIcon />}
        onClick={onApprove}
        disabled={loading}
      >
        Approve Review
      </Button>
    )}
  </Paper>
);

export default ActionButtons;