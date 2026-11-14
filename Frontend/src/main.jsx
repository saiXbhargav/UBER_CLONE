import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import './index.css';
import App from './App.jsx';
import UserContext from './Context/Usercontext.jsx';
import CaptainContext from './Context/CaptainContext.jsx';
import SocketProvider from './Context/SocketContext.jsx';
import { ToastProvider } from './Context/ToastContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <CaptainContext>
        <UserContext>
          <SocketProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SocketProvider>
        </UserContext>
      </CaptainContext>
    </ToastProvider>
  </StrictMode>
);
