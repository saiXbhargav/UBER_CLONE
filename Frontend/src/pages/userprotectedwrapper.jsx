import React, { useContext, useEffect } from 'react';
import { UserDatacontext } from '../Context/Usercontext';
import { useNavigate } from 'react-router-dom';

const UserProtectedWrapper = ({ children }) => {
  const { user, setuser } = useContext(UserDatacontext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Optionally, prevent rendering if not authenticated
  if (!token) return null;

  return <>{children}</>;
};

export default UserProtectedWrapper;
