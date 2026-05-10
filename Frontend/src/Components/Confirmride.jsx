import React from 'react'
import Lookingfordriver from './Lookingfordriver'
const Confirmride = (props) => {
  const getVehicleImage = (type) => {
    switch (type) {
      case 'car': return 'https://mobile-content.uber.com/launch-experience/ride.png';
      case 'auto': return 'https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/TukTuk_Green_v1.png';
      case 'moto':
      case 'motorcycle': return 'https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/Regular/MotorcycleOrange-249-0.png';
      default: return 'https://mobile-content.uber.com/launch-experience/ride.png';
    }
  };

  return (
    <div>
        <div className='flex items-center justify-center mb-4'>
          <div 
            onClick={() => { props.setconfirmridepanel(false); }}
            className="w-16 h-1.5 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition"
          ></div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h3 className='text-2xl font-bold text-gray-800 tracking-tight'>Confirm your ride</h3>
          <i onClick={() => { props.setconfirmridepanel(false); }} className="ri-close-line text-2xl text-gray-500 cursor-pointer hover:text-gray-800 transition"></i>
        </div>
        <div className='gap-5 flex flex-col items-center justify-between'>
           <img className='h-24 object-contain mt-2' src={getVehicleImage(props.vehicleType)} alt="vehicle" /> 
           <div className='w-full'>
                <div className='flex items-center gap-4 p-4 rounded-t-xl bg-white border-b border-gray-100 '>
                    <i className="text-xl ri-map-pin-user-fill text-gray-800"></i>
                    <div>
                        <h3 className='text-lg font-bold text-gray-800'>Pickup</h3>
                        <p className='text-sm text-gray-600'>{props.pickup}</p>
                    </div>
                </div>
                <div className='flex items-center gap-4 p-4 bg-white border-b border-gray-100 '>
                    <i className="text-xl ri-map-pin-2-fill text-gray-800"></i>
                    <div>
                        <h3 className='text-lg font-bold text-gray-800'>Destination</h3>
                        <p className='text-sm text-gray-600'>{props.destination}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-b-xl bg-white mb-4">
                  <i className="text-xl ri-cash-line text-green-600"></i>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">₹{props.fare[props.vehicleType]}</h3>
                    <p className="text-sm text-gray-600">Cash Payment</p>
                  </div>
                </div>

           </div>
           <button onClick={()=>{
            props.setconfirmridepanel(false);
            props.setvehiclefound(true);
            props.createride();
           }} className='w-full bg-black hover:bg-gray-800 transition-colors text-white font-bold py-3 rounded-xl text-lg shadow-lg'>Confirm Pickup</button>
        </div>
    </div>
  )
}

export default Confirmride
