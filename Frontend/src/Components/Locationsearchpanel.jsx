import React from 'react'

const Locationsearchpanel = (props) => {
  const {
    suggestions = [],
    searchType,
    setPickup,
    setDestination,
    setpanelopen,
    setvehiclepanelopen
  } = props

  return (
    <div className='mt-10'>
      {
        suggestions.map((address, idx) => (
          <div
            key={idx}
            className='p-5 flex items-start gap-4 border-2 border-gray-50 rounded-xl mx-1 my-2 active:border-black cursor-pointer'
            onClick={() => {
              const selectedLocation = address.name || address // fallback if it's a string
              if (searchType === 'pickup') {
                setPickup(selectedLocation)
              } else {
                setDestination(selectedLocation)
              }
            //   setpanelopen(false)
            //   setvehiclepanelopen(true)
            }}
          >
            <div className='bg-[#eee] flex items-center justify-center h-10 w-10 rounded-full shrink-0'>
              <i className="ri-map-pin-fill text-xl"></i>
            </div>
            <h4 className='text-wrap break-words font-medium'>
              {address.name || JSON.stringify(address)}
            </h4>
          </div>
        ))
      }
    </div>
  )
}

export default Locationsearchpanel
