import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Confirmridepopup = (props) => {
    const [Otp,setoptp]=useState("");
    const navigate= useNavigate();
    const submithandler =async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/start-ride`, {
  params: {
    rideId: props.ride._id,
    otp: Otp
  },
  headers: {
    Authorization: `Bearer ${localStorage.getItem('captainToken')}`
  }
});

        console.log("Response:", response);
        if (response.status === 200) {
            console.log("Ride started successfully");
            props.setconfirmridepopuppanel(false);
            props.setridepopuppanel(false);
            navigate('/captain-riding', { state: { ride: props.ride } });
            // Optionally, you can navigate to a different page or show a success message
        } else {
            console.error("Failed to start ride:", response.data);
            // Optionally, you can show an error message to the user
        }
    }
  return (
    <div className='w-full  px-4 py-6 bg-[#f9f9f9] rounded-t-2xl shadow-lg animate-slide-up'>
      
      {/* Pull down bar */}
      <div className='w-full flex justify-center mb-4'>
        <h5
          onClick={() => {
            
          }}
          className='text-3xl text-gray-400 hover:text-black cursor-pointer transition-all duration-300'
        >
          <i className="ri-arrow-down-wide-fill"></i>
        </h5>
      </div>

      {/* Header */}
      <h3 className='text-2xl font-bold mb-4 text-center text-gray-800'>New Ride Available!</h3>

      {/* User Info */}
      <div className='bg-white rounded-lg px-4 py-3 mb-5 flex items-center justify-between shadow transition-transform duration-300 hover:scale-105'>
        <div className='flex items-center gap-4'>
          <img
            className='w-14 h-14 rounded-full shadow'
            src="https://pngimg.com/d/face_PNG11760.png"
            alt="person-image"
          />
          <h4 className="text-xl font-semibold text-gray-800 capitalize">{props.ride?.user?.fullname?.firstname}</h4>
        </div>
        <div className='text-right'>
          <h2 className='font-bold text-xl text-Black'>₹{props.ride?.fare}</h2>
          <h4 className='text-gray-500 text-sm'>📍 2.2 KM</h4>
        </div>
      </div>

      {/* Ride Details */}
      <div className='space-y-4'>
        <div className='flex items-start gap-4 p-4 bg-white rounded-xl shadow-md'>
          <i className="text-xl text-black ri-map-pin-range-fill"></i>
          <div>
            <h5 className='text-sm font-sans text-gray-500'>Pickup</h5>
            <h4 className='font-semibold text-lg'>562/11-A</h4>
            <p className='text-gray-500'>{props.ride?.pickup}</p>
          </div>
        </div>

        <div className='flex items-start gap-4 p-4 bg-white rounded-xl shadow-md'>
          <i className="text-xl text-gray ri-map-pin-range-line"></i>
          <div>
            <h5 className='text-sm font-sans text-gray-500'>Dropoff</h5>
            <h4 className='font-semibold text-lg'>562/11-A</h4>
            <p className='text-gray-500'>{props.ride?.destination}</p>
          </div>
        </div>
      </div>



      {/* Action Buttons */}
      <div className='flex justify-center mt-6 px-4'>
            <form
                onSubmit={submithandler}
                className='w-full max-w-md flex flex-col gap-4'
            >
                {/* OTP Input */}
                <input onChange={(e) => setoptp(e.target.value)} value={Otp}
                type='number'
                placeholder='Enter OTP'
                className='w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:outline-none focus:border-blue-500'
                />

                {/* Buttons Side-by-Side */}
                <div className='flex gap-4'>
                {/* Cancel Ride Button */}
                <button
                    type='button'
                    onClick={() => {
                    props.setconfirmridepopuppanel(false);
                    props.setridepopuppanel(false);
                    }}
                    className='w-1/2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition duration-300 shadow'
                >
                    Cancel Ride
                </button>

                {/* Confirm Pickup Link */}
                <button
                    className='w-1/2 bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-lg text-center transition duration-300 shadow flex items-center justify-center'
                >
                    Confirm Pickup
                </button>
                </div>
            </form>
        </div>


    </div>
  )
}

export default Confirmridepopup
