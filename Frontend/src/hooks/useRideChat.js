import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getErrorMessage } from '../lib/api';
import { useSocketEvent } from '../Context/SocketContext';

/**
 * Chat between rider and driver for one ride.
 * Messages are sent over HTTP (validated + persisted) and arrive over the socket.
 */
const useRideChat = (rideId, role) => {
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    setMessages([]);
    setUnread(0);
    if (!rideId) return undefined;
    let cancelled = false;
    api(role)
      .get(`/rides/${rideId}/messages`)
      .then(({ messages: list }) => !cancelled && setMessages(list || []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [rideId, role]);

  useSocketEvent(
    'chat-message',
    useCallback(
      ({ rideId: id, message }) => {
        if (id !== rideId) return;
        setMessages((list) => (list.some((m) => m._id === message._id) ? list : [...list, message]));
        if (message.from !== role) {
          if (!openRef.current) setUnread((n) => n + 1);
          navigator.vibrate?.(80);
        }
      },
      [rideId, role]
    )
  );

  const send = useCallback(
    async (text) => {
      const body = text.trim();
      if (!body || !rideId) return null;
      try {
        const { message } = await api(role).post(`/rides/${rideId}/messages`, { text: body });
        setMessages((list) => (list.some((m) => m._id === message._id) ? list : [...list, message]));
        return null;
      } catch (err) {
        return getErrorMessage(err, 'Message not sent');
      }
    },
    [rideId, role]
  );

  const openChat = useCallback(() => {
    setOpen(true);
    setUnread(0);
  }, []);

  return { messages, send, open, openChat, closeChat: () => setOpen(false), unread };
};

export default useRideChat;
