import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../../Context/Usercontext';
import { CaptainDataContext } from '../../Context/CaptainContext';
import { SocketContext, useSocketEvent } from '../../Context/SocketContext';
import { useToast } from '../../Context/ToastContext';
import { api } from '../../lib/api';
import { clearToken, getToken } from '../../lib/auth';
import { FullPageLoader } from './Spinner';

const CONFIG = {
  user: { profile: '/users/profile', key: 'user', login: '/login' },
  captain: { profile: '/captains/profile', key: 'captain', login: '/captain-login' },
};

/** Verifies the session, loads the profile into context and opens the authenticated socket. */
const ProtectedRoute = ({ role, children }) => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const { setCaptain } = useContext(CaptainDataContext);
  const { connectSocket } = useContext(SocketContext);
  const [ready, setReady] = useState(false);
  const toast = useToast();
  const cfg = CONFIG[role];

  // An admin suspended this driver: the server closes the socket, we sign out locally.
  useSocketEvent(
    'account-suspended',
    useCallback(() => {
      toast.error('Your account has been suspended. Contact support for help.');
      navigate(role === 'captain' ? '/captain/logout' : '/user/logout', { replace: true });
    }, [toast, navigate, role])
  );

  useEffect(() => {
    let cancelled = false;
    if (!getToken(role)) {
      navigate(cfg.login, { replace: true });
      return undefined;
    }
    api(role)
      .get(cfg.profile)
      .then((data) => {
        if (cancelled) return;
        (role === 'captain' ? setCaptain : setUser)(data[cfg.key]);
        connectSocket(role);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearToken(role);
        navigate(cfg.login, { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [role, cfg, navigate, setUser, setCaptain, connectSocket]);

  if (!ready) return <FullPageLoader />;
  return children;
};

export default ProtectedRoute;
