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
    AED: 'د.إ',
  };
  return symbols[currency] || (currency || '');
}

export default function FlightList({ flights = [], loading = false }) {
  if (loading) return <FlightSkeleton />;
  if (!loading && flights.length === 0) return <EmptyState />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {flights.map((flight) => (
        <Paper
          key={flight.id}
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            overflow: 'hidden',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(33, 150, 243, 0.5)',
              transform: { xs: 'none', md: 'translateY(-2px)' },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: { xs: 2, md: 0 },
              minWidth: 0,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
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
                  gap: { xs: 1, sm: 2 },
                  minWidth: 0,
                }}
              >
                <Box sx={{ minWidth: 0, flexShrink: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {formatTime(flight.departureTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {flight.origin}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mx: { xs: 1, sm: 2 },
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
                <Box sx={{ textAlign: 'right', minWidth: 0, flexShrink: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {formatTime(flight.arrivalTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {flight.destination}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                pt: { xs: 2, md: 0 },
                borderTop: { xs: '1px solid rgba(255, 255, 255, 0.1)', md: 'none' },
                borderLeft: { xs: 'none', md: '1px solid rgba(255, 255, 255, 0.1)' },
                pl: { xs: 0, md: 4 },
                ml: { xs: 0, md: 4 },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                {getCurrencySymbol(flight.currency)}{flight.price.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
