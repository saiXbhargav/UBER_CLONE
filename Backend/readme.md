# RideX Backend API Documentation

## Overview

This document provides comprehensive documentation for the RideX Backend API. The API allows users and captains to register, authenticate, manage profiles, create rides, and interact with mapping services.

## Setup

```bash
npm install
npm run dev     # node --watch server.js
npm test        # unit tests (node:test, no extra deps)
```

### Environment variables (`Backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | no | Port to listen on (default `3000`) |
| `DB_CONNECT` | yes | MongoDB connection string (MongoDB Atlas free tier works) |
| `JWT_SECRET` | yes | Long random string used to sign tokens |
| `CLIENT_URL` | recommended | Allowed frontend origin(s), comma-separated, e.g. `http://localhost:5173,https://your-app.vercel.app`. If unset, every origin is allowed (fine for local dev only). |
| `ORS_MAPS_API` | no | Free [openrouteservice](https://openrouteservice.org) key (no credit card). Used for routing and autocomplete when set. |

All map services are free. Without `ORS_MAPS_API` the API falls back to
[Photon](https://photon.komoot.io) for geocoding and suggestions and the public
[OSRM](https://project-osrm.org) server for routes. Results are cached in memory for 10 minutes.

## Base URL

```
http://localhost:3000
```

`GET /health` returns `{ "status": "ok", "uptime": <seconds> }` for uptime checks.

## Errors

Every error response is JSON with a `message` field. Validation errors also include an `errors` array.
Business-rule conflicts (ride already taken, wrong status, already rated) return `409`.

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Table of Contents

- [User Endpoints](#user-endpoints)
  - [Register User](#usersregister)
  - [Login User](#userslogin)
  - [User Profile](#usersprofile)
  - [Logout User](#userslogout)
- [Captain Endpoints](#captain-endpoints)
  - [Register Captain](#captainsregister)
  - [Login Captain](#captainslogin)
  - [Captain Profile](#captainsprofile)
  - [Logout Captain](#captainslogout)
- [Maps Endpoints](#maps-endpoints)
  - [Get Coordinates](#mapsget-coordinates)
  - [Get Distance & Time](#mapsget-distance-time)
  - [Get Suggestions](#mapsget-suggestions)
- [Rides Endpoints](#rides-endpoints)
  - [Create Ride](#ridescreate)
  - [Get Fare](#ridesget-fare-endpoint)
  - [Ride lifecycle](#ride-lifecycle)
- [Captain dashboard](#captain-dashboard)
- [WebSocket Events](#websocket-events)

---

## User Endpoints

## `/users/register`

### Description

Registers a new user by creating a user account with the provided information.

### HTTP Method

`POST`

### Request Body

The request body should be in JSON format and include the following fields:

- `fullname` (object):
  - `firstname` (string, required): User's first name (minimum 3 characters).
  - `lastname` (string, optional): User's last name (minimum 3 characters).
- `email` (string, required): User's email address (must be a valid email).
- `password` (string, required): User's password (minimum 6 characters).

### Example Request

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

### Example Response

**Success Response (201 Created):**

```json
{
  "user": {
    "_id": "60d0fe4f5311236168a109ca",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**400 Bad Request - User already exists:**
```json
{
  "message": "User already exists"
}
```

## `/users/login` Endpoint

### Description

Authenticates a user using their email and password, returning a JWT token upon successful login.

### HTTP Method

`POST`

### Endpoint

`/users/login`

### Request Body

The request body should be in JSON format and include the following fields:

- `email` (string, required): User's email address (must be a valid email).
- `password` (string, required): User's password (minimum 6 characters).

### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

### Example Response

**Success Response (200 OK):**

```json
{
  "user": {
    "_id": "60d0fe4f5311236168a109ca",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid email or password"
}
```

## `/users/profile` Endpoint

### Description

Retrieves the profile information of the currently authenticated user.

### HTTP Method

`GET`

### Authentication

Requires a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

### Example Response

**Success Response (200 OK):**

```json
{
  "user": {
    "_id": "60d0fe4f5311236168a109ca",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "message": "User not found"
}
```



## `/users/logout` Endpoint

### Description

Logout the current user and blacklist the token provided in cookie or headers.

### HTTP Method

`GET`

### Authentication

Requires a valid JWT token in the Authorization header or cookie:
`Authorization: Bearer <token>`

### Example Response

**Success Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

---

## Captain Endpoints

## `/captains/register`

### Description

Registers a new captain by creating a captain account with the provided information.

### HTTP Method

`POST`

### Request Body

The request body should be in JSON format and include the following fields:

- `fullname` (object):
  - `firstname` (string, required): Captain's first name (minimum 3 characters).
  - `lastname` (string, optional): Captain's last name (minimum 3 characters).
- `email` (string, required): Captain's email address (must be a valid email).
- `password` (string, required): Captain's password (minimum 6 characters).
- `vehicle` (object):
  - `color` (string, required): Vehicle color (minimum 3 characters).
  - `plate` (string, required): Vehicle plate number (minimum 3 characters).
  - `capacity` (number, required): Vehicle passenger capacity (minimum 1).
  - `vehicleType` (string, required): Type of vehicle (must be 'car', 'motorcycle', or 'auto').

### Example Request

```json
{
  "fullname": {
    "firstname": "Mike",
    "lastname": "Smith"
  },
  "email": "mike.smith@example.com",
  "password": "securepassword123",
  "vehicle": {
    "color": "Blue",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

### Example Response

**Success Response (201 Created):**

```json
{
  "captain": {
    "_id": "60d0fe4f5311236168a109cb",
    "fullname": {
      "firstname": "Mike",
      "lastname": "Smith"
    },
    "email": "mike.smith@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**400 Bad Request - Captain already exists:**
```json
{
  "message": "Captain already exists"
}
```

## `/captains/login` Endpoint

### Description

Authenticates a captain using their email and password, returning a JWT token upon successful login.

### HTTP Method

`POST`

### Endpoint

`/captains/login`

### Request Body

The request body should be in JSON format and include the following fields:

- `email` (string, required): Captain's email address (must be a valid email).
- `password` (string, required): Captain's password (minimum 6 characters).

### Example Request

```json
{
  "email": "mike.smith@example.com",
  "password": "securepassword123"
}
```

### Example Response

**Success Response (200 OK):**

```json
{
  "captain": {
    "_id": "60d0fe4f5311236168a109cb",
    "fullname": {
      "firstname": "Mike",
      "lastname": "Smith"
    },
    "email": "mike.smith@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid email or password"
}
```

## `/captains/profile` Endpoint

### Description

Retrieves the profile information of the currently authenticated captain.

### HTTP Method

`GET`

### Authentication

Requires a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

### Example Response

**Success Response (200 OK):**

```json
{
  "captain": {
    "_id": "60d0fe4f5311236168a109cb",
    "fullname": {
      "firstname": "Mike",
      "lastname": "Smith"
    },
    "email": "mike.smith@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "message": "Captain not found"
}
```

## `/captains/logout` Endpoint

### Description

Logout the current captain and blacklist the token provided in cookie or headers.

### HTTP Method

`GET`

### Authentication

Requires a valid JWT token in the Authorization header or cookie:
`Authorization: Bearer <token>`

### Example Response

**Success Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

---

## Maps Endpoints

## `/maps/get-coordinates`

### Description

Retrieves the coordinates (latitude and longitude) for a given address.

### HTTP Method

`GET`

### Request Parameters

- `address` (string, required): The address for which to retrieve coordinates.

### Example Request

```
GET /maps/get-coordinates?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA
```

### Example Response

**Success Response (200 OK):**

```json
{
  "ltd": 37.4224764,
  "lng": -122.0842499
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "message": "Address is required"
}
```

**404 Not Found:**
```json
{
  "message": "Coordinates not found"
}
```

## `/maps/get-distance-time` Endpoint

### Description

Retrieves the distance and estimated travel time between two locations.

### HTTP Method

`GET`

### Request Parameters

- `origin` (string, required): The starting address or location.
- `destination` (string, required): The destination address or location.

### Example Request

```
GET /maps/get-distance-time?origin=New+York,NY&destination=Los+Angeles,CA
```

### Example Response

**Success Response (200 OK):**

```json
{
  "distance": {
    "text": "2,789 miles",
    "value": 4486540
  },
  "duration": {
    "text": "1 day 18 hours",
    "value": 154800
  }
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "message": "Origin and destination are required"
}
```

**404 Not Found:**
```json
{
  "message": "No routes found"
}
```

## `/maps/get-suggestions` Endpoint

### Description

Retrieves autocomplete suggestions for a given input string.

### HTTP Method

`GET`

### Request Parameters

- `input` (string, required): The input string for which to retrieve suggestions.

### Example Request

```
GET /maps/get-suggestions?input=1600+Amphitheatre
```

### Example Response

**Success Response (200 OK):**

```json
[
  "1600 Amphitheatre Parkway, Mountain View, CA, USA",
  "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA"
]
```

### Error Responses

**400 Bad Request:**
```json
{
  "message": "Input parameter is required"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Unable to fetch suggestions"
}
```

---

## Rides Endpoints

## `/rides/create`

### Description

Creates a new ride with the provided information.

### HTTP Method

`POST`

### Authentication

Requires a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

### Request Body

The request body should be in JSON format and include the following fields:

- `pickup` (string, required): The pickup address (minimum 3 characters).
- `destination` (string, required): The destination address (minimum 3 characters).
- `vehicleType` (string, required): The type of vehicle (must be 'auto', 'car', or 'moto').

### Example Request

```json
{
  "pickup": "1600 Amphitheatre Parkway, Mountain View, CA",
  "destination": "1 Infinite Loop, Cupertino, CA",
  "vehicleType": "car"
}
```

### Example Response

**Success Response (201 Created):**

```json
{
  "ride": {
    "_id": "60d0fe4f5311236168a109cc",
    "user": "60d0fe4f5311236168a109ca",
    "pickup": "1600 Amphitheatre Parkway, Mountain View, CA",
    "destination": "1 Infinite Loop, Cupertino, CA",
    "fare": 45.50,
    "status": "pending",
    "duration": 3600,
    "distance": 15000,
    "vehicleType": "car",
    "otp": "123456",
    "createdAt": "2023-06-30T10:00:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "errors": [
    {
      "msg": "Pickup address must be at least 3 characters long",
      "param": "pickup",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to create ride"
}
```


## `/rides/get-fare` Endpoint

### Description

Retrieves the fare estimate for a ride between the provided pickup and destination addresses.

### HTTP Method

`GET`

### Authentication

Requires a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

### Request Parameters

- `pickup` (string, required): The pickup address (minimum 3 characters).
- `destination` (string, required): The destination address (minimum 3 characters).

### Example Request

```
GET /rides/get-fare?pickup=1600+Amphitheatre+Parkway,+Mountain+View,+CA&destination=1+Infinite+Loop,+Cupertino,+CA
```

### Example Response

**Success Response (200 OK):**

```json
{
  "fares": { "auto": 72, "car": 113, "moto": 50 },
  "distance": { "text": "4.21 km", "value": 4210 },
  "duration": { "text": "6 min", "value": 372 },
  "polyline": [[28.6317, 77.2193], [28.6315, 77.2196]]
}
```

`polyline` is a list of `[lat, lng]` points, ready for Leaflet.

### Error Responses

**400 Bad Request:**
```json
{ "message": "Pickup location is required", "errors": [ { "msg": "...", "path": "pickup", "location": "query" } ] }
```

**401 Unauthorized:**
```json
{ "message": "Authentication required" }
```

**502 Bad Gateway:**
```json
{ "message": "Could not find a route between these locations" }
```

---

## Ride lifecycle

```
pending ──accept──▶ accepted ──OTP──▶ on-going ──end──▶ completed
   │                   │
   └──cancel/timeout───┴──cancel──▶ canceled
```

A pending request that no captain accepts within **90 seconds** is canceled automatically (`cancelledBy: "system"`).

| Method & path | Who | Body / query | Result |
|---|---|---|---|
| `POST /rides/create` | user | `{ pickup, destination, vehicleType: "car" \| "auto" \| "moto" }` | `201` ride (no OTP). `409` if the user already has an active ride. Nearby online captains with that vehicle type (within 5 km) get a `new-ride` event. |
| `POST /rides/confirm` | captain | `{ rideId }` | Ride with user and captain populated. Atomic, so only the first captain wins; others get `409`. |
| `POST /rides/start` | captain | `{ rideId, otp }` | Ride becomes `on-going`. `400 Invalid OTP` on a mismatch. Rate limited to 10 per 5 minutes. |
| `POST /rides/end` | captain | `{ rideId }` | Ride becomes `completed`. |
| `POST /rides/cancel` | user or captain | `{ rideId, reason? }` | A user can cancel `pending`/`accepted` rides; a captain can cancel `accepted` rides. |
| `POST /rides/rate` | user | `{ rideId, score: 1-5, comment? }` | Rates a completed ride once and updates the captain's average. |
| `GET /rides/active` | user or captain | - | `{ ride }` or `{ ride: null }`. The OTP is included only for the user. |
| `GET /rides/history` | user or captain | `?page=1&limit=10` | `{ rides, page, total, pages }`, newest first. |

## Captain dashboard

| Method & path | Body | Result |
|---|---|---|
| `GET /captains/stats` | - | `{ today: { earnings, rides }, total: { earnings, rides, distanceKm }, rating: { average, count }, status }` |
| `PATCH /captains/status` | `{ status: "active" \| "inactive" }` | `{ captain }`. Only `active` captains receive ride requests. |

---

## WebSocket Events

Real-time ride updates and live captain location use Socket.IO on the same base URL.

### Connection

The connection must carry the same JWT used for HTTP requests. Connections without a valid token are rejected.

```javascript
const socket = io('http://localhost:3000', { auth: { token } });
```

The server puts each socket in a private room (`user:<id>` or `captain:<id>`) based on the token, so clients never send their own ID.

### Client → server

| Event | Who | Payload |
|---|---|---|
| `update-location-captain` | captain | `{ location: { ltd, lng } }`. Saved as a GeoJSON point and forwarded to the rider during an active ride. |
| `join` | anyone | Ignored (kept for older clients). |

### Server → client

| Event | Sent to | Payload |
|---|---|---|
| `new-ride` | nearby captains | Ride with user populated (no OTP) |
| `ride-unavailable` | captains who saw a request | `{ rideId }`: another captain took it, or it was canceled or timed out |
| `ride-confirmed` | user | Ride with captain populated, **including the OTP** |
| `ride-started` | user | Ride |
| `ride-ended` | user | Ride |
| `ride-canceled` | the other party | `{ rideId, by: "user" \| "captain" }` |
| `ride-timeout` | user | `{ rideId }`: no captain accepted within 90 s |
| `captain-location` | user | `{ rideId, lat, lng }` |

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data or wrong OTP
- `401 Unauthorized` - Missing, invalid, expired or logged-out token
- `403 Forbidden` - The ride belongs to someone else
- `404 Not Found` - Resource not found
- `409 Conflict` - Ride state does not allow this action, or a duplicate account
- `429 Too Many Requests` - Rate limit hit
- `502 Bad Gateway` - The map provider could not find a route
- `500 Internal Server Error` - Unexpected server error

---

## Rate Limiting

- Login and register (users and captains): 20 requests per 15 minutes per IP
- `POST /rides/start` (OTP check): 10 requests per 5 minutes per IP

Limited responses return `429` with `{ "message": "..." }` and standard `RateLimit` headers.

---

## Support

For any issues or questions about the API, please contact the development team.
