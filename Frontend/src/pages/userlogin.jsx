import React from 'react'
import { Link } from 'react-router-dom'
import { UserDataContext } from '../Context/Usercontext';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
const UserLogin = () => {
  const [email,setemail] = React.useState("");
  const [password,setpassword] = React.useState("");
  const [userdata,setuserdata] = React.useState({});
  const {user,setUser}=useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    const userdata={
      email:email,
      password:password
    }
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userdata);
    console.log(response);
    if(response.status===200){
      console.log("Login Success:", response.data);
      const data=response.data;
      setUser(data.user);
      localStorage.setItem("token", data.token);
      navigate('/home');
    }
    // console.log(userdata);
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
          <p className='text-center'>New here?<Link to='/signup' className='text-[#0095f6]'>Create new Account</Link></p>

        </form>
      </div>
      <div>
        <Link to='/captain-login'  className='flex items-center justify-center text-white mt-7 bg-[#27A27D] font-semibold mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'>Sign in as Captain</Link>
      </div>
    </div>
  )
}

export default UserLogin;
