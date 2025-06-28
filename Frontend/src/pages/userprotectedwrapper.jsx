import React, { useContext, useEffect } from 'react';
import { UserDataContext } from '../Context/Usercontext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProtectedWrapper = ({ children }) => {
  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
    axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if(response.status === 200) {
          setUser(response.data.user);
          setLoading(false);
        }
       
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        localStorage.removeItem("token");
        navigate('/login');
      });
  }, [token]);
  if(loading) {
    return <div>Loading...</div>; // Show a loading state while fetching user data
  }

  // Optionally, prevent rendering if not authenticated
  if (!token) return null;

  return <>{children}</>;
};

export default UserProtectedWrapper;
