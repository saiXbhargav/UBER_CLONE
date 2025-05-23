import React from 'react';
import './index.css'
import { Routes, Route } from 'react-router-dom';
import Start from './pages/Start.jsx';
import CaptainSignup from './pages/captainsignup.jsx';
import CaptainLogin from './pages/captainlogin.jsx';
import Userlogin from './pages/userlogin.jsx';
import UserSignup from './pages/usersignup.jsx';
import { UserDatacontext } from './Context/Usercontext.jsx';
import Home from './pages/Home.jsx';
// import { usecontext } from 'react';
import Userprotectedwrapper from './pages/userprotectedwrapper.jsx';
import UserLogout from './pages/UserLogout.jsx';
import Captainhome from './pages/Captainhome.jsx';
import Captainprotectedwrapper from './pages/Captainprotectedwrapper.jsx';
import { useContext } from 'react';
import CaptainLogout from './pages/CaptainLogout.jsx';
import Riding from './pages/Riding.jsx';
import Captainriding from './pages/Captainriding.jsx';
function App() {
  const ans=useContext(UserDatacontext);
  console.log(ans);
  return (
    <div>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route path="/captain-login" element={<CaptainLogin />} />
        <Route path="/Login" element={<Userlogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/riding" element={<Riding />} />
        <Route path='/captain-riding' element={<Captainriding />} />
        <Route path="/home" element={
          <Userprotectedwrapper>
            <Home />
          </Userprotectedwrapper>

          } />
          <Route path='/user/logout' element={<Userprotectedwrapper>
            <UserLogout />
          </Userprotectedwrapper>} />
        <Route path="/captain-home" element={
          <Captainprotectedwrapper>
            <Captainhome />
          </Captainprotectedwrapper>
          
        } />
        <Route path='/captain/logout' element={<Captainprotectedwrapper>
            <CaptainLogout />
          </Captainprotectedwrapper>} />
      </Routes>
    </div>
  );
}

export default App;
