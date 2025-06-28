import React from 'react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react';
import { useState } from 'react';
import { CaptainDataContext } from '../Context/CaptainContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const captainsignup = () => {
  
    const [email,setemail] = React.useState("");
    const [password,setpassword] = React.useState("");
    const [userdata,setuserdata] = React.useState({});
    const [firstname,setfirstname] = React.useState("");  
    const [lastname,setlastname] = React.useState("");
    const {captain, setCaptain} = React.useContext(CaptainDataContext);
    const [color, setvehiclecolor] = React.useState("");
    const [plate, setvehicleplate] = React.useState("");
    const [vehicleType, setvehiclevehicleType] = React.useState("");
    const [capacity, setvehiclecapacity] = React.useState("");
    const navigate=useNavigate();
    const submitHandler = async (e) => {
      e.preventDefault();
      const captaindata={
      email: email,
      password: password,
      fullname: {
        firstname: firstname,
        lastname: lastname
      },
      vehicle: {
        color: color,
        plate: plate,
        vehicleType: vehicleType,
        capacity: Number(capacity)
      }
      };
      
      // console.log(captaindata);
      const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captaindata);
     
      console.log(response);
      if(response.status===201){
        const data=response.data;
        console.log("Registration Success:", data);
        setCaptain(data.captain);
        localStorage.setItem("captainToken", data.token);
        navigate('/captain-home');
      }
      // Reset all fields
      setemail("");
      setpassword("");
      setfirstname("");
      setlastname("");
      setvehiclecolor("");
      setvehicleplate("");
      setvehiclevehicleType("");
      setvehiclecapacity("");
    }

    useEffect(()=>{
      console.log(userdata);
    },[userdata])
  return (
     <div className='p-7 flex flex-col  h-screen'>
      <div>
        <img className='w-12 ml-2 mt-4 mb-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber"  />
        <form onSubmit={(e)=>{
          submitHandler(e);
        }} className='flex flex-col'>

           <h3 className='text-xl  mb-2 text-black font-medium'>
            What's your Name?</h3>
          <div className='flex gap-4 mb-5'>
            <input required value={firstname} onChange={(e)=>{
              setfirstname(e.target.value)
            }}  type="text" placeholder='First Name' className='bg-[#eeeeee] rounded px-4 py-2 border w-full text-base placeholder:text-sm' />
            <input required value={lastname} onChange={(e)=>{
              setlastname(e.target.value)
            }}  type="text" placeholder='Last Name' className='bg-[#eeeeee] rounded px-4 py-2 border w-full text-base placeholder:text-sm' />
          </div>
            
          <h3 className='text-xl  mb-2 text-black font-medium'>
            What's your Email?</h3>
          <input required value={email} onChange={(e)=>{
            setemail(e.target.value)
          }}  type="email" placeholder='email@example.com' className='bg-[#eeeeee] mb-5 rounded px-4 py-2 border w-full text-base placeholder:text-sm' />

          <h3 className='text-xl mb-2 font-medium'>
            Enter Password</h3>
          <input required value={password} onChange={(e)=>{
            setpassword(e.target.value)
          }}  type='password' placeholder='Password' className='bg-[#eeeeee] mb-3 rounded px-4 py-2 border w-full text-base placeholder:text-sm' />
          
          <h3 className='text-xl  mb-2 text-black font-medium'>
            Vehicle Details</h3>
            <div className='flex gap-4 mb-5'>
            <input required value={color} onChange={(e) => {
              setvehiclecolor(e.target.value);
            }} type="text" placeholder='Vehicle Color' className='bg-[#eeeeee] rounded px-4 py-2 border w-full text-base placeholder:text-sm' />
            <input required value={plate} onChange={(e) => {
              setvehicleplate(e.target.value);
            }} type="text" placeholder='Vehicle Plate' className='bg-[#eeeeee] rounded px-4 py-2 border w-full text-base placeholder:text-sm' />
            </div>
            <div className='flex gap-4 mb-5'>
            <select required value={vehicleType} onChange={(e) => {
              setvehiclevehicleType(e.target.value);
            }} className='bg-[#eeeeee] rounded px-4 py-2 border w-full text-base placeholder:text-sm'>
              <option value="" disabled>Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
            </select>
            <input required value={capacity} onChange={(e) => {
              setvehiclecapacity(e.target.value);
            }} type="number" placeholder='Vehicle Capacity' className='bg-[#eeeeee] rounded px-4 py-2 border w-full text-base placeholder:text-sm' />
            </div>


          <div className='flex justify-center '>
            <button className='flex  justify-around max-w-lg text-white mt-7 bg-[#111] font-semibold mb-5 rounded-lg px-4 py-2 border w-full text-base placeholder:text-sm'>
              Create account</button>
          </div>
          <p className='text-center'>Already have a Account?<Link to='/captain-login' className='text-[#0095f6]'>Login here</Link></p>

        </form>
      </div>
      
    </div>
  )

}

export default captainsignup
