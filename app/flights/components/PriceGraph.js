// ===================================================================
// LIVE PRICE GRAPH COMPONENT - MATERIAL-UI VERSION
// ===================================================================
// This component displays a live price trend graph using Recharts + MUI
// Place this in: /components/PriceGraph.jsx
// ===================================================================

'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FlightIcon from '@mui/icons-material/Flight';

function getCurrencySymbol(currency) {
  const symbols = { EUR: '€', USD: '$', INR: '₹', GBP: '£', AED: 'د.إ' };
  return symbols[currency] || (currency || '');
}

export default function PriceGraph({ flights, loading }) {
  const theme = useTheme();
  const currency = flights?.[0]?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Process flight data to create price trend data
  const priceData = useMemo(() => {
    if (!flights || flights.length === 0) return [];

    // Group flights by departure time and find cheapest price
    // Since all flights are for the same date, we'll group by time slots
    const priceByTime = {};

    flights.forEach((flight) => {
      // Extract departure time and price
      const departureTime = flight.departureTime || flight.itineraries?.[0]?.segments?.[0]?.departure?.at;
      const price = flight.price || parseFloat(flight.price?.total || 0);

      if (departureTime && price) {
        const date = new Date(departureTime);
        const timeKey = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        // Keep the lowest price for each time slot
        if (!priceByTime[timeKey] || priceByTime[timeKey] > price) {
          priceByTime[timeKey] = price;
        }
      }
    });

    // Convert to array format for Recharts
    return Object.entries(priceByTime)
      .map(([time, price]) => ({
        date: time,
        price: Math.round(price),
      }))
      .sort((a, b) => {
        // Sort by time (convert back to comparable format)
        const timeA = a.date;
        const timeB = b.date;
        // Simple string comparison works for "HH:MM AM/PM" format
        return timeA.localeCompare(timeB);
      });
  }, [flights]);

  // Calculate min and max prices for better Y-axis scaling
  const priceRange = useMemo(() => {
    if (priceData.length === 0) return { min: 0, max: 1000 };

    const prices = priceData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;

    return {
      min: Math.floor(min - padding),
      max: Math.ceil(max + padding),
    };
  }, [priceData]);

  // Calculate stats
  const stats = useMemo(() => {
    if (priceData.length === 0) return null;

    const prices = priceData.map((d) => d.price);
    const cheapest = Math.min(...prices);
    const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    
    return { cheapest, average };
  }, [priceData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper
          elevation={4}
          sx={{
            p: '8px 12px',
            // Darker background with slight transparency for a glass effect
            backgroundColor: 'rgba(30, 30, 30, 0.9)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <Typography 
            variant="caption" 
            display="block" 
            sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.2 }}
          >
            Time: {data.date}
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight="500"
          >
            Price: {currencySymbol}{data.price.toLocaleString()}
          </Typography>
          
          {/* Keeping your logic for the 'Best Price' badge if needed */}
          {data.price === stats?.cheapest && (
            <Chip
              label="Best Price"
              color="success"
              size="small"
              sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 700 }}
            />
          )}
        </Paper>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: 3,
          bgcolor: '#121212',
          borderRadius: 4,
          color: '#fff',
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
        >
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading price trends...
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Empty state (styled like EmptyState component)
  if (priceData.length === 0) {
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
        <ShowChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Search for flights to see price trends
        </Typography>
      </Paper>
    );
  }

  // Main chart view
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        p: 3,
        bgcolor: '#121212',
        borderRadius: 4,
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Price Trends
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lowest prices across available dates
        </Typography>
      </Box>

      {/* Price Stats */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid item size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid',
                borderColor: 'rgba(76, 175, 80, 0.3)',
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Cheapest
              </Typography>
              <Typography variant="h5" fontWeight="700" color="#4caf50">
                {currencySymbol}{stats.cheapest.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid',
                borderColor: 'rgba(33, 150, 243, 0.3)',
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Average
              </Typography>
              <Typography variant="h5" fontWeight="700" color="primary.main">
                {currencySymbol}{stats.average.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={priceData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.1)"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            domain={[priceRange.min, priceRange.max]}
            tickFormatter={(value) => `${currencySymbol}${value}`}
          />
          <Tooltip content={<CustomTooltip />}
           cursor={false}
           />
          <Area
            type="monotone"
            dataKey="price"
            stroke={theme.palette.primary.main}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPrice)"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Footer */}
      <Box
        mt={3}
        pt={2}
        borderTop={1}
        borderColor="rgba(255,255,255,0.1)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FlightIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
        <Typography variant="caption" color="text.secondary">
          Prices shown in {currency} • Updated live
        </Typography>
      </Box>
    </Paper>
  );
}