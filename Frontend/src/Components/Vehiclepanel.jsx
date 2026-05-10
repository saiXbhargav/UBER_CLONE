import React from 'react'

const Vehiclepanel = (props) => {
  return (
    <div>
      
        <div className='flex items-center justify-center mb-4'>
          <div 
            onClick={() => { props.setvehiclepanelopen(false); }}
            className="w-16 h-1.5 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition"
          ></div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h3 className='text-2xl font-bold text-gray-800 tracking-tight'>Choose a Vehicle</h3>
          <i onClick={() => { props.setvehiclepanelopen(false); }} className="ri-close-line text-2xl text-gray-500 cursor-pointer hover:text-gray-800 transition"></i>
        </div>
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
            src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/TukTuk_Green_v1.png"
            alt="uber-auto"
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
            src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/Regular/MotorcycleOrange-249-0.png"
            alt="uber moto"
            className="h-16 w-16  border-2 border-white  object-contain"
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
