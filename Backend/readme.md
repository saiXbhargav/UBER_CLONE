# /register Endpoint

**Description:**  
Creates a new user by providing necessary user details.

**Method:**  
POST

**Request Body:**  
- `firstname` (required)  
- `lastname` (optional)  
- `email` (required)  
- `password` (required)

**Response Codes:**  
- **201**: User created successfully  
- **400**: Missing or invalid fields  
- **500**: Internal server error