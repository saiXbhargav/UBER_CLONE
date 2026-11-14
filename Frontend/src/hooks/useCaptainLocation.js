import { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../Context/SocketContext';

const SEND_EVERY_MS = 5000;

/**
 * Watches the driver's GPS position and, while `broadcast` is true, sends it to the
 * server at most every 5s. The server forwards it to the rider on an active trip.
 */
const useCaptainLocation = (broadcast) => {
  const { socket } = useContext(SocketContext);
  const [position, setPosition] = useState(null);
  const lastSent = useRef(0);
  const broadcastRef = useRef(broadcast);
  broadcastRef.current = broadcast;

  useEffect(() => {
    if (!navigator.geolocation) return undefined;

    const send = (pos, force = false) => {
      if (!broadcastRef.current || !pos) return;
      const now = Date.now();
      if (!force && now - lastSent.current < SEND_EVERY_MS) return;
      lastSent.current = now;
      socket.emit('update-location-captain', { location: { ltd: pos.lat, lng: pos.lng } });
    };

    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPosition(pos);
        send(pos);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    // Heartbeat: stationary drivers don't trigger watchPosition, but should still be findable.
    const heartbeat = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (p) => send({ lat: p.coords.latitude, lng: p.coords.longitude }, true),
        () => {},
        { maximumAge: 15000 }
      );
    }, 20000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(heartbeat);
    };
  }, [socket]);

  // Push the latest fix immediately when going online.
  useEffect(() => {
    if (broadcast && position) {
      lastSent.current = Date.now();
      socket.emit('update-location-captain', { location: { ltd: position.lat, lng: position.lng } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcast, socket]);

  return position;
};

export default useCaptainLocation;
