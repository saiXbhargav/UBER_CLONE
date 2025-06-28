import React from 'react'
import Lookingfordriver from './Lookingfordriver'
const Confirmride = (props) => {
  return (
    <div>
        <div className='flex items-center justify-center'>
          <h5 onClick={()=>{
            props.setconfirmridepanel(false);
          }} className='text-2xl font-semibold text-gray-300'>
            <i className="ri-arrow-down-wide-fill"></i>
          </h5>
        </div>
        <h3  className='text-2xl font-bold mb-3'>Confirm your ride</h3>
        <div className='gap-5 flex flex-col items-center justify-between'>
           <img className='h-25' src="https://mobile-content.uber.com/launch-experience/ride.png"/> 
           <div className='w-full'>
                <div className='flex items-center justify-evenly gap-4 p-2 rounded-t-lg shadow-lg bg-white border border-gray-200 '>
                    <i className="text-lg ri-map-pin-range-fill "></i>
                    <div>
                        <h3 className='text-xl font-semibold p-1'>562/11-A</h3>
                        <p>{props.pickup}</p>
                    </div>
                </div>
                <div className='flex items-center justify-evenly gap-4 p-2 rounded-t-lg shadow-lg bg-white border border-gray-200 '>
                    <i className="ri-map-pin-range-line "></i>
                    <div>
                        <h3 className='text-xl font-semibold p-1'>562/11-A</h3>
                        <p>{props.destination}</p>
                    </div>
                </div>
                <div className="p-2 rounded-t-lg shadow-lg bg-white border border-gray-200 flex items-center">
                  <i className="ri-money-rupee-circle-line ml-3 pl-2"></i>
                  <div className="flex-1 text-center">
                    <h3 className="text-xl font-semibold">₹{props.fare[props.vehicleType]}</h3>
                    <p className="text-gray-700">Cash</p>
                  </div>
                </div>

           </div>
           <button onClick={()=>{
            props.setconfirmridepanel(false);
            props.setvehiclefound(true);
            props.createride();
           }} className='w-full bg-[#000000] text-white font-semibold p-2 rounded-lg'>Confirm Pickup</button>
        </div>
    </div>
  )
}

export default Confirmride
