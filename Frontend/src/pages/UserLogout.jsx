import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../Context/SocketContext';
import { UserDataContext } from '../Context/Usercontext';
import { api } from '../lib/api';
import { clearToken } from '../lib/auth';
import { FullPageLoader } from '../Components/common/Spinner';

const UserLogout = () => {
  const navigate = useNavigate();
  const { disconnectSocket } = useContext(SocketContext);
  const { setUser } = useContext(UserDataContext);

  useEffect(() => {
    // Always sign out locally, even if the server call fails.
    api('user')
      .get('/users/logout')
      .catch(() => {})
      .finally(() => {
        clearToken('user');
        setUser(null);
        disconnectSocket();
        navigate('/login', { replace: true });
      });
  }, [navigate, disconnectSocket, setUser]);

  return <FullPageLoader label="Signing you out…" />;
};

export default UserLogout;
