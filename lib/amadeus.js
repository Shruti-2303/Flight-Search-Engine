let cachedToken = null;
let tokenExpiry = null;

export async function getAmadeusToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_AMADEUS_API_BASE}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.NEXT_PUBLIC_AMADEUS_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_AMADEUS_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // Set expiry 30 seconds before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in - 30) * 1000;
    
    return cachedToken;
  } catch (error) {
    console.error('Error fetching Amadeus token:', error);
    throw error;
  }
}


/** Country code → ISO 4217 currency code (origin market). Fallback EUR. */
const COUNTRY_CURRENCY_MAP = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AE: 'AED',
};

/**
 * Get currency code from origin's country (for Amadeus currencyCode and display).
 * @param {{ label?: string, iataCode: string, countryCode?: string } | string | null} origin - Origin object from location search, or legacy IATA string
 * @returns {string} ISO currency code (e.g. INR, USD, GBP, AED, or EUR)
 */
export function getCurrencyByOrigin(origin) {
  if (!origin) return 'EUR';
  const countryCode =
    typeof origin === 'object' && origin !== null && origin.countryCode
      ? String(origin.countryCode).toUpperCase()
      : null;
  if (countryCode && COUNTRY_CURRENCY_MAP[countryCode])
    return COUNTRY_CURRENCY_MAP[countryCode];
  return 'EUR';
}

export async function searchFlights(origin, destination, departureDate, passengers = {}, returnDate = null, currencyCode = null) {
  try {
    const token = await getAmadeusToken();
    const adults = passengers.adults ?? 1;
    const children = passengers.children ?? 0;
    const infantsOnLap = passengers.infantsOnLap ?? 0;
    const originIata = typeof origin === 'object' && origin?.iataCode ? origin.iataCode : String(origin || '');
    const destIata = typeof destination === 'object' && destination?.iataCode ? destination.iataCode : String(destination || '');
    const effectiveCurrency = currencyCode || getCurrencyByOrigin(origin);

    const params = new URLSearchParams({
      originLocationCode: originIata.toUpperCase(),
      destinationLocationCode: destIata.toUpperCase(),
      departureDate,
      adults: adults.toString(),
      currencyCode: effectiveCurrency,
    });
    if (returnDate) {
      params.set('returnDate', returnDate);
    }
    if (children > 0) {
      params.set('children', children.toString());
    }
    // Amadeus GET "infants" = lap infants (held). Infants in seat are not supported in GET; UI still collects for future POST support.
    if (infantsOnLap > 0) {
      params.set('infants', infantsOnLap.toString());
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AMADEUS_API_BASE}/v2/shopping/flight-offers?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Flight search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      offers: data.data || [],
      dictionaries: data.dictionaries || {},
    };
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}


export async function searchLocations(keyword, limit = 10) {
  if (!keyword || keyword.trim().length < 2) return [];

  try {
    const token = await getAmadeusToken();
    const params = new URLSearchParams({
      subType: 'AIRPORT,CITY',
      keyword: keyword.trim(),
      'page[limit]': limit.toString(),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AMADEUS_API_BASE}/v1/reference-data/locations?${params.toString()}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error('Locations fetch failed');

    const json = await response.json();
    const data = json.data || [];

    // Deduplicate by iataCode; include label (cityName) and countryCode for currency
    const byCode = new Map();
    for (const loc of data) {
      const iata = loc.iataCode;
      if (!iata) continue;
      const cityName = loc.address?.cityName || loc.name || iata;
      const countryCode = loc.address?.countryCode || null;
      if (!byCode.has(iata)) {
        byCode.set(iata, {
          iataCode: iata,
          label: cityName,
          cityName, // keep for backward compatibility in getOptionLabel
          countryCode: countryCode ? String(countryCode).toUpperCase() : null,
          subType: loc.subType,
        });
      }
    }

    return Array.from(byCode.values());
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

/**
 * Parse ISO 8601 duration to human-readable format
 * @param {string} duration - ISO 8601 duration (e.g., 'PT2H15M')
 * @returns {string} Human-readable duration (e.g., '2h 15m')
 */
export function parseDuration(duration) {
  if (!duration) return '';
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Parse ISO 8601 duration to total minutes (for filtering)
 * @param {string} duration - ISO 8601 duration (e.g., 'PT2H15M')
 * @returns {number} Total minutes
 */
export function durationToMinutes(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + minutes;
}

/**
 * Format date-time string to time only
 * @param {string} dateTime - ISO date-time string (e.g., '2026-03-10T13:15:00')
 * @returns {string} Time in HH:MM format
 */
export function formatTime(dateTime) {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Transform Amadeus flight offer to our flight object format
 * @param {Object} offer - Amadeus flight offer
 * @param {Object} dictionaries - Carrier dictionaries from API response
 * @returns {Object} Transformed flight object
 */
export function transformFlightOffer(offer, dictionaries = {}) {
  const itinerary = offer.itineraries?.[0];
  const segment = itinerary?.segments?.[0];
  const price = offer.price;
  
  if (!segment || !price) return null;

  const carrierCode = segment.carrierCode;
  const airlineName = dictionaries?.carriers?.[carrierCode] || carrierCode;
  
  const segmentCount = itinerary.segments?.length ?? 1;
  const isNonstop = segmentCount === 1;
  const totalStops = segmentCount - 1;
  const durationMinutes = durationToMinutes(itinerary.duration);
  
  return {
    id: offer.id,
    airline: airlineName,
    airlineCode: carrierCode,
    origin: segment.departure.iataCode,
    destination: segment.arrival.iataCode,
    departureTime: segment.departure.at,
    arrivalTime: segment.arrival.at,
    duration: parseDuration(itinerary.duration),
    durationMinutes,
    price: parseFloat(price.total),
    currency: price.currency,
    isNonstop,
    totalStops,
    numberOfStops: segment.numberOfStops || 0,
    terminal: {
      departure: segment.departure.terminal,
      arrival: segment.arrival.terminal,
    },
  };
}
