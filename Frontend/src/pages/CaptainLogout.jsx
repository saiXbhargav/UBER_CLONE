import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../Context/SocketContext';
import { CaptainDataContext } from '../Context/CaptainContext';
import { api } from '../lib/api';
import { clearToken } from '../lib/auth';
import { FullPageLoader } from '../Components/common/Spinner';

const CaptainLogout = () => {
  const navigate = useNavigate();
  const { disconnectSocket } = useContext(SocketContext);
  const { setCaptain } = useContext(CaptainDataContext);

  useEffect(() => {
    api('captain')
      .get('/captains/logout')
      .catch(() => {})
      .finally(() => {
        clearToken('captain');
        setCaptain(null);
        disconnectSocket();
        navigate('/captain-login', { replace: true });
      });
  }, [navigate, disconnectSocket, setCaptain]);

  return <FullPageLoader label="Signing you out…" />;
};

export default CaptainLogout;
