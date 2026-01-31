'use client';

import { Box, Typography } from '@mui/material';

const LOGO_URL = 'https://res.cloudinary.com/ddtemnyax/image/upload/v1769838696/lightLogoNew_tojvtk.png';

export default function Header() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 3,
      }}
    >
      <Box
        component="img"
        src={LOGO_URL}
        alt="Skylink"
        sx={{
          height: { xs: 34, sm: 40 },
          width: 'auto',
          objectFit: 'contain',
        }}
      />
      <Typography
        component="span"
        sx={{
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 600,
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
          letterSpacing: '0.02em',
          color: 'text.primary',
        }}
      >
        Skylink
      </Typography>
    </Box>
  );
}
