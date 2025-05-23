import React from 'react'

const CaptainDetails = () => {
  return (
    <div>
        {/* Bottom Section */}
      <div className="h-1/2 p-4 space-y-4 bg-gray-50">
        <div>
          <div className='flex items-center justify-between gap-4 transform transition-transform duration-300 hover:scale-105'>
  {/* Left: Profile Image and Name */}
            <div className='flex items-center gap-4'>
                <img
                  className='w-12 rounded-full'
                  src="https://pngimg.com/d/face_PNG11760.png"
                  alt="person-image"
                />
                <h4 className="text-xl font-semibold">Sarthak</h4>
              </div>

              {/* Right: Earnings */}
              <div className='text-right '>
                <h2 className='font-bold text-xl'>₹295.20</h2>
                <h4 className='text-gray-500 text-center'>Earned</h4>
              </div>
            </div>

          <div className='p-5 rounded-lg mt-5 bg-black shadow-2xl text-white flex items-center justify-between gap-4'>
            <div className=' text-center transform transition-transform duration-300 hover:scale-105'>
              <i className="text-3xl mt-2 font-thin flex justify-center items-center ri-timer-2-line"></i>
              <h4 className='text-xl font-semibold mt-2'>10.2</h4>
              <p className='mt-2 text-sm text-gray-400'>Hours Online</p>
            </div>
            <div className=' text-center transform transition-transform duration-300 hover:scale-105'>
              <i className="text-3xl mt-2 font-thin flex justify-center items-center ri-speed-up-line"></i>
              <h4 className='text-xl font-semibold mt-2'>30KM</h4>
              <p className='mt-2 text-sm text-gray-400'>Total Distance</p>
            </div>
            <div className='text-center transform transition-transform duration-300 hover:scale-105 '>
              <i className="text-3xl mt-2 font-thin flex justify-center items-center ri-file-list-3-line"></i>
              <h4 className='text-xl font-semibold mt-3'>20</h4>
              <p className='mt-2 text-sm text-gray-400'>Number of rides</p>
            </div>
          </div>
          <div>

          </div>
        </div>
        
      </div>
    </div>
  )
}

export default CaptainDetails
