import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Button } from '@mui/material';

const ConfirmationDialogs = ({ dialogs, review, overallScore, onClose, onSubmit, onApprove, loading }) => (
  <>
    <Dialog open={dialogs.submit} onClose={() => onClose('submit')}>
      <DialogTitle>Submit Review for Approval</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to submit this review for approval?
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Overall Score: {overallScore.toFixed(1)}/5.0
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose('submit')}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={loading}>
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={dialogs.approve} onClose={() => onClose('approve')}>
      <DialogTitle>Approve Performance Review</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to approve this performance review?
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Overall Score: {overallScore.toFixed(1)}/5.0
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose('approve')}>Cancel</Button>
        <Button onClick={onApprove} variant="contained" color="success" disabled={loading}>
          Approve Review
        </Button>
      </DialogActions>
    </Dialog>
  </>
);

export default ConfirmationDialogs;