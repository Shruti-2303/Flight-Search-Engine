'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Popover,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Switch,
  Slider,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CloseIcon from '@mui/icons-material/Close';

const STOPS_OPTIONS = [
  { value: 'any', label: 'Any number of stops' },
  { value: 'nonstop', label: 'Nonstop only' },
  { value: '1', label: '1 stop or fewer' },
  { value: '2', label: '2 stops or fewer' },
];

const filterButtonSx = {
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 3,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'text.primary',
  textTransform: 'none',
  px: 2,
  py: 1,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
};

// Chips match filter button size and border-radius (different bg/border for selected state)
const filterChipSx = {
  borderRadius: 3,
  px: 2,
  py: 1,
  minHeight: 40,
  height: 'auto',
  backgroundColor: 'rgba(33, 150, 243, 0.2)',
  color: '#fff',
  border: '1px solid rgba(33, 150, 243, 0.4)',
  '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.8)', marginLeft: '0px', marginRight: '0px' },
  '& .MuiChip-label': { px: 0.5 },
};

const popoverPaperSx = {
  p: 2,
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 2,
  minWidth: 280,
  maxWidth: 360,
};

function getCurrencySymbol(currency) {
  const symbols = { EUR: '€', USD: '$', INR: '₹', GBP: '£' };
  return symbols[currency] || currency;
}

function formatDurationLabel(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '1 hr' : `${hours} hr`;
  }
  return `${minutes} min`;
}

