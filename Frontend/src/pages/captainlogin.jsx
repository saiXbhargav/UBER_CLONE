import React, { use } from 'react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../Context/CaptainContext';
const Captainlogin = () => {

    const [email,setemail] = React.useState("");
    const [password,setpassword] = React.useState("");
    const [captaindata,setcaptaindata] = React.useState({});
    const navigate=useNavigate();
  
    const submitHandler = async (e) => {
      e.preventDefault();
      const captaindata={
        email:email,
        password:password
      }
      
      // console.log(captaindata);
      const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, captaindata);
      console.log(response);
      if(response.status===200){
        const data=response.data;
        console.log("Login Success:", data);
        setcaptaindata(data.captain);
        localStorage.setItem("captainToken", data.token);
        console.log("Captain data:", data.captain);
        navigate('/captain-home');
      }
      setemail("");
      setpassword("");
    }

  
  
  return (
    <div className='p-7 flex flex-col justify-between h-screen'>
      <div>
        <img className='w-12 ml-2 mt-4 mb-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber"  />
        <form onSubmit={(e)=>{
          submitHandler(e);
        }} className='flex flex-col'>
          <h3 className='text-xl  mb-2 text-black font-medium'>
            What's your email?</h3>
          <input required value={email} onChange={(e)=>{
            setemail(e.target.value)
          }} type="email" placeholder='email@example.com' className='bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base' />

          <h3 className='text-xl mb-2 font-medium'>
            Enter Password</h3>
          <input required value={password} onChange={(e)=>{
            setpassword(e.target.value)
          }} type='password' placeholder='Password' className='bg-[#eeeeee] rounded px-4 py-2 border w-full text-lg placeholder:text-base' />
          

          <button className='text-white mt-7 bg-[#111] font-semibold mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'>
            Login</button>
          <p className='text-center'>Join a fleet?<Link to='/captain-signup' className='text-[#0095f6]'>Register as a Captain</Link></p>

        </form>
      </div>
      <div>
        <Link to='/login'  className='flex items-center justify-center text-white mt-7 bg-[#4F46E5] font-semibold mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'>
        Sign in as User</Link>
      </div>
    </div>
  )
}

export default Captainlogin
