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
const Captainhome = () => {
  const [ridepopuppanel, setridepopuppanel] = useState(true);
  const Ridepopupref = useRef(null);
  const [confirmridepopuppanel, setconfirmridepopuppanel] = useState(false);
  const ConfirmRidepopupref = useRef(null);
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
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Uber"
        />
      </div>
      <div>
        <CaptainDetails />
      </div>
      <div ref={Ridepopupref}  className="fixed z-10 bottom-0 w-full  bg-white p-5 rounded-lg shadow-lg">
        <Ridepopup setridepopuppanel={setridepopuppanel} setconfirmridepopuppanel={setconfirmridepopuppanel}/>
      </div>
      <div ref={ConfirmRidepopupref}  className="fixed z-10 bottom-0 w-full h-screen bg-white p-5 rounded-lg shadow-lg">
        <ConfirmRidepopup setconfirmridepopuppanel={setconfirmridepopuppanel} setridepopuppanel={setridepopuppanel} />
      </div>
    </div>
  )
}

export default Captainhome
