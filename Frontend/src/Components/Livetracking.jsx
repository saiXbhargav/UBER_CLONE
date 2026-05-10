// import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix Leaflet default marker icon path issues
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });


// const containerStyle = {
//   width: '100%',
//   height: '100%',
// };

// const center = {
//   lat: -3.745,
//   lng: -38.523,
// };

// const Livetracking = () => {
//   const [currentPosition, setCurrentPosition] = useState(center);

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition((position) => {
//       const { latitude, longitude } = position.coords;
//       setCurrentPosition({
//         lat: latitude,
//         lng: longitude,
//       });
//     });

//     const watchId = navigator.geolocation.watchPosition((position) => {
//       const { latitude, longitude } = position.coords;
//       setCurrentPosition({
//         lat: latitude,
//         lng: longitude,
//       });
//     });

//     return () => navigator.geolocation.clearWatch(watchId);
//   }, []);

//   useEffect(() => {
//     const updatePosition = () => {
//       navigator.geolocation.getCurrentPosition((position) => {
//         const { latitude, longitude } = position.coords;
//         console.log('Position updated:', latitude, longitude);
//         setCurrentPosition({
//           lat: latitude,
//           lng: longitude,
//         });
//       });
//     };

//     updatePosition(); // Initial position update
//     const intervalId = setInterval(updatePosition, 1000); // Update every second

//     return () => clearInterval(intervalId);
//   }, []);

//   return (
//     <div style={containerStyle}>
//       <MapContainer
//         center={currentPosition}
//         zoom={15}
//         style={{ height: '100%', width: '100%' }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // using OpenStreetMap (ORS doesn’t host tiles)
//           attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//         />
//         <Marker position={currentPosition}>
//           <Popup>You are here</Popup>
//         </Marker>
//       </MapContainer>
//     </div>
//   );
// };

// export default Livetracking;


import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon path issues
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Optional: component to center the map dynamically
const RecenterMap = ({ lat, lng, routePolyline }) => {
  const map = useMap();
  useEffect(() => {
    if (routePolyline && routePolyline.length > 0) {
      const bounds = L.latLngBounds(routePolyline);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([lat, lng]);
    }
  }, [lat, lng, routePolyline, map]);
  return null;
};

const center = {
  lat: 28.6139,
  lng: 77.2090,
};

const pickupIcon = L.divIcon({
  html: '<i class="ri-map-pin-user-fill" style="color: #10b981; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.4);"></i>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const destinationIcon = L.divIcon({
  html: '<i class="ri-map-pin-2-fill" style="color: #ef4444; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.4);"></i>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const Livetracking = ({ routePolyline }) => {
  const [currentPosition, setCurrentPosition] = useState(center);

  useEffect(() => {
    const success = (position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success);
      const watchId = navigator.geolocation.watchPosition(success);
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={currentPosition}
        zoom={15}
        scrollWheelZoom
        style={{ height: '100vh', width: '100vw' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Only show current position marker if there is no active route */}
        {(!routePolyline || routePolyline.length === 0) && (
          <Marker position={currentPosition}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Show route polyline and custom pickup/destination markers when route is active */}
        {routePolyline && routePolyline.length > 0 && (
          <>
            <Polyline positions={routePolyline} color="#111827" weight={6} opacity={0.8} />
            <Marker position={routePolyline[0]} icon={pickupIcon}>
              <Popup>Pickup Location</Popup>
            </Marker>
            <Marker position={routePolyline[routePolyline.length - 1]} icon={destinationIcon}>
              <Popup>Destination</Popup>
            </Marker>
          </>
        )}
        <RecenterMap lat={currentPosition.lat} lng={currentPosition.lng} routePolyline={routePolyline} />
      </MapContainer>
    </div>
  );
};

export default Livetracking;
