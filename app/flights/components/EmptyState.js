'use client';

import { Paper, Typography } from '@mui/material';
import { Flight } from '@mui/icons-material';

export default function EmptyState() {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        p: 6,
        textAlign: 'center',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Flight
        sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
      />
      <Typography variant="h6" color="text.secondary">
        No flights found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Try searching for a different route
      </Typography>
    </Paper>
  );
}
