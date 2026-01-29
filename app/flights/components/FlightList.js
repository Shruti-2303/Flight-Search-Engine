'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Flight } from '@mui/icons-material';

export default function FlightList({ flights = [], loading = false }) {
  if (flights.length === 0 && !loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {flights.map((flight) => (
        <Paper
          key={flight.id}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(33, 150, 243, 0.5)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {flight.airline}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {flight.departure_time.substring(0, 5)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flight.origin}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mx: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    {flight.duration}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                    }}
                  >
                    <Flight
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(90deg)',
                        fontSize: 16,
                        color: 'primary.main',
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {flight.arrival_time.substring(0, 5)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flight.destination}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                ml: 4,
                textAlign: 'right',
                pl: 4,
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                ${flight.price}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                per person
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
