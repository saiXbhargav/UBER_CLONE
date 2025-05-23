import React from 'react';
import 'remixicon/fonts/remixicon.css';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
const Ridepopup = (props) => {
    
  return (
    <div className='w-full px-4 py-6 bg-[#f9f9f9] rounded-t-2xl shadow-lg animate-slide-up'>
      
      {/* Pull down bar */}
      <div className='w-full flex justify-center mb-4'>
        <h5
          onClick={() => {
            // props.setconfirmridepanel(false);
            props.setridepopuppanel(false);
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
          <h4 className="text-xl font-semibold text-gray-800">Sarthak</h4>
        </div>
        <div className='text-right'>
          <h2 className='font-bold text-xl text-Black'>₹295.20</h2>
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
            <p className='text-gray-500'>Kankariya Talab, Ahmedabad</p>
          </div>
        </div>

        <div className='flex items-start gap-4 p-4 bg-white rounded-xl shadow-md'>
          <i className="text-xl text-gray ri-map-pin-range-line"></i>
          <div>
            <h5 className='text-sm font-sans text-gray-500'>Dropoff</h5>
            <h4 className='font-semibold text-lg'>562/11-A</h4>
            <p className='text-gray-500'>Kankariya Talab, Ahmedabad</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-between mt-6 gap-4'>
        
        <button
          onClick={() => {
            
            props.setridepopuppanel(false);
          }}
          className='flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition duration-300 shadow'
        >
          Ignore
        </button>
        <button
          onClick={() => {
            props.setridepopuppanel(false);
            props.setconfirmridepopuppanel(true);
          }}
          className='flex-1 bg-black hover:bg-black text-white font-semibold py-2 rounded-lg transition duration-300 shadow'
        >
          Confirm Pickup
        </button>
      </div>
    </div>
  );
};

export default Ridepopup;
