const AMADEUS_API_BASE = 'https://test.api.amadeus.com';
const CLIENT_ID = 'znHVyNGbycvHGhGHa49XjJGHDxUFXA1X';
const CLIENT_SECRET = 'ODVhXA81gVN2iuZS';

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Amadeus OAuth2 access token
 * @returns {Promise<string>} Access token
 */
export async function getAmadeusToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${AMADEUS_API_BASE}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
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

/**
 * Search flights using Amadeus API
 * @param {string} origin - Origin airport code (e.g., 'DEL')
 * @param {string} destination - Destination airport code (e.g., 'BOM')
 * @param {string} departureDate - Departure date in YYYY-MM-DD format
 * @param {number} adults - Number of adults (default: 1)
 * @returns {Promise<Object>} Object with data array and dictionaries
 */
export async function searchFlights(origin, destination, departureDate, adults = 1) {
  try {
    const token = await getAmadeusToken();
    
    const params = new URLSearchParams({
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults: adults.toString(),
    });

    const response = await fetch(
      `${AMADEUS_API_BASE}/v2/shopping/flight-offers?${params.toString()}`,
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
  
  const isNonstop = itinerary.segments.length === 1;
  // Check for CO2 emissions at segment level first, then itinerary level
  const co2Emissions = segment.co2Emissions?.[0] || itinerary.co2Emissions?.[0];
  
  return {
    id: offer.id,
    airline: airlineName,
    airlineCode: carrierCode,
    origin: segment.departure.iataCode,
    destination: segment.arrival.iataCode,
    departureTime: segment.departure.at,
    arrivalTime: segment.arrival.at,
    duration: parseDuration(itinerary.duration),
    price: parseFloat(price.total),
    currency: price.currency,
    isNonstop,
    numberOfStops: segment.numberOfStops || 0,
    co2Emissions: co2Emissions ? {
      weight: co2Emissions.weight,
      weightUnit: co2Emissions.weightUnit || 'KG',
      cabin: co2Emissions.cabin,
    } : null,
    terminal: {
      departure: segment.departure.terminal,
      arrival: segment.arrival.terminal,
    },
  };
}
