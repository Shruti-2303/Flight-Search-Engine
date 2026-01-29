'use client';

import { Box, Paper, TextField, IconButton, InputAdornment } from '@mui/material';
import {
  SwapHoriz,
  FlightTakeoff,
  FlightLand,
  CalendarMonth,
} from '@mui/icons-material';

export default function SearchForm({
  origin,
  destination,
  departureDate,
  onOriginChange,
  onDestinationChange,
  onDepartureDateChange,
  onSwap,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Origin, Destination, and Departure Date Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <TextField
          value={origin}
          onChange={(e) => onOriginChange(e.target.value)}
          placeholder="Origin"
          variant="outlined"
          sx={{
            width: 325,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FlightTakeoff sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <IconButton
          onClick={onSwap}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <SwapHoriz />
        </IconButton>

        <TextField
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="Destination"
          variant="outlined"
          sx={{
            width: 325,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FlightLand sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          type="date"
          value={departureDate}
          onChange={(e) => onDepartureDateChange(e.target.value)}
          variant="outlined"
          sx={{
            width: 350,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonth sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Paper>
  );
}
