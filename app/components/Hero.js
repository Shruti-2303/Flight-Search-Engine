'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';

const LOGO_URL = 'https://res.cloudinary.com/ddtemnyax/image/upload/v1769838696/lightLogoNew_tojvtk.png';

const glowPrimary = 'rgba(33, 150, 243, 0.6)';
const glowPrimaryStrong = 'rgba(33, 150, 243, 0.8)';

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        py: 6,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #0f0f0f 0%, #1a1a2e 40%, #16213e 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(33, 150, 243, 0.18), transparent)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          maxWidth: 520,
        }}
      >
        <Box
          component="img"
          src={LOGO_URL}
          alt="Skylink"
          sx={{
            height: { xs: 72, sm: 88 },
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            fontSize: { xs: '2.25rem', sm: '3rem' },
            letterSpacing: '0.04em',
            color: '#e0e0e0',
            lineHeight: 1.2,
          }}
        >
          Skylink
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '1rem', sm: '1.125rem' },
            maxWidth: 360,
            lineHeight: 1.6,
          }}
        >
          Find the best flight deals and compare prices across airlines. Search, compare, and book with ease.
        </Typography>
        <Button
          component={Link}
          href="/flights"
          variant="contained"
          size="large"
          startIcon={<FlightTakeoff />}
          sx={{
            mt: 1,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 3,
            backgroundColor: '#2196f3',
            color: '#fff',
            boxShadow: `0 0 24px ${glowPrimary}, 0 0 48px ${glowPrimary}, 0 8px 32px rgba(33, 150, 243, 0.4)`,
            animation: 'glow-pulse 2.5s ease-in-out infinite',
            '@keyframes glow-pulse': {
              '0%, 100%': {
                boxShadow: `0 0 24px ${glowPrimary}, 0 0 48px ${glowPrimary}, 0 8px 32px rgba(33, 150, 243, 0.4)`,
              },
              '50%': {
                boxShadow: `0 0 32px ${glowPrimaryStrong}, 0 0 64px ${glowPrimary}, 0 12px 40px rgba(33, 150, 243, 0.5)`,
              },
            },
            '&:hover': {
              backgroundColor: '#2196f3',
              boxShadow: `0 0 40px ${glowPrimaryStrong}, 0 0 80px ${glowPrimary}, 0 12px 48px rgba(33, 150, 243, 0.5)`,
              transform: 'translateY(-3px)',
              animation: 'none',
            },
            transition: 'transform 0.2s ease, box-shadow 0.3s ease',
          }}
        >
          Search Flights
        </Button>
      </Box>
    </Box>
  );
}
