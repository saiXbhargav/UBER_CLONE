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
    <div className='mt-2 px-2'>
      {
        suggestions.map((address, idx) => (
          <div
            key={idx}
            className='p-4 flex items-center gap-4 rounded-2xl mx-1 my-2 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer border border-transparent hover:border-gray-200'
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
            <div className='bg-gray-200 text-gray-700 flex items-center justify-center h-12 w-12 rounded-full shrink-0'>
              <i className="ri-map-pin-fill text-xl"></i>
            </div>
            <h4 className='text-wrap break-words font-medium text-gray-800 text-lg'>
              {address.name || JSON.stringify(address)}
            </h4>
          </div>
        ))
      }
    </div>
  )
}

export default Locationsearchpanel
