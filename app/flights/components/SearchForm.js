'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Button,
  Popover,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  SwapHoriz,
  FlightTakeoff,
  FlightLand,
  CalendarMonth,
  PersonOutline as PersonIcon,
  KeyboardArrowDown as ChevronDownIcon,
  KeyboardArrowUp as ChevronUpIcon,
  Remove as MinusIcon,
  Add as PlusIcon,
} from '@mui/icons-material';
import { searchLocations } from '@/lib/amadeus';

// Format city name for display: "DELHI" -> "Delhi"
function formatCityName(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Shared input styles (responsive: full width on mobile)
const inputStyle = {
  width: { xs: '100%', md: 325 },
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
    '&.Mui-focused': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  },
};

const dateStyle = {
  width: { xs: '100%', md: 350 },
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
    '&.Mui-focused': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  },
};

const tripTypeSelectStyle = {
  width: { xs: '100%', md: 'auto' },
  minWidth: { xs: '100%', md: 140 },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 56,
    minHeight: 56,
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
    '&.Mui-focused': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  },
};

// Match Origin/Destination border (MUI dark OutlinedInput: 0.23 default, 0.87 hover)
const inputBorderColor = 'rgba(255, 255, 255, 0.23)';
const inputBorderColorHover = 'rgba(255, 255, 255, 0.87)';

const adultsTriggerSx = {
  width: { xs: '100%', md: 'auto' },
  minWidth: { xs: '100%', md: 80 },
  height: 56,
  minHeight: 56,
  border: `1px solid ${inputBorderColor}`,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'text.primary',
  textTransform: 'none',
  py: 0,
  px: 2,
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: inputBorderColorHover,
  },
  '&.Mui-focused': {
    borderColor: 'primary.main',
    borderWidth: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
};

function PassengerRow({ label, subtitle, value, onMinus, onPlus }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Box>
        <Typography variant="body2" color="text.primary">
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={onMinus}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: 'text.primary',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
          }}
        >
          <MinusIcon fontSize="small" />
        </IconButton>
        <Typography variant="body1" sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>
          {value}
        </Typography>
        <IconButton
          size="small"
          onClick={onPlus}
          sx={{
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            color: 'primary.main',
            '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.3)' },
          }}
        >
          <PlusIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

