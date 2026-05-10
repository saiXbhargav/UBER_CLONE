import React from 'react'

const Waitingfordeiver = (props) => {
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
            onClick={() => { props.setwaitingfordriver(false); }}
            className="w-16 h-1.5 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition"
          ></div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h3 className='text-2xl font-bold text-gray-800 tracking-tight'>Driver is arriving</h3>
          <i onClick={() => { props.setwaitingfordriver(false); }} className="ri-close-line text-2xl text-gray-500 cursor-pointer hover:text-gray-800 transition"></i>
        </div>
        <div className='flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4'>
           <img className='h-16 object-contain' src={getVehicleImage(props.vehicleType || props.ride?.captain?.vehicle?.vehicleType)} alt="vehicle" />
           <div className='text-right'>
                <h2 className='text-xl font-bold text-gray-800 capitalize'>{props.ride?.captain?.fullname.firstname}</h2>
                <h4 className='text-lg font-bold text-gray-600 uppercase'>{props.ride?.captain?.vehicle?.plate}</h4>
                <div className='inline-block bg-black text-white px-3 py-1 rounded-md mt-1'>
                  <span className='text-sm font-semibold tracking-widest'>OTP: {props.ride?.otp}</span>
                </div>
           </div>
        </div>
        <div className='gap-5 flex flex-col items-center justify-between'>
           <div className='w-full'>
                <div className='flex items-center gap-4 p-4 rounded-t-xl bg-white border-b border-gray-100 '>
                    <i className="text-xl ri-map-pin-user-fill text-gray-800"></i>
                    <div>
                        <h3 className='text-lg font-bold text-gray-800'>Pickup</h3>
                        <p className='text-sm text-gray-600'>{props.ride?.pickup}</p>
                    </div>
                </div>
                <div className='flex items-center gap-4 p-4 bg-white border-b border-gray-100 '>
                    <i className="text-xl ri-map-pin-2-fill text-gray-800"></i>
                    <div>
                        <h3 className='text-lg font-bold text-gray-800'>Destination</h3>
                        <p className='text-sm text-gray-600'>{props.ride?.destination}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-b-xl bg-white mb-4">
                  <i className="text-xl ri-cash-line text-green-600"></i>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">₹{props.ride?.fare}</h3>
                    <p className="text-sm text-gray-600">Cash Payment</p>
                  </div>
                </div>
           </div>
        </div>
    </div>
  )
}

export default Waitingfordeiver
