'use client';

import { Box, Paper, Typography, Chip } from '@mui/material';
import { Flight } from '@mui/icons-material';
import { formatTime } from '@/lib/amadeus';
import FlightSkeleton from './FlightSkeleton';
import EmptyState from './EmptyState';

function getCurrencySymbol(currency) {
  const symbols = {
    EUR: '€',
    USD: '$',
    INR: '₹',
    GBP: '£',
  };
  return symbols[currency] || currency;
}

export default function FlightList({ flights = [], loading = false }) {
  if (loading) return <FlightSkeleton />;
  if (!loading && flights.length === 0) return <EmptyState />;

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
                    {formatTime(flight.departureTime)}
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
                  {flight.isNonstop && (
                    <Chip
                      label="Nonstop"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        mt: 0.5,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'text.secondary',
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {formatTime(flight.arrivalTime)}
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
                {getCurrencySymbol(flight.currency)}{flight.price.toFixed(2)}
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
