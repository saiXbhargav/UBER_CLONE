import React,{useState} from 'react'
// import name from '@gsap/react'
import { useGSAP } from '@gsap/react'
import  gsap  from 'gsap'
import { useRef } from 'react';
import 'remixicon/fonts/remixicon.css'
import Locationsearchpanel from '../Components/Locationsearchpanel';
import Vehiclepanel from '../Components/vehiclepanel';
import Confirmride from '../Components/Confirmride';
import Lookingfordriver from '../Components/Lookingfordriver';
import Waitingfordeiver from '../Components/Waitingfordeiver';
import { Link } from 'react-router-dom';
const Home = () => {
  const [pickup,setpickup]=useState("");
  const [destination,setdestination]=useState("");
  const [panelopen,setpanelopen]=useState(false);
  const panelref=useRef(null);
  const [vehiclepanelopen,setvehiclepanelopen]=useState(false);
  const [confirmridepanel,setconfirmridepanel]=useState(false);
  const [vehiclefound,setvehiclefound]=useState(false);
  const [waitingfordriver,setwaitingfordriver]=useState(false);
  const waitingfordriverref=useRef(null);
  const confirmridepanelref=useRef(null);
  const vehiclefoundref=useRef(null);
  const Submithandler = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  }

  useGSAP(function(){
    if(panelopen){
      gsap.to(panelref.current,{
        height:"70%",
        duration:1,
        ease:"power2.inOut"
      })
    }
    else{
      gsap.to(panelref.current,{
        height:"0%",
        duration:1,
        ease:"power2.inOut"
      })
    }
  },[panelopen])
  const vehiclepanelopenref=useRef(null);

  useGSAP(function(){
    if(vehiclepanelopen){
    gsap.to(vehiclepanelopenref.current,{
      transform:"translateY(0%)",
      duration:1,
  })
    }
    else{
      gsap.to(vehiclepanelopenref.current,{
        transform:"translateY(100%)",
        duration:1,
      })
    }
  },[vehiclepanelopen])


  useGSAP(function(){
    if(confirmridepanel){
      gsap.to(confirmridepanelref.current,{
        transform:"translateY(0%)",
        duration:1,
      })
    }
    else{
      gsap.to(confirmridepanelref.current,{
        transform:"translateY(100%)",
        duration:1,
      })
    }
  },[confirmridepanel])

  useGSAP(function(){
    if(vehiclefound){
      gsap.to(vehiclefoundref.current,{
        transform:"translateY(0%)",
        duration:1,
      })
    }
    else{
      gsap.to(vehiclefoundref.current,{
        transform:"translateY(100%)",
        duration:1,
      })
    }
  },[vehiclefound])

  useGSAP(function(){
    if(waitingfordriver){
      gsap.to(waitingfordriverref.current,{
        transform:"translateY(0%)",
        duration:1,
      })
    }
    else{
      gsap.to(waitingfordriverref.current,{
        transform:"translateY(100%)",
        duration:1,
      })
    }
  },[waitingfordriver])


  return (
    <div className='h-screen w-screen relative overflow-hidden'>
      <div >
        <img className='w-16 absolute left-5 top-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber"  />
        <Link to="/user/logout" className="absolute top-5 right-5 z-10 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <i className="ri-logout-circle-line"></i>
        </Link>
       </div>
      <div className='h-screen w-screen '>
        <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="Uber" />
      </div>
      <div className=' absolute flex flex-col top-0 justify-end  w-full h-screen'>
        <div className='h-[30%] p-5 bg-white relative'>
          <h4 onClick={()=>{
            setpanelopen(!panelopen);
          }} className='absolute right-5 top-5 text-3xl text-gray-900 cursor-pointer'>
            <i className="ri-expand-up-down-line"></i>
          </h4>
          <h3 className='text-2xl font-semibold'>Find a trip</h3>
          <form className=' gap-4 mr-2' onSubmit={(e)=>{
            Submithandler(e);
            }}>
            
            <div className='flex justify-center items-center gap-4 relative'>
              <i className="ri-flight-takeoff-line absolute left-4 text-gray-500 mt-3"></i>
              <input 
              onClick={() => setpanelopen(true)} 
              value={pickup} 
              onChange={(e) => setpickup(e.target.value)} 
              type="text" 
              placeholder='Add a pick-up location' 
              className='bg-[#eee] px-12 py-2 rounded-lg w-full mt-4 placeholder:text-base' 
              />
            </div>
            <div className='flex justify-center items-center gap-4 relative'>
              <i className="ri-flight-land-line absolute left-4 text-gray-500 mt-3"></i>
              
              <input value={destination} onChange={(e) => {
                setdestination(e.target.value)
              }} type="text" placeholder='Enter your destination' className='bg-[#eee] px-12 py-2 rounded-lg w-full mt-4   placeholder:text-base' />
            </div>
          </form>
        </div>
        <div ref={panelref} className='h-[70%] bg-white'>
            <Locationsearchpanel setpanelopen={setpanelopen} setvehiclepanelopen={setvehiclepanelopen}/>
        </div>
      </div>
      <div ref={vehiclepanelopenref} className="fixed z-10 bottom-0 w-full bg-white p-5 translate-y-full">
        <Vehiclepanel setconfirmridepanel={setconfirmridepanel} setvehiclepanelopen={setvehiclepanelopen}/>
      </div>
      <div ref={confirmridepanelref} className="fixed z-10 bottom-0 w-full bg-white p-5 translate-y-full">
        <Confirmride setconfirmridepanel={setconfirmridepanel} setvehiclefound={setvehiclefound}/>
      </div>

      <div ref={vehiclefoundref} className="fixed z-10 bottom-0 w-full bg-white p-5 translate-y-full">
        <Lookingfordriver setvehiclefound={setvehiclefound}/>
      </div>

      <div ref={waitingfordriverref} className="fixed z-10 bottom-0 w-full bg-white p-5 ">
        <Waitingfordeiver setwaitingfordriver={setwaitingfordriver}/>
      </div>
      
    </div> 
  )
}

export default Home
