'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import SearchForm from './components/SearchForm';
import FlightList from './components/FlightList';
import PriceGraph from './components/PriceGraph';
import { searchFlights, transformFlightOffer } from '@/lib/amadeus';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f0f0f',
      paper: '#1a1a1a',
    },
    primary: {
      main: '#2196f3',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#9e9e9e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default function FlightSearch() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSearch = async () => {
      if (!origin || !destination || !departureDate) {
        setFlights([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { offers, dictionaries } = await searchFlights(origin, destination, departureDate);
        const transformedFlights = offers
          .map((offer) => transformFlightOffer(offer, dictionaries))
          .filter((flight) => flight !== null);
        
        setFlights(transformedFlights);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search flights. Please try again.');
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [origin, destination, departureDate]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        {/* Search Form at Top */}
        <Paper
          elevation={0}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 0,
            mb: 3,
          }}
        >
          <Container maxWidth="lg">
            <Box py={3}>
              <SearchForm
                origin={origin}
                destination={destination}
                departureDate={departureDate}
                onOriginChange={setOrigin}
                onDestinationChange={setDestination}
                onDepartureDateChange={setDepartureDate}
                onSwap={handleSwap}
              />
            </Box>
          </Container>
        </Paper>

        {/* Main Content: Flight list (left) + Price graph (right) */}
        <Container maxWidth="lg" sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
          {error && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 1,
                backgroundColor: 'error.dark',
                color: 'error.contrastText',
              }}
            >
              {error}
            </Box>
          )}

          <Grid container spacing={3} sx={{ width: '100%' }}>
            <Grid item size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
              <FlightList flights={flights} loading={loading} />
            </Grid>
            <Grid item size={{ xs: 12, md: 5 }} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: '100%',
                  position: { md: 'sticky' },
                  top: { md: 24 },
                }}
              >
                <PriceGraph flights={flights} loading={loading}/>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
