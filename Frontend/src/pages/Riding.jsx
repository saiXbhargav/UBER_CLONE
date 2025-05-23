import React from 'react'
import { Link } from 'react-router-dom'

const Riding = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Top Section */}
      <div className="relative h-1/2 w-full overflow-hidden">
        {/* Home Button */}
        <Link to="/home" className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <i className="ri-home-6-fill text-xl text-black" />
        </Link>

        {/* Background Image */}
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Uber"
        />
      </div>

      {/* Bottom Section */}
      <div className="h-1/2 p-4 space-y-4 bg-gray-50">
        {/* Driver & Car Info */}
        <div className="flex items-center justify-between gap-4">
          <img className="h-20 w-20 object-contain" src="https://mobile-content.uber.com/launch-experience/ride.png" alt="Car" />
          <div>
            <h2 className="text-2xl font-semibold">Sarthak</h2>
            <h4 className="text-xl font-bold">MP04AB1234</h4>
            <p className="text-sm text-gray-600">Maruti Suzuki Alto</p>
          </div>
        </div>

        {/* Address and Payment Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-3 rounded-lg shadow-lg bg-white border border-gray-200">
            <i className="ri-map-pin-range-fill text-lg text-gray-700 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">562/11-A</h3>
              <p className="text-sm text-gray-600">Kankariya Talab, Ahmedabad</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 rounded-lg shadow-lg bg-white border border-gray-200">
            <i className="ri-money-rupee-circle-line text-lg text-gray-700 mt-1 pl-1" />
            <div>
              <h3 className="text-lg font-semibold">₹125.25</h3>
              <p className="text-sm text-gray-600">Cash</p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button className="w-full bg-black text-white py-3 rounded-lg text-lg font-semibold shadow-lg">
          Make a payment
        </button>
      </div>
    </div>
  )
}

export default Riding
