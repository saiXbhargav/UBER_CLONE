# 🚗 UBER Clone - Frontend

A modern, responsive UBER clone built with React, Vite, and Tailwind CSS. This application provides a complete ride-sharing experience for both users and captains (drivers) with real-time features.

## 🚀 Features

- **User Authentication**: Login/Signup for both users and captains
- **Real-time Ride Booking**: Book rides with live tracking
- **Interactive Maps**: Powered by Leaflet for location services
- **Protected Routes**: Secure navigation with authentication
- **Responsive Design**: Built with Tailwind CSS
- **Real-time Communication**: Socket.io integration for live updates
- **Smooth Animations**: Enhanced UX with GSAP animations

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 7.6.0
- **Maps**: React Leaflet 5.0.0 & Leaflet 1.9.4
- **HTTP Client**: Axios 1.9.0
- **Real-time**: Socket.io Client 4.8.1
- **Animations**: GSAP 3.13.0
- **Icons**: Remix Icon 4.6.0
- **Linting**: ESLint 9.25.0

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, icons)
│   └── react.svg
├── Components/      # Reusable UI components
│   ├── CaptainDetails.jsx       # Display captain information
│   ├── Confirmride.jsx          # Ride confirmation component
│   ├── Confirmridepopup.jsx     # Popup for ride confirmation
│   ├── Finishride.jsx           # Ride completion component
│   ├── Livetracking.jsx         # Real-time ride tracking
│   ├── Locationsearchpanel.jsx  # Location search interface
│   ├── Lookingfordriver.jsx     # Driver search loading state
│   ├── Ridepopup.jsx            # Ride details popup
│   ├── Vehiclepanel.jsx         # Vehicle selection panel
│   └── Waitingfordeiver.jsx     # Waiting for driver component
├── Context/         # React Context providers
│   ├── CaptainContext.jsx       # Captain state management
│   ├── SocketContext.jsx        # Socket.io connection context
│   └── Usercontext.jsx          # User state management
├── pages/           # Page components (Route components)
│   ├── Captainhome.jsx          # Captain dashboard
│   ├── captainlogin.jsx         # Captain login page
│   ├── CaptainLogout.jsx        # Captain logout handler
│   ├── Captainprotectedwrapper.jsx # Protected routes for captains
│   ├── Captainriding.jsx        # Captain's active ride view
│   ├── captainsignup.jsx        # Captain registration
│   ├── Home.jsx                 # User home/dashboard
│   ├── Riding.jsx               # User's active ride view
│   ├── Start.jsx                # Landing page
│   ├── userlogin.jsx            # User login page
│   ├── UserLogout.jsx           # User logout handler
│   ├── userprotectedwrapper.jsx # Protected routes for users
│   └── usersignup.jsx           # User registration
├── App.jsx          # Main app component with routing
├── main.jsx         # Application entry point
├── App.css          # Global styles
└── index.css        # Base styles and Tailwind imports
```

## 🏗️ Architecture Overview

### Context Providers
- **UserContext**: Manages user authentication state and profile data
- **CaptainContext**: Handles captain-specific state and ride management
- **SocketContext**: Manages real-time WebSocket connections

### Component Organization
- **Pages**: Route-level components that represent different screens
- **Components**: Reusable UI components for specific functionalities
- **Protected Wrappers**: Handle authentication and route protection

### Key Features Implementation
- **Authentication Flow**: Separate login/signup flows for users and captains
- **Ride Management**: Complete ride lifecycle from booking to completion
- **Real-time Updates**: Live tracking and status updates using Socket.io
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the app for production
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview the production build locally

## 🔧 Configuration

The project uses several configuration files:

- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration
- **`eslint.config.js`** - ESLint rules and settings

## 🌟 Key Components

### User Flow Components
- **Vehiclepanel**: Vehicle selection interface
- **Locationsearchpanel**: Location input and search
- **Confirmride**: Ride confirmation and pricing
- **Livetracking**: Real-time ride tracking

### Captain Flow Components
- **CaptainDetails**: Captain profile and stats
- **Ridepopup**: Incoming ride requests
- **Finishride**: Ride completion interface

## 🔐 Authentication & Protection

The app implements route protection through:
- **userprotectedwrapper.jsx**: Protects user-only routes
- **Captainprotectedwrapper.jsx**: Protects captain-only routes

## 🎨 Styling

The project uses Tailwind CSS for styling with:
- Responsive design principles
- Custom color schemes
- Consistent spacing and typography
- Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using React + Vite
