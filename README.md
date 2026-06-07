# Kashmir Food Finder

Kashmir Food Finder is a tourism-focused full-stack web application that helps travelers discover authentic Kashmiri dishes, trusted restaurants, and cultural food tips before they visit.

## Stack

- Frontend: Next.js 14, React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT-based email/password authentication

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
- Sample reviews
- An admin account

### Seeded Admin Login

- Email: `admin@kashmirfoodfinder.com`
- Password: `Admin123!`

## Features

- Kashmir-themed homepage with search and curated categories
- Dish listing and detail pages with history and tourist tips
- Restaurant discovery with filters and Google Maps integration
- Favorites, reviews, and ratings for signed-in users
- Admin dashboard for managing dishes and restaurants
- Tourist trap warning and authenticity badges
- Top 5 must-try dishes section

## API Overview

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Dishes

- `GET /api/dishes`
- `GET /api/dishes/top`
- `GET /api/dishes/:id`
- `POST /api/dishes` (admin)
- `PUT /api/dishes/:id` (admin)
- `DELETE /api/dishes/:id` (admin)

### Restaurants

- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `POST /api/restaurants` (admin)
- `PUT /api/restaurants/:id` (admin)
- `DELETE /api/restaurants/:id` (admin)

### Reviews

- `GET /api/reviews/restaurant/:restaurantId`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`

### Users

- `GET /api/users/favorites`
- `POST /api/users/favorites`
- `DELETE /api/users/favorites`

## Notes

- Google Maps embed will work when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is provided.
- Without a maps API key, the app falls back to a direct Google Maps search link.
- Authentication is implemented with JWT so Firebase remains optional.
