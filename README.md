# Flight Search Engine (Skylink)

A modern flight search web app built with **Next.js** and the **Amadeus Flight Offers API**. Search for flights by route and date, filter results in real time, and view price trends on an interactive chart—all in a dark-themed, responsive UI.

---

## Features

- **Flight search** – Origin and destination with autocomplete (airports/cities via Amadeus Locations API).
- **Trip type** – One-way or round-trip with departure and optional return date.
- **Passengers** – Adults, children, infants in seat, and infants on lap; currency is derived from origin country (INR, USD, GBP, AED, EUR).
- **Live filters** (no “Apply” button):
  - **Stops** – Any, nonstop only, 1 stop or fewer, 2 stops or fewer.
  - **Airlines** – Multi-select from airlines in the current results; “Select all” toggle.
  - **Price** – Slider for maximum price (min/max from API).
  - **Duration** – Slider for maximum flight duration (min/max from API).
- **Price trends chart** – Area chart of lowest price by departure time; cheapest/average stats; custom tooltip with “Best price” badge.
- **Responsive layout** – Search + filters in one bar; results list and price graph side-by-side on desktop, stacked on mobile.
- **Dark theme** – Consistent MUI dark palette and styling across the app.

---

## Tech Stack

| Category        | Technology                          |
|----------------|--------------------------------------|
| Framework      | Next.js 16 (App Router)              |
| UI             | React 19, Material UI (MUI) 7        |
| Charts         | Recharts                             |
| API            | Amadeus (OAuth2, Flight Offers, Locations) |

---

## Project Structure

```
flight-search-engine/
├── app/
│   ├── components/
│   │   └── Hero.js              # Landing section + CTA to /flights
│   ├── flights/
│   │   ├── components/
│   │   │   ├── Header.js        # Flights page header
│   │   │   ├── SearchForm.js    # Origin, destination, dates, trip type, passengers
│   │   │   ├── FilterBar.js     # Stops, Airlines, Price, Duration filters
│   │   │   ├── FlightList.js    # Flight cards + loading/empty states
│   │   │   ├── PriceGraph.js    # Price trends chart (Recharts)
│   │   │   ├── FlightSkeleton.js
│   │   │   └── EmptyState.js
│   │   └── page.js              # Flight search page (state, API, filters, layout)
│   ├── layout.js
│   ├── page.js                  # Home (renders Hero)
│   ├── theme.js
│   └── ThemeProvider.js
├── lib/
│   └── amadeus.js               # Amadeus token, searchFlights, searchLocations, transformFlightOffer, getCurrencyByOrigin
├── public/
└── package.json
```

---

## Prerequisites

- **Node.js** 18+ (or 20+ recommended)
- **Amadeus API** credentials (test or production):
  - [Amadeus for Developers](https://developers.amadeus.com/) – create an app to get **API Key** (Client ID) and **API Secret** (Client Secret).
  - Use the **test** base URL for development: `https://test.api.amadeus.com`.

---

## Setup

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd flight-search-engine
   npm install
   ```

2. **Environment variables**

   Create a `.env.local` in the project root (do not commit real secrets):

   ```env
   NEXT_PUBLIC_AMADEUS_API_BASE=https://test.api.amadeus.com
   NEXT_PUBLIC_AMADEUS_CLIENT_ID=your_client_id
   NEXT_PUBLIC_AMADEUS_CLIENT_SECRET=your_client_secret
   ```

   - `NEXT_PUBLIC_AMADEUS_API_BASE` – Amadeus API base URL (test or production).
   - `NEXT_PUBLIC_AMADEUS_CLIENT_ID` – Amadeus app Client ID.
   - `NEXT_PUBLIC_AMADEUS_CLIENT_SECRET` – Amadeus app Client Secret.

   For production, prefer **server-side** token and API calls (e.g. Next.js API routes) so the secret is never exposed to the browser.

3. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use the landing CTA or go to `/flights` to search.

---

## Scripts

| Command         | Description                |
|----------------|----------------------------|
| `npm run dev`  | Start dev server (Turbopack) |
| `npm run build`| Production build           |
| `npm run start`| Start production server    |
| `npm run lint` | Run ESLint                 |

---

## How It Works

1. **Home** (`/`) – Hero with Skylink branding and a button to open the flight search (`/flights`).
2. **Flight search** (`/flights`):
   - User selects **origin** and **destination** (autocomplete from Amadeus Locations).
   - Chooses **trip type** (one-way/round-trip), **dates**, and **passengers** (adults, children, infants).
   - On valid input, the app calls **Amadeus Flight Offers API**; results are transformed and stored in state.
   - **Filters** (stops, airlines, price, duration) run **client-side** on the current result set—no extra API call. Changing filters updates the list and the price graph immediately.
   - **Price graph** aggregates the lowest price per departure time and shows an area chart plus summary stats.

---

## API Notes

- **Token**: Amadeus OAuth2 client credentials; token is cached and reused until near expiry.
- **Flight offers**: `GET /v2/shopping/flight-offers` with origin, destination, dates, passengers, and currency.
- **Locations**: `GET /v1/reference-data/locations` for airport/city autocomplete.
- **Currency**: Derived from origin country (e.g. India → INR, US → USD) and sent as `currencyCode` in the flight offers request.

---

## License

Private / use as per your project terms.
