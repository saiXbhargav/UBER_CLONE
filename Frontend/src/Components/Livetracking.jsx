import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DEFAULT_CENTER = [28.6139, 77.209]; // New Delhi, used until the browser shares a location

const dotIcon = (bg, ring) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${bg};border:3px solid #fff;box-shadow:0 0 0 6px ${ring},0 2px 6px rgba(0,0,0,.35)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const pinIcon = (shape) =>
  L.divIcon({
    className: '',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:#111;border:3px solid #fff;border-radius:${
      shape === 'square' ? '6px' : '9999px'
    };box-shadow:0 2px 8px rgba(0,0,0,.4)"><span style="width:8px;height:8px;background:#fff;border-radius:${shape === 'square' ? '1px' : '9999px'}"></span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const ICONS = {
  me: dotIcon('#2563eb', 'rgba(37,99,235,.2)'),
  pickup: pinIcon('circle'),
  destination: pinIcon('square'),
  driver: L.divIcon({
    className: '',
    html: '<span style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9999px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.35)"><i class="ri-taxi-fill" style="font-size:22px;color:#111"></i></span>',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  }),
};

/** Keeps the map sized to its container and frames the route / position. */
const MapController = ({ me, route, driver }) => {
  const map = useMap();
  const centeredOnce = useRef(false);

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    if (route?.length) {
      const points = driver ? [...route, [driver.lat, driver.lng]] : route;
      map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 16 });
    }
    // driver is intentionally excluded: re-framing on every GPS tick makes the map jumpy
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, map]);

  useEffect(() => {
    if (!route?.length && me && !centeredOnce.current) {
      map.setView([me.lat, me.lng], 15);
      centeredOnce.current = true;
    }
  }, [me, route, map]);

  return null;
};

/**
 * Map with the viewer's live position, an optional route and an optional live driver marker.
 * routePolyline: [[lat, lng], ...]   driverPosition: { lat, lng }
 */
const Livetracking = ({ routePolyline, driverPosition, showMe = true, routeLabels = ['Pickup', 'Drop-off'] }) => {
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return undefined;
    const onPos = (p) => setMe({ lat: p.coords.latitude, lng: p.coords.longitude });
    const watchId = navigator.geolocation.watchPosition(onPos, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 10000,
    });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const hasRoute = Array.isArray(routePolyline) && routePolyline.length > 1;

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={13}
      zoomControl={false}
      scrollWheelZoom
      className="h-full w-full"
    >
      {/* OpenStreetMap standard tiles: free, no API key; attribution is required */}
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {showMe && me && (
        <Marker position={[me.lat, me.lng]} icon={ICONS.me}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {hasRoute && (
        <>
          <Polyline positions={routePolyline} pathOptions={{ color: '#111', weight: 5, opacity: 0.85 }} />
          {routeLabels[0] && (
            <Marker position={routePolyline[0]} icon={ICONS.pickup}>
              <Popup>{routeLabels[0]}</Popup>
            </Marker>
          )}
          <Marker position={routePolyline[routePolyline.length - 1]} icon={ICONS.destination}>
            <Popup>{routeLabels[1]}</Popup>
          </Marker>
        </>
      )}

      {driverPosition && (
        <Marker position={[driverPosition.lat, driverPosition.lng]} icon={ICONS.driver}>
          <Popup>Your driver</Popup>
        </Marker>
      )}

      <MapController me={me} route={hasRoute ? routePolyline : null} driver={driverPosition} />
    </MapContainer>
  );
};

export default Livetracking;
