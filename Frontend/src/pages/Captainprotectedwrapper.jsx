import React, { useContext, useEffect, useState } from 'react';
import { CaptainDataContext } from '../Context/CaptainContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CaptainProtectedWrapper = ({ children }) => {
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("captainToken");

  useEffect(() => {
    if (!token) {
      navigate('/captain-login');
      return;
    }

    const fetchCaptainProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.status === 200) {
          setCaptain(res.data.captain);
        } else {
          throw new Error("Unauthorized");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("captainToken");
        navigate('/captain-login');
      } finally {
        setLoading(false);
      }
    };

    fetchCaptainProfile();
  }, [token, navigate, setCaptain]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default CaptainProtectedWrapper;
