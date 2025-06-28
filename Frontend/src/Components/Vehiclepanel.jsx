import React from 'react'

const Vehiclepanel = (props) => {
  return (
    <div>
      
        <div className='flex items-center justify-center'>
          <h5 onClick={()=>{
            props.setvehiclepanelopen(false);
          }} className='text-2xl font-semibold text-gray-300'>
            <i className="ri-arrow-down-wide-fill"></i>
          </h5>
        </div>
        <h3 className='text-2xl font-bold mb-3'>Choose a Vehicle</h3>
        <div onClick={()=>{
            props.setconfirmridepanel(true);
            props.selectvehicleType("car");
            props.setvehiclepanelopen(false);
        }} className="active:border-black flex mb-2 items-center justify-between gap-4 p-4 rounded-t-lg shadow-lg bg-white border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          
          {/* Car Image */}
          <img
            src="https://mobile-content.uber.com/launch-experience/ride.png"
            alt="uber"
            className="h-16 w-16 rounded-full border-2 border-white shadow-lg object-cover"
          />
          
          {/* Ride Info */}
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                UberGo <span className="text-gray-500"><i className="ri-user-fill"></i> 4</span>
              </h4>
              <h2 className="text-xl font-bold text-gray-900">₹{props.fare.car}</h2>
            </div>
            <div className="text-sm text-gray-600">
              <p>2 min away</p>
              <p>Affordable, compact rides</p>
            </div>
          </div>
          
        </div>

        {/* this is for auto */}
        <div onClick={()=>{
            props.setconfirmridepanel(true);
            props.selectvehicleType("auto");
            props.setvehiclepanelopen(false);
        }} className="active:border-black flex mb-2 items-center justify-between gap-4 p-4 rounded-t-lg shadow-lg bg-white border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          
          {/* auto Image */}
          <img
            src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
            alt="uber"
            className="h-16 w-16 rounded-sm border-2 border-white object-cover"
          />
          
          {/* Ride Info */}
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                Auto <span className="text-gray-500"><i className="ri-user-fill"></i> 3</span>
              </h4>
              <h2 className="text-xl font-bold text-gray-900">₹{props.fare.auto}</h2>
            </div>
            <div className="text-sm text-gray-600">
              <p>2 min away</p>
              <p>Comfortable Autos,top-quality drivers</p>
            </div>
          </div>
          
        </div>

        {/* this is for Bike */}
        <div onClick={()=>{
            props.setconfirmridepanel(true);
            props.selectvehicleType("moto");
            props.setvehiclepanelopen(false);
        }} className="active:border-black flex mb-2 items-center justify-between gap-4 p-4 rounded-t-lg shadow-lg bg-white border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          
          {/* Bike Image */}
          <img
            src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png"
            alt="uber"
            className="h-16 w-16  border-2 border-white  object-cover"
          />
          
          {/* Ride Info */}
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                Moto <span className="text-gray-500"><i className="ri-user-fill"></i> 1</span>
              </h4>
              <h2 className="text-xl font-bold text-gray-900">₹{props.fare.moto}</h2>
            </div>
            <div className="text-sm text-gray-600">
              <p>2 min away</p>
              <p>Affordable, motorcycle rides</p>
            </div>
          </div>
          
        </div>
      </div>
    
  )
}

export default Vehiclepanel
