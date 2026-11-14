import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './Components/common/ProtectedRoute';
import Start from './pages/Start.jsx';
import UserLogin from './pages/userlogin.jsx';
import UserSignup from './pages/usersignup.jsx';
import CaptainLogin from './pages/captainlogin.jsx';
import CaptainSignup from './pages/captainsignup.jsx';
import UserLogout from './pages/UserLogout.jsx';
import CaptainLogout from './pages/CaptainLogout.jsx';
import NotFound from './pages/NotFound.jsx';
import { FullPageLoader } from './Components/common/Spinner';

const Home = lazy(() => import('./pages/Home.jsx'));
const Riding = lazy(() => import('./pages/Riding.jsx'));
const Captainhome = lazy(() => import('./pages/Captainhome.jsx'));
const Captainriding = lazy(() => import('./pages/Captainriding.jsx'));
const History = lazy(() => import('./pages/History.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

const rider = (el) => <ProtectedRoute role="user">{el}</ProtectedRoute>;
const driver = (el) => <ProtectedRoute role="captain">{el}</ProtectedRoute>;

function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/" element={<Start />} />

      {/* Rider */}
      <Route path="/login" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/home" element={rider(<Home />)} />
      <Route path="/riding" element={rider(<Riding />)} />
      <Route path="/history" element={rider(<History role="user" />)} />
      <Route path="/user/logout" element={<UserLogout />} />

      {/* Admin (rider accounts listed in ADMIN_EMAILS) */}
      <Route path="/admin" element={rider(<Admin />)} />

      {/* Driver */}
      <Route path="/captain-login" element={<CaptainLogin />} />
      <Route path="/captain-signup" element={<CaptainSignup />} />
      <Route path="/captain-home" element={driver(<Captainhome />)} />
      <Route path="/captain-riding" element={driver(<Captainriding />)} />
      <Route path="/captain/history" element={driver(<History role="captain" />)} />
      <Route path="/captain/logout" element={<CaptainLogout />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

export default App;
