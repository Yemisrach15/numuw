# Numuw Mobile

Expo React Native client for parents. The app uses Firebase email/password auth, the Django REST API for therapists, slots, and bookings, and a websocket channel for live booking updates.

## Setup

1. Copy `.env.example` to `.env` and fill in the Firebase and backend values.
2. Run `npm install`.
3. Start the app with `npm run start`.

## Backend contract

- REST base URL: `EXPO_PUBLIC_API_URL` defaults to `http://localhost:8000/api`
- WebSocket base URL: `EXPO_PUBLIC_WS_URL` defaults to `ws://localhost:8000/ws`
- Expected live booking route: `/ws/bookings/<booking_id>/`
- The booking screen listens for status messages and updates in real time without polling.

## Notes

- Sign in and sign up happen through Firebase Auth on the client.
- The backend verifies the Firebase ID token on each API request.
- Therapists and slots use pull-to-refresh, while booking confirmation relies on websocket events.
