import React from 'react'
import { Link } from 'react-router-dom';

const Start = () => {
  return (
    <div className='bg-cover bg-center bg-[url(https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_768,w_1152/v1730197725/assets/0f/48c7ba-da13-4fdc-b54c-42878042f513/original/Airport-Fall.png)] h-screen pt-10 pl-0 flex justify-between flex-col w-full '>
    <img className='w-16 ml-8' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber"  />
       <div className='bg-white py-2 px-4'>
            <h2 className='text-3xl font-bold pb-3'>Get Started with Uber</h2>
            <Link to='/Login' className='flex items-center justify-center w-full bg-black text-white py-3 rounded mt-5'>Continue</Link>
       </div>
    </div>
  )
}

export default Start
