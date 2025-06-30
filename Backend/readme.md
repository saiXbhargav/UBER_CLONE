# UBER Backend API Documentation

## Overview

This document provides comprehensive documentation for the UBER Backend API. The API allows users and captains to register, authenticate, manage profiles, create rides, and interact with mapping services.

## Base URL

```
http://localhost:3000
```

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
  - [Get Fare](#ridesget-fare)

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
  "auto": 30.50,
  "car": 45.75,
  "moto": 25.00
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
      "location": "query"
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
  "message": "Failed to calculate fare"
}
```

---

## WebSocket Events

This API also supports real-time communication through WebSocket connections for live updates on rides and location tracking.

### Connection

Connect to the WebSocket server at the same base URL:

```javascript
const socket = io('http://localhost:3000');
```

### Events

#### `join`
Join a room with user/captain identification.

**Payload:**
```json
{
  "userId": "60d0fe4f5311236168a109ca",
  "userType": "user" // or "captain"
}
```

#### `update-location-captain`
Update captain's real-time location.

**Payload:**
```json
{
  "userId": "60d0fe4f5311236168a109cb",
  "location": {
    "ltd": 37.4224764,
    "lng": -122.0842499
  }
}
```

---

## Status Codes

The API uses the following HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

The API may implement rate limiting. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

---

## Support

For any issues or questions about the API, please contact the development team.
