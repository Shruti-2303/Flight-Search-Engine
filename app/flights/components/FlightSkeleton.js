'use client';

import { Box, Skeleton } from '@mui/material';

export default function FlightSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map((item) => (
        <Skeleton
          key={item}
          variant="rectangular"
          height={120}
          sx={{
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        />
      ))}
    </Box>
  );
}
