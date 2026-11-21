# Kashmir Food Finder

Kashmir Food Finder is a tourism-focused full-stack web application that helps travelers discover authentic Kashmiri dishes, trusted restaurants, and cultural food tips before they visit.

## Stack

- Frontend: Next.js 14, React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- No visitor accounts: sign-up, sign-in, saved items and members' reviews were removed in November 2026

## Project Structure

```text
Food App/
  backend/
    src/
      config/
      data/
      middleware/
      models/
      routes/
      scripts/
      utils/
      server.js
  frontend/
    app/
    components/
    context/
    lib/
    public/
  package.json
  README.md
```

## Environment Setup

### 1. Backend

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/kashmir-food-finder
JWT_SECRET=replace-with-a-secure-secret
CLIENT_URL=http://localhost:3000
```

### 2. Frontend

Create `frontend/.env.local` from `frontend/.env.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Install Dependencies

Install packages in each app directory:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Locally

Open two terminals.

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd frontend
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000) and backend runs at [http://localhost:5000](http://localhost:5000).

## Seed Sample Data

After MongoDB is running:

```bash
cd backend
npm run seed
```

This creates:

- Sample Kashmiri dishes like Rogan Josh, Gushtaba, Rista, and Tabak Maaz
- Restaurants linked to dishes

## Features

- Kashmir-themed homepage with search and curated categories
- Dish listing and detail pages with history and tourist tips
- Restaurant discovery with filters and Google Maps integration
- Tourist trap warning and authenticity badges
- Top 5 must-try dishes section

## API Overview

### Dishes

- `GET /api/dishes`
- `GET /api/dishes/top`
- `GET /api/dishes/:id`

### Restaurants

- `GET /api/restaurants`
- `GET /api/restaurants/:id`

### Removed

Everything under `/api/auth` (except `GET /api/auth/csrf-token`), `/api/users`, `/api/reviews`,
`/api/restaurant-leads`, `/api/travel-agencies` and `/api/upload` answers `410 Gone`
(`backend/src/middleware/removedFeatures.js`). A restaurant is listed by e-mail:
`/list-restaurant` says what to send to hello@wazwanway.com.

## Notes

- Google Maps embed will work when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is provided.
- Without a maps API key, the app falls back to a direct Google Maps search link.
