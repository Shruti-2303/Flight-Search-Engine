'use client';

import { useState, useEffect, useMemo } from 'react';
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
import FilterBar from './components/FilterBar';
import FlightList from './components/FlightList';
import PriceGraph from './components/PriceGraph';
import { searchFlights, transformFlightOffer } from '@/lib/amadeus';

const defaultFilters = { stops: 'any', airlines: [], priceMax: null, durationMax: null };

function applyFilters(flights, filters) {
  if (!flights?.length) return [];
  const { stops, airlines, priceMax, durationMax } = filters || defaultFilters;
  return flights.filter((f) => {
    if (stops !== 'any') {
      const totalStops = f.totalStops ?? (f.isNonstop ? 0 : 1);
      if (stops === 'nonstop' && totalStops !== 0) return false;
      if (stops === '1' && totalStops > 1) return false;
      if (stops === '2' && totalStops > 2) return false;
    }
    if (airlines?.length > 0 && !airlines.includes(f.airlineCode)) return false;
    if (priceMax != null && (f.price == null || f.price > priceMax)) return false;
    if (durationMax != null && (f.durationMinutes == null || f.durationMinutes > durationMax)) return false;
    return true;
  });
}

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
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState('oneWay');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infantsInSeat, setInfantsInSeat] = useState(0);
  const [infantsOnLap, setInfantsOnLap] = useState(0);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);

  const filteredFlights = useMemo(() => applyFilters(flights, filters), [flights, filters]);

  // When switching to round trip, default return date to departure date
  const handleTripTypeChange = (newTripType) => {
    setTripType(newTripType);
    if (newTripType === 'roundTrip' && !returnDate) {
      setReturnDate(departureDate);
    }
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (!origin || !destination || !departureDate) {
        setFlights([]);
        setError(null);
        return;
      }
      if (tripType === 'roundTrip' && !returnDate) {
        setFlights([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const effectiveReturnDate = tripType === 'roundTrip' ? (returnDate || departureDate) : undefined;
        const { offers, dictionaries } = await searchFlights(
          origin,
          destination,
          departureDate,
          { adults, children, infantsInSeat, infantsOnLap },
          effectiveReturnDate
        );
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
  }, [origin, destination, departureDate, returnDate, tripType, adults, children, infantsInSeat, infantsOnLap]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handlePassengersChange = ({ adults: a, children: c, infantsInSeat: iSeat, infantsOnLap: iLap }) => {
    setAdults(a);
    setChildren(c);
    setInfantsInSeat(iSeat);
    setInfantsOnLap(iLap);
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
                returnDate={returnDate}
                tripType={tripType}
                adults={adults}
                children={children}
                infantsInSeat={infantsInSeat}
                infantsOnLap={infantsOnLap}
                onOriginChange={setOrigin}
                onDestinationChange={setDestination}
                onDepartureDateChange={setDepartureDate}
                onReturnDateChange={setReturnDate}
                onTripTypeChange={handleTripTypeChange}
                onPassengersChange={handlePassengersChange}
                onSwap={handleSwap}
              />
              <FilterBar
                flights={flights}
                filters={filters}
                onFiltersChange={setFilters}
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
            {/* Mobile: PriceGraph first (order 1). Desktop: left column (order 1). */}
            <Grid item size={{ xs: 12, md: 7 }} sx={{ minWidth: 0, order: { xs: 2, md: 1 } }}>
              <FlightList flights={filteredFlights} loading={loading} />
            </Grid>
            {/* Mobile: PriceGraph first (order 1). Desktop: right column (order 2). */}
            <Grid item size={{ xs: 12, md: 5 }} sx={{ minWidth: 0, order: { xs: 1, md: 2 } }}>
              <Box
                sx={{
                  width: '100%',
                  position: { md: 'sticky' },
                  top: { md: 24 },
                }}
              >
                <PriceGraph flights={filteredFlights} loading={loading} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
