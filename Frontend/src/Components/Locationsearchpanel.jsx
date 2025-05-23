import React from 'react'

const Locationsearchpanel = (props) => {
    // console.log(props)
    const locations=[
        {
            id: 1,
            address: "Professor CR Rao Rd, Gachibowli, Hyderabad, Telangana 500032, India"
        },
        {
            id: 2,
            address: "Hitech City Rd, Madhapur, Hyderabad, Telangana 500081, India"
        },
        {
            id: 3,
            address: "Banjara Hills, Hyderabad, Telangana 500034, India"
        },
        {
            id: 4,
            address: "Jubilee Hills, Hyderabad, Telangana 500033, India"
        },
        {
            id: 5,
            address: "Charminar, Hyderabad, Telangana 500002, India"
        }
    ]
  return (
    <div>
        {
        locations.map((location) => (
            <div onClick={()=>{
                props.setvehiclepanelopen(true);
                props.setpanelopen(false);
            }
            } key={location.id} className='p-5 flex items-start gap-4 border-2 border-gray-50 rounded-xl mx-1 my-2 active:border-black'>
                <div className='bg-[#eee] flex items-center justify-center h-10 w-10 rounded-full shrink-0'>
                <i className="ri-map-pin-fill text-xl"></i>
                </div>
                <h4 className='text-wrap break-words font-medium'>
                {location.address}
                </h4>
            </div>
            ))
        }
      
    </div>
  )
}

export default Locationsearchpanel