// Debounce hook: only update debounced value after delay
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchForm({
  origin,
  destination,
  departureDate,
  returnDate,
  tripType = 'oneWay',
  adults = 1,
  children = 0,
  infantsInSeat = 0,
  infantsOnLap = 0,
  onOriginChange,
  onDestinationChange,
  onDepartureDateChange,
  onReturnDateChange,
  onTripTypeChange,
  onPassengersChange,
  onSwap,
}) {
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [originOptions, setOriginOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [passengersPopoverAnchor, setPassengersPopoverAnchor] = useState(null);
  const [draftAdults, setDraftAdults] = useState(1);
  const [draftChildren, setDraftChildren] = useState(0);
  const [draftInfantsInSeat, setDraftInfantsInSeat] = useState(0);
  const [draftInfantsOnLap, setDraftInfantsOnLap] = useState(0);

  const debouncedOriginInput = useDebounce(originInput, 400);
  const debouncedDestinationInput = useDebounce(destinationInput, 400);

  // Get the selected option object for origin (for Autocomplete value)
  const originSelectedOption =
    origin && originOptions.find((o) => o.iataCode === origin)
      ? originOptions.find((o) => o.iataCode === origin)
      : origin
        ? { iataCode: origin, cityName: origin }
        : null;

  const destinationSelectedOption =
    destination && destinationOptions.find((o) => o.iataCode === destination)
      ? destinationOptions.find((o) => o.iataCode === destination)
      : destination
        ? { iataCode: destination, cityName: destination }
        : null;

  // Label for dropdown options and display: only city name
  function getOptionLabel(option) {
    if (!option) return '';
    if (option.cityName && option.cityName !== option.iataCode) {
      return formatCityName(option.cityName);
    }
    return option.iataCode || '';
  }

  // When user is typing something different from the current selection, don't force the old value
  // (so they can clear Chennai and type "mum" without it snapping back to Chennai)
  const originValue =
    originInput.trim() === getOptionLabel(originSelectedOption)
      ? originSelectedOption
      : null;
  const destinationValue =
    destinationInput.trim() === getOptionLabel(destinationSelectedOption)
      ? destinationSelectedOption
      : null;

  // Only sync input text when origin/destination *prop* changes (e.g. swap). Never overwrite while user is typing.
  useEffect(() => {
    if (origin) {
      setOriginInput(getOptionLabel(originSelectedOption));
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      setDestinationInput(getOptionLabel(destinationSelectedOption));
    }
  }, [destination]);

  // When options load for current origin/destination, update display from "Del" to "Delhi" only if input still shows the code
  useEffect(() => {
    const option = originOptions.find((o) => o.iataCode === origin);
    if (option && option.cityName !== option.iataCode) {
      const fallbackLabel = formatCityName(origin);
      if (originInput === fallbackLabel || originInput === origin) {
        setOriginInput(formatCityName(option.cityName));
      }
    }
  }, [originOptions, origin]);

  useEffect(() => {
    const option = destinationOptions.find((o) => o.iataCode === destination);
    if (option && option.cityName !== option.iataCode) {
      const fallbackLabel = formatCityName(destination);
      if (destinationInput === fallbackLabel || destinationInput === destination) {
        setDestinationInput(formatCityName(option.cityName));
      }
    }
  }, [destinationOptions, destination]);

  // Load options only when user is actually typing a search (not when input shows the current selection label).
  // Skip fetch when input matches current selection (e.g. "Delhi" after we synced it) to avoid extra API calls.
  useEffect(() => {
    if (debouncedOriginInput.length < 2) return;
    const selectionLabel = origin ? getOptionLabel(originSelectedOption) : '';
    if (origin && debouncedOriginInput.trim() === selectionLabel) return;
    let cancelled = false;
    setOriginLoading(true);
    searchLocations(debouncedOriginInput, 10)
      .then((data) => {
        if (!cancelled) setOriginOptions(data);
      })
      .finally(() => {
        if (!cancelled) setOriginLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedOriginInput]);

  useEffect(() => {
    if (debouncedDestinationInput.length < 2) return;
    const selectionLabel = destination ? getOptionLabel(destinationSelectedOption) : '';
    if (destination && debouncedDestinationInput.trim() === selectionLabel) return;
    let cancelled = false;
    setDestinationLoading(true);
    searchLocations(debouncedDestinationInput, 10)
      .then((data) => {
        if (!cancelled) setDestinationOptions(data);
      })
      .finally(() => {
        if (!cancelled) setDestinationLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedDestinationInput]);

  // Load initial options only when we don't already have this option (avoids duplicate call after user typed and selected).
  useEffect(() => {
    if (!origin || origin.length < 2) return;
    if (originOptions.some((o) => o.iataCode === origin)) return;
    searchLocations(origin, 5).then((data) => {
      setOriginOptions((prev) => {
        const map = new Map(prev.map((o) => [o.iataCode, o]));
        data.forEach((o) => map.set(o.iataCode, o));
        return Array.from(map.values());
      });
    });
  }, [origin]);

  useEffect(() => {
    if (!destination || destination.length < 2) return;
    if (destinationOptions.some((o) => o.iataCode === destination)) return;
    searchLocations(destination, 5).then((data) => {
      setDestinationOptions((prev) => {
        const map = new Map(prev.map((o) => [o.iataCode, o]));
        data.forEach((o) => map.set(o.iataCode, o));
        return Array.from(map.values());
      });
    });
  }, [destination]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 4,
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        <Autocomplete
          value={originValue}
          inputValue={originInput}
          onInputChange={(_, newValue) => setOriginInput(newValue)}
          onChange={(_, newOption) => {
            if (newOption) {
              onOriginChange(newOption.iataCode);
              setOriginInput(getOptionLabel(newOption));
            }
          }}
          options={originOptions}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(a, b) => a?.iataCode === b?.iataCode}
          loading={originLoading}
          filterOptions={(opts) => opts}
          noOptionsText="Type at least 2 characters to search"
          sx={inputStyle}
          renderOption={(props, option) => (
            <li {...props} key={option.iataCode}>
              {getOptionLabel(option)}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Origin"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <FlightTakeoff sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {originLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={{ '& .MuiAutocomplete-input': { paddingLeft: 0 } }}
            />
          )}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                '& .MuiAutocomplete-option': {
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                  '&[aria-selected="true"]': { backgroundColor: 'rgba(33, 150, 243, 0.2)' },
                },
              },
            },
          }}
        />

        <IconButton
          onClick={onSwap}
          sx={{
            alignSelf: { xs: 'center', md: 'auto' },
            flexShrink: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <SwapHoriz />
        </IconButton>

        <Autocomplete
          value={destinationValue}
          inputValue={destinationInput}
          onInputChange={(_, newValue) => setDestinationInput(newValue)}
          onChange={(_, newOption) => {
            if (newOption) {
              onDestinationChange(newOption.iataCode);
              setDestinationInput(getOptionLabel(newOption));
            }
          }}
          options={destinationOptions}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(a, b) => a?.iataCode === b?.iataCode}
          loading={destinationLoading}
          filterOptions={(opts) => opts}
          noOptionsText="Type at least 2 characters to search"
          sx={inputStyle}
          renderOption={(props, option) => (
            <li {...props} key={option.iataCode}>
              {getOptionLabel(option)}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Destination"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <FlightLand sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {destinationLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={{ '& .MuiAutocomplete-input': { paddingLeft: 0 } }}
            />
          )}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                '& .MuiAutocomplete-option': {
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                  '&[aria-selected="true"]': { backgroundColor: 'rgba(33, 150, 243, 0.2)' },
                },
              },
            },
          }}
        />

        <FormControl variant="outlined" sx={tripTypeSelectStyle} size="medium">
          <Select
            value={tripType}
            onChange={(e) => onTripTypeChange?.(e.target.value)}
            displayEmpty
            renderValue={(v) => (v === 'roundTrip' ? 'Round trip' : 'One way')}
            sx={{
              color: 'text.primary',
              '& .MuiSelect-select': { py: 1.5 },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColorHover },
            }}
          >
            <MenuItem value="oneWay">One way</MenuItem>
            <MenuItem value="roundTrip">Round trip</MenuItem>
          </Select>
        </FormControl>

        <TextField
          type="date"
          value={departureDate}
          onChange={(e) => onDepartureDateChange(e.target.value)}
          variant="outlined"
          sx={dateStyle}
          inputProps={{
            min: new Date().toISOString().split('T')[0],
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonth sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {tripType === 'roundTrip' && (
          <TextField
            type="date"
            label="Return"
            value={returnDate ?? ''}
            onChange={(e) => onReturnDateChange?.(e.target.value)}
            variant="outlined"
            sx={dateStyle}
            inputProps={{
              min: departureDate || new Date().toISOString().split('T')[0],
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonth sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        <Button
          variant="outlined"
          onClick={(e) => {
            setPassengersPopoverAnchor(e.currentTarget);
            setDraftAdults(adults);
            setDraftChildren(children);
            setDraftInfantsInSeat(infantsInSeat);
            setDraftInfantsOnLap(infantsOnLap);
          }}
          endIcon={passengersPopoverAnchor ? <ChevronUpIcon /> : <ChevronDownIcon />}
          sx={{
            ...adultsTriggerSx,
            ...(passengersPopoverAnchor
              ? { borderColor: 'primary.main', borderWidth: '2px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }
              : {}),
          }}
        >
          <PersonIcon sx={{ color: 'text.secondary', fontSize: 22, mr: 1 }} />
          {adults + children + infantsInSeat + infantsOnLap}
        </Button>

        <Popover
          open={Boolean(passengersPopoverAnchor)}
          anchorEl={passengersPopoverAnchor}
          onClose={() => setPassengersPopoverAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                p: 2,
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                minWidth: 280,
              },
            },
          }}
        >
          <PassengerRow
            label="Adults"
            value={draftAdults}
            onMinus={() => setDraftAdults((n) => Math.max(1, n - 1))}
            onPlus={() => setDraftAdults((n) => Math.min(9, n + 1))}
          />
          <PassengerRow
            label="Children"
            subtitle="Aged 2-11"
            value={draftChildren}
            onMinus={() => setDraftChildren((n) => Math.max(0, n - 1))}
            onPlus={() => setDraftChildren((n) => Math.min(9, n + 1))}
          />
          <PassengerRow
            label="Infants"
            subtitle="In seat"
            value={draftInfantsInSeat}
            onMinus={() => setDraftInfantsInSeat((n) => Math.max(0, n - 1))}
            onPlus={() => setDraftInfantsInSeat((n) => Math.min(9, n + 1))}
          />
          <PassengerRow
            label="Infants"
            subtitle="On lap"
            value={draftInfantsOnLap}
            onMinus={() => setDraftInfantsOnLap((n) => Math.max(0, n - 1))}
            onPlus={() => setDraftInfantsOnLap((n) => Math.min(9, n + 1))}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              size="small"
              onClick={() => setPassengersPopoverAnchor(null)}
              sx={{ color: 'text.secondary', textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                onPassengersChange?.({
                  adults: draftAdults,
                  children: draftChildren,
                  infantsInSeat: draftInfantsInSeat,
                  infantsOnLap: draftInfantsOnLap,
                });
                setPassengersPopoverAnchor(null);
              }}
              sx={{ textTransform: 'none' }}
            >
              Done
            </Button>
          </Box>
        </Popover>
      </Box>
    </Paper>
  );
}
