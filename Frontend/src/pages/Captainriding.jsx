import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Finishride from '../Components/Finishride';
import gsap from 'gsap';
import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react'
import Livetracking from '../Components/Livetracking';

const Captainriding = () => {
    const location = useLocation();
    const ride = location.state?.ride || {};
    const [finisridepanel, setfinishridepanel] = useState(false);
    const Finishridepopupref = useRef(null);
    const [routePolyline, setRoutePolyline] = useState(null);

    useEffect(() => {
        if (ride && ride.pickup && ride.destination) {
            import('axios').then((axiosModule) => {
                const axios = axiosModule.default;
                axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`, {
                    params: { origin: ride.pickup, destination: ride.destination },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('captainToken')}`
                    }
                })
                .then(response => {
                    if (response.data && response.data.polyline) {
                        setRoutePolyline(response.data.polyline);
                    }
                })
                .catch(error => {
                    console.error("Error fetching route for captain riding:", error);
                });
            });
        }
    }, [ride]);

    useGSAP(function () {
        if (finisridepanel) {
            gsap.to(Finishridepopupref.current, {
                transform: "translateY(0%)",
                duration: 1,
            })
        }
        else {
            gsap.to(Finishridepopupref.current, {
                transform: "translateY(100%)",
                duration: 1,
            })
        }
    }, [finisridepanel])

  return (
    <div className="h-screen flex flex-col relative bg-white">
      {/* Top Section (Full Screen Map) */}
      <div className="h-screen w-full overflow-hidden absolute top-0 left-0">
        {/* Uber Logo and Logout */}
        <img
          className="w-16 absolute left-5 top-5 z-10 drop-shadow"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber"
        />
        <Link
          to="/captain/logout"
          className="absolute top-5 right-5 z-10 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-200 transition"
        >
          <i className="ri-logout-circle-line text-xl text-gray-700"></i>
        </Link>

        {/* Livetracking Map */}
        <Livetracking routePolyline={routePolyline} />
      </div>

      {/* Bottom Panel (Floating Sheet) */}
      <div className="absolute bottom-0 w-full p-6 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col z-10 animate-slide-up" onClick={()=>{
        setfinishridepanel(!finisridepanel);
      }}>
        {/* Drag Handle */}
        <div className="flex justify-center mb-2">
            <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Centered row: Distance + Button */}
        <div className="flex flex-1 items-center justify-between mt-2">
            <div>
              <h4 className="text-lg font-semibold text-Black">
                {ride.user?.fullname?.firstname}'s Ride
              </h4>
              <p className="text-sm text-black">
                {ride.pickup} - {ride.destination}
              </p>
            </div>
            <button className="bg-white text-black text-md font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-gray-200 transition">
            Complete Ride
            </button>
        </div>
    </div>

    <div ref={Finishridepopupref}  className="fixed z-10 bottom-0 w-full h-screen bg-white p-5 rounded-lg shadow-lg">
        <Finishride ride={ride} setfinishridepanel={setfinishridepanel} />
    </div>

    </div>
  );
};

export default Captainriding;
