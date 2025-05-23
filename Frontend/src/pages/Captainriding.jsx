import React from 'react';
import { Link } from 'react-router-dom';
import Finishride from '../Components/Finishride';
import gsap from 'gsap';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react'
const Captainriding = () => {
    const [finisridepanel, setfinishridepanel] = useState(false);
    const Finishridepopupref = useRef(null);

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
    <div className="h-screen flex flex-col bg-white">
      {/* Top Section */}
      <div className="relative h-[80%] w-full overflow-hidden">
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

        {/* Background Image */}
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Uber ride"
        />
      </div>

      {/* Bottom Panel */}
    <div className="bg-gray-100 rounded-t-3xl w-full h-[20%] p-4 shadow-inner flex flex-col" onClick={()=>{
        setfinishridepanel(!finisridepanel);
    }}>
        {/* Arrow at the top */}
        <div className="flex justify-center text-gray-400 text-2xl mb-2">
            <i className="ri-arrow-up-wide-fill"></i>
        </div>

        {/* Centered row: Distance + Button */}
        <div className="flex flex-1 items-center justify-between rounded-xl px-4">
            <h4 className="text-lg font-semibold text-Black">4 KM away</h4>
            <button className="bg-white text-black text-md font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-gray-200 transition">
            Complete Ride
            </button>
        </div>
    </div>

    <div ref={Finishridepopupref}  className="fixed z-10 bottom-0 w-full h-screen bg-white p-5 rounded-lg shadow-lg">
        <Finishride setfinishridepanel={setfinishridepanel} />
    </div>

    </div>
  );
};

export default Captainriding;