export default function FilterBar({ flights = [], filters, onFiltersChange }) {
  const [anchorEl, setAnchorEl] = useState({ stops: null, airlines: null, price: null, duration: null });

  const { stops = 'any', airlines = [], priceMax, durationMax } = filters || {};

  const derived = useMemo(() => {
    if (!flights.length) {
      return { airlineList: [], priceMin: 0, priceMax: 10000, durationMin: 0, durationMax: 1440, currency: 'USD' };
    }
    const byCode = new Map();
    flights.forEach((f) => {
      if (f.airlineCode && !byCode.has(f.airlineCode)) {
        byCode.set(f.airlineCode, { code: f.airlineCode, name: f.airline || f.airlineCode });
      }
    });
    const airlineList = Array.from(byCode.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const prices = flights.map((f) => f.price).filter((n) => typeof n === 'number');
    const durations = flights.map((f) => f.durationMinutes).filter((n) => typeof n === 'number');
    const currency = flights[0]?.currency || 'USD';
    return {
      airlineList,
      priceMin: 0,
      priceMax: Math.max(1000, ...(prices.length ? prices : [10000])),
      durationMin: 0,
      durationMax: Math.max(60, ...(durations.length ? durations : [1440])),
      currency,
    };
  }, [flights]);

  const handleOpen = (key) => (e) => setAnchorEl((prev) => ({ ...prev, [key]: e.currentTarget }));
  const handleClose = (key) => () => setAnchorEl((prev) => ({ ...prev, [key]: null }));

  const updateFilters = (partial) => {
    onFiltersChange?.({ ...filters, ...partial });
  };

  const handleStopsChange = (e) => updateFilters({ stops: e.target.value });
  const handleAirlinesChange = (code, checked) => {
    const next = checked ? [...(airlines || []), code] : (airlines || []).filter((c) => c !== code);
    updateFilters({ airlines: next });
  };
  const handleSelectAllAirlines = (checked) => {
    updateFilters({ airlines: checked ? derived.airlineList.map((a) => a.code) : [] });
  };
  const allAirlinesSelected =
    derived.airlineList.length > 0 && (airlines || []).length >= derived.airlineList.length;
  const handlePriceChange = (_, value) => updateFilters({ priceMax: value === derived.priceMax ? null : value });
  const handleDurationChange = (_, value) =>
    updateFilters({ durationMax: value === derived.durationMax ? null : value });

  const clearStops = () => updateFilters({ stops: 'any' });
  const clearAirlines = () => updateFilters({ airlines: [] });
  const clearPrice = () => updateFilters({ priceMax: null });
  const clearDuration = () => updateFilters({ durationMax: null });

  const stopsLabel = STOPS_OPTIONS.find((o) => o.value === stops)?.label || 'Stops';
  const priceLabel = priceMax != null ? `up to ${getCurrencySymbol(derived.currency)}${Number(priceMax).toLocaleString()}` : 'Price';
  const durationLabel =
    durationMax != null ? `Under ${formatDurationLabel(durationMax)}` : 'Duration';

  return (
    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        {/* Active filter chips */}
        {stops !== 'any' && (
          <Chip
            label={stops === 'nonstop' ? 'Nonstop' : stopsLabel}
            onDelete={clearStops}
            deleteIcon={<CloseIcon />}
            sx={filterChipSx}
          />
        )}
        {airlines && airlines.length > 0 && (
          <>
            {airlines.slice(0, 3).map((code) => {
              const a = derived.airlineList.find((x) => x.code === code);
              return (
                <Chip
                  key={code}
                  label={a?.name || code}
                  onDelete={() => handleAirlinesChange(code, false)}
                  deleteIcon={<CloseIcon />}
                  sx={filterChipSx}
                />
              );
            })}
            {airlines.length > 3 && (
              <Chip
                label={`+${airlines.length - 3}`}
                sx={{
                  ...filterChipSx,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'text.secondary',
                }}
              />
            )}
          </>
        )}
        {priceMax != null && (
          <Chip
            label={priceLabel}
            onDelete={clearPrice}
            deleteIcon={<CloseIcon />}
            sx={filterChipSx}
          />
        )}
        {durationMax != null && (
          <Chip
            label={durationLabel}
            onDelete={clearDuration}
            deleteIcon={<CloseIcon />}
            sx={filterChipSx}
          />
        )}

        {/* Filter buttons */}
        <Button
          onClick={handleOpen('stops')}
          endIcon={anchorEl.stops ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          sx={filterButtonSx}
        >
          Stops
        </Button>
        <Button
          onClick={handleOpen('airlines')}
          endIcon={anchorEl.airlines ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          sx={filterButtonSx}
        >
          Airlines
        </Button>
        <Button
          onClick={handleOpen('price')}
          endIcon={anchorEl.price ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          sx={filterButtonSx}
        >
          Price
        </Button>
        <Button
          onClick={handleOpen('duration')}
          endIcon={anchorEl.duration ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          sx={filterButtonSx}
        >
          Duration
        </Button>
      </Box>

      {/* Stops popover */}
      <Popover
        open={Boolean(anchorEl.stops)}
        anchorEl={anchorEl.stops}
        onClose={handleClose('stops')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: popoverPaperSx } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Stops
          </Typography>
          <IconButton size="small" onClick={handleClose('stops')} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <RadioGroup value={stops} onChange={handleStopsChange}>
          {STOPS_OPTIONS.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio size="small" sx={{ color: 'primary.main' }} />}
              label={opt.label}
              sx={{ color: 'text.primary', '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            />
          ))}
        </RadioGroup>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" onClick={clearStops} sx={{ color: 'text.secondary', textTransform: 'none' }}>
            Clear
          </Button>
        </Box>
      </Popover>

      {/* Airlines popover */}
      <Popover
        open={Boolean(anchorEl.airlines)}
        anchorEl={anchorEl.airlines}
        onClose={handleClose('airlines')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { ...popoverPaperSx, maxHeight: 400 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Airlines
          </Typography>
          <IconButton size="small" onClick={handleClose('airlines')} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Select all airlines
          </Typography>
          <Switch
            size="small"
            checked={allAirlinesSelected}
            onChange={(e) => handleSelectAllAirlines(e.target.checked)}
            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' } }}
          />
        </Box>
        <FormGroup sx={{ maxHeight: 260, overflow: 'auto' }}>
          {derived.airlineList.map((a) => (
            <FormControlLabel
              key={a.code}
              control={
                <Checkbox
                  size="small"
                  checked={(airlines || []).includes(a.code)}
                  onChange={(e) => handleAirlinesChange(a.code, e.target.checked)}
                  sx={{ color: 'primary.main' }}
                />
              }
              label={<Typography variant="body2">{a.name || a.code}</Typography>}
              sx={{ color: 'text.primary' }}
            />
          ))}
        </FormGroup>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" onClick={clearAirlines} sx={{ color: 'text.secondary', textTransform: 'none' }}>
            Clear
          </Button>
        </Box>
      </Popover>

      {/* Price popover */}
      <Popover
        open={Boolean(anchorEl.price)}
        anchorEl={anchorEl.price}
        onClose={handleClose('price')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: popoverPaperSx } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Price
          </Typography>
          <IconButton size="small" onClick={handleClose('price')} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
          {priceMax != null
            ? `up to ${getCurrencySymbol(derived.currency)}${Number(priceMax).toLocaleString()}`
            : 'All prices'}
        </Typography>
        <Slider
          value={priceMax ?? derived.priceMax}
          min={derived.priceMin}
          max={derived.priceMax}
          step={Math.max(1, Math.floor(derived.priceMax / 100))}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${getCurrencySymbol(derived.currency)}${v.toLocaleString()}`}
          sx={{ color: 'primary.main', mt: 1 }}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" onClick={clearPrice} sx={{ color: 'text.secondary', textTransform: 'none' }}>
            Clear
          </Button>
        </Box>
      </Popover>

      {/* Duration popover */}
      <Popover
        open={Boolean(anchorEl.duration)}
        anchorEl={anchorEl.duration}
        onClose={handleClose('duration')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: popoverPaperSx } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Duration
          </Typography>
          <IconButton size="small" onClick={handleClose('duration')} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Flight duration
        </Typography>
        <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
          {durationMax != null ? `Under ${formatDurationLabel(durationMax)}` : 'Any'}
        </Typography>
        <Slider
          value={durationMax ?? derived.durationMax}
          min={derived.durationMin}
          max={derived.durationMax}
          step={30}
          onChange={handleDurationChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => formatDurationLabel(v)}
          sx={{ color: 'primary.main', mt: 1 }}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" onClick={clearDuration} sx={{ color: 'text.secondary', textTransform: 'none' }}>
            Clear
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
