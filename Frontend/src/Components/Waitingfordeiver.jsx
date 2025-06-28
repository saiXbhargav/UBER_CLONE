import React from 'react'

const Waitingfordeiver = (props) => {
  return (
    <div>
        <div className='flex items-center justify-center'>
          <h5 className='text-2xl font-semibold text-gray-300'>
            <i className="ri-arrow-down-wide-fill"></i>
          </h5>
        </div>
        <div className='flex items-center justify-between'>
           <img className='h-20' src="https://mobile-content.uber.com/launch-experience/ride.png"/>
           <div>
                <h2 className='text-2xl font-semibold '>{props.ride?.captain?.fullname.firstname}</h2>
                <h4 className='text-xl font-bold '>{props.ride?.captain?.vehicle?.plate}</h4>
                <h1 className='text-lg font-bold color-black'>OTP: {props.ride?.otp}</h1>
           </div>
        </div>
        <div className='gap-5 flex flex-col items-center justify-between'>
           
           <div className='w-full'>
                <div className='flex items-center justify-evenly gap-4 p-2 rounded-t-lg shadow-lg bg-white border border-gray-200 '>
                    <i className="text-lg ri-map-pin-range-fill "></i>
                    <div>
                        <h3 className='text-xl font-semibold p-1'>562/11-A</h3>
                        <p>{props.ride?.pickup}</p>
                    </div>
                </div>
                <div className='flex items-center justify-evenly gap-4 p-2 rounded-t-lg shadow-lg bg-white border border-gray-200 '>
                    <i className="ri-map-pin-range-line "></i>
                    <div>
                        <h3 className='text-xl font-semibold p-1'>562/11-A</h3>
                        <p>{props.ride?.destination}</p>
                    </div>
                </div>
                <div className='flex items-center gap-4 p-2 rounded-t-lg shadow-lg bg-white border border-gray-200 '>
                    <i className="ri-money-rupee-circle-line pl-10"></i>
                    <div>
                        <h3 className='text-xl font-semibold pl-12'>₹{props.ride?.fare}</h3>
                        <p className='pl-12'>Cash</p>
                    </div>
                </div>
           </div>
           
        </div>
    </div>
  )
}

export default Waitingfordeiver
