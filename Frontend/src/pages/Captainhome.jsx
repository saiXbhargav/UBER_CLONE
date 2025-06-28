import React from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../Components/CaptainDetails'
import 'remixicon/fonts/remixicon.css'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { useState } from 'react'
import Ridepopup from '../Components/Ridepopup'
import ConfirmRidepopup from '../Components/Confirmridepopup'
import { SocketContext } from '../Context/SocketContext'
import { CaptainDataContext } from '../Context/CaptainContext'
import { useContext } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import Livetracking from '../Components/Livetracking'
const Captainhome = () => {
  const [ridepopuppanel, setridepopuppanel] = useState(false);
  const Ridepopupref = useRef(null);
  const [confirmridepopuppanel, setconfirmridepopuppanel] = useState(false);
  const ConfirmRidepopupref = useRef(null);
  const { socket } = useContext(SocketContext)
  const { captain, setCaptain } = useContext(CaptainDataContext)
  const [ride, setRide] = useState(null);
  // const [confirmride, setconfirmride] = useState(null);
  async function confirmride() {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
      {
        rideId: ride._id,
        captainId: captain._id
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("captainToken")}`,
        }
      }
    );

    console.log("Ride confirmed:", response.data);
    // Optionally show success toast or update UI here

  } catch (error) {
    console.error("Error confirming ride:", error.response?.data || error.message);
    // Optionally show error message or handle error in UI
  }
}


  useEffect(() => {
    if (captain && captain._id) {
      console.log("Emitting join with captain:", captain._id);
      socket.emit("join", { userType: "captain", userId: captain._id });
    } else {
      console.log("Captain not ready yet:", captain);
    }



  const updateLocation = () => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          ltd: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // console.log("Sending location update:", location);
        console.log("Captain ID:", captain._id , "Location:", location);
        socket.emit("update-location-captain", { userId: captain._id, location });
      });
    }
  };
  const locationInterval = setInterval(updateLocation, 10000); // Update every 10 seconds
  updateLocation(); // Initial location update
  // return () => clearInterval(locationInterval); // Cleanup interval on unmount
  socket.on('new-ride', (data) => {
    console.log("New ride request received:", data);
    setRide(data);
    setridepopuppanel(true);
    // setconfirmridepopuppanel(false);
  });
  
  },[captain?._id] );

  useGSAP(function () {
    if (ridepopuppanel) {
      gsap.to(Ridepopupref.current, {
        transform: "translateY(0%)",
        duration: 1,
      })
    }
    else {
      gsap.to(Ridepopupref.current, {
        transform: "translateY(100%)",
        duration: 1,
      })
    }
  }, [ridepopuppanel])
  useGSAP(function () {
    if (confirmridepopuppanel) {
      gsap.to(ConfirmRidepopupref.current, {
        transform: "translateY(0%)",
        duration: 1,
      })
    }
    else {
      gsap.to(ConfirmRidepopupref.current, {
        transform: "translateY(100%)",
        duration: 1,
      })
    }
  }, [confirmridepopuppanel])
  return (
    <div className="h-screen flex flex-col items-center">
      {/* Top Section */}
      <div className="relative h-1/2 w-full overflow-hidden">
        {/* Home Button */}
       <div >
        <img className='w-16 absolute left-5 top-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber"  />
        <Link to="/captain/logout" className="absolute top-5 right-5 z-10 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <i className="ri-logout-circle-line"></i>
        </Link>
       </div>

        {/* Background Image */}
        {/* <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Uber"
        /> */}
        <Livetracking />
      </div>
      <div>
        <CaptainDetails />
      </div>
      <div ref={Ridepopupref}  className="fixed z-10 bottom-0 w-full  bg-white p-5 rounded-lg shadow-lg">
        <Ridepopup ride={ride} setridepopuppanel={setridepopuppanel} setconfirmridepopuppanel={setconfirmridepopuppanel} confirmride={confirmride} />
      </div>
      <div ref={ConfirmRidepopupref}  className="fixed z-10 bottom-0 w-full h-screen bg-white p-5 rounded-lg shadow-lg">
        <ConfirmRidepopup ride={ride} setconfirmridepopuppanel={setconfirmridepopuppanel} setridepopuppanel={setridepopuppanel} />
      </div>
    </div>
  )
}

export default Captainhome
