'use client';

import { useState } from 'react';
import { Box, Container, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import SearchForm from './components/SearchForm';
import FlightList from './components/FlightList';

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
    const [flights, setFlights] = useState([
        {
          id: 'AI-101',
          airline: 'Air India',
          origin: 'DEL',
          destination: 'BOM',
          departure_time: '06:30:00',
          arrival_time: '08:45:00',
          duration: '2h 15m',
          price: 92,
        },
        {
          id: '6E-234',
          airline: 'IndiGo',
          origin: 'DEL',
          destination: 'BOM',
          departure_time: '09:10:00',
          arrival_time: '11:25:00',
          duration: '2h 15m',
          price: 88,
        },
        {
          id: 'UK-815',
          airline: 'Vistara',
          origin: 'DEL',
          destination: 'BOM',
          departure_time: '13:40:00',
          arrival_time: '15:50:00',
          duration: '2h 10m',
          price: 115,
        },
        {
          id: 'SG-402',
          airline: 'SpiceJet',
          origin: 'DEL',
          destination: 'BOM',
          departure_time: '18:20:00',
          arrival_time: '20:35:00',
          duration: '2h 15m',
          price: 79,
        },
        {
          id: 'AI-987',
          airline: 'Air India Express',
          origin: 'DEL',
          destination: 'BOM',
          departure_time: '22:10:00',
          arrival_time: '00:25:00',
          duration: '2h 15m',
          price: 85,
        },
  ]);
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <SearchForm/>

          <FlightList flights={flights} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
