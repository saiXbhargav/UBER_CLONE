import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import Usercontext from './Context/Usercontext.jsx'
import CaptainContext from './Context/CaptainContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CaptainContext>
      <Usercontext>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Usercontext>
    </CaptainContext>
  </StrictMode>
)
