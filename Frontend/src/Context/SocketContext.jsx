import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../lib/auth';

export const SocketContext = createContext();

// One shared connection. It only connects after a protected page has a valid token,
// and the server verifies that token during the handshake.
const socket = io(import.meta.env.VITE_BASE_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

const SocketProvider = ({ children }) => {
  const connectSocket = useCallback((role) => {
    const token = getToken(role);
    if (!token) return;
    if (socket.auth?.token === token && (socket.connected || socket.active)) return;
    if (socket.connected || socket.active) socket.disconnect();
    socket.auth = { token };
    socket.connect();
  }, []);

  const disconnectSocket = useCallback(() => {
    socket.auth = {};
    socket.disconnect();
  }, []);

  useEffect(() => {
    const onError = (err) => console.warn('Socket connection failed:', err.message);
    socket.on('connect_error', onError);
    return () => socket.off('connect_error', onError);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

/** Subscribe to a socket event for the lifetime of the component. */
export const useSocketEvent = (event, handler) => {
  const { socket: s } = useContext(SocketContext);
  useEffect(() => {
    s.on(event, handler);
    return () => s.off(event, handler);
  }, [s, event, handler]);
};

export default SocketProvider;
