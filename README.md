# UBER_CLONE

## Table of Contents
- [Project Overview](#project-overview)  
- [Features](#features)  
- [File Structure](#file-structure)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Available Scripts](#available-scripts)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

## Project Overview
A full-stack Uber clone that lets users sign up, book rides, and track drivers in real-time.  
This monorepo contains:
- **Backend** (`/backend`): Node.js + Express API, JWT auth, MongoDB for users/trips.
- **Frontend** (`/frontend`): React app integrating Google Maps for location search, route drawing, and real-time ride status.

It demonstrates:
- User authentication & authorization (JWT)
- Real-time map integration (Google Maps API)
- State management (Redux Toolkit)
- Firestore / MongoDB data persistence
- Ride request, fare estimation, and live tracking

## Features
- User authentication (sign in / sign up)
- Interactive map with marker placement
- Pickup & drop-off location search
- Ride options and fare estimates
- Responsive UI for mobile & desktop

## File Structure
```
c:\bhargav\reactjs\UBER\
│
├─ .gitignore
├─ README.md             # This file
├─ backend\              # API server
│  ├─ server.js          # App entry point
│  ├─ routes\            # Express routes
│  ├─ controllers\       # Business logic
│  └─ models\            # Mongoose schemas
└─ frontend\             # React application
   ├─ package.json       # Frontend deps & scripts
   ├─ public\            # Static assets & index.html
   └─ src\               # React source code
      ├─ main.jsx       # App bootstrap
      ├─ App.jsx         # Root component 
      └─ components\     # UI pieces
        
```

## Installation
### Backend
1. `cd backend`  
2. `npm install`  
3. Copy `.env.example → .env` and set:
   ```
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. `npx nodemon server.js`

### Frontend
1. `cd frontend`  
2. `npm install`  
3. Create `.env` with:
   ```
   ```env
   ORS_MAPS_API=your_key
   JWT_SECRET=your_jwt_secret
   DB_CONNECT=your_mongodb_uri
   PORT=your_port_number
   ```
   ```
4. `npm run dev`

## Usage
- **Terminal 1**: in `backend/` run `npx nodemon server.js`  
- **Terminal 2**: in `frontend/` run `npm run dev`  
- Open `http://localhost:3000`  
- Sign up or log in, enter pickup/drop-off, choose ride and track it live!

## Available Scripts
In the project directory, run:
- `npm start`  
- `npm run build`  
- `npm test`

## Contributing
1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/YourFeature`)  
3. Commit your changes (`git commit -m 'Add YourFeature'`)  
4. Push to the branch (`git push origin feature/YourFeature`)  
5. Open a Pull Request

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
Project Maintainer – [asvnbhargav@gmail.com]  
Repository – https://github.com/saiXbhargav/UBER_CLONE
