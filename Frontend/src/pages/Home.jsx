import React, { useState, useEffect, useRef,useContext } from 'react'
import axios from 'axios'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import Locationsearchpanel from '../Components/Locationsearchpanel'
import Vehiclepanel from '../Components/Vehiclepanel'
import Confirmride from '../Components/Confirmride'
import Lookingfordriver from '../Components/Lookingfordriver'
import Waitingfordeiver from '../Components/Waitingfordeiver'
import {SocketContext} from '../Context/SocketContext'
import { Link } from 'react-router-dom'
import { UserDataContext } from '../Context/Usercontext'
import {useNavigate} from 'react-router-dom'
import Livetracking from '../Components/Livetracking'
const Home = () => {
  const [pickup, setpickup] = useState('')
  const [destination, setdestination] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searchType, setSearchType] = useState('')
  const [panelopen, setpanelopen] = useState(false)
  const panelref = useRef(null)
  const [vehiclepanelopen, setvehiclepanelopen] = useState(false)
  const [confirmridepanel, setconfirmridepanel] = useState(false)
  const [vehiclefound, setvehiclefound] = useState(false)
  const [waitingfordriver, setwaitingfordriver] = useState(false)
  const waitingfordriverref = useRef(null)
  const confirmridepanelref = useRef(null)
  const vehiclefoundref = useRef(null)
  const [fare, setfare] = useState(0)
  const [vehicleType, setvehicleType] = useState(null)
  const {socket} = useContext(SocketContext)
  const { user,setUser } = useContext(UserDataContext)
  const [ride, setRide] = useState(null)
  const [routePolyline, setRoutePolyline] = useState(null)
  const navigate = useNavigate()


    useEffect(() => {
      console.log("User data:", user, user._id);
      if (user && user._id) {
        // console.log("Emitting join with:", user._id);
        socket.emit("join", { userType: "user", userId: user._id });
      }
    }, [user]);

    useEffect(() => {
  if (!socket) return;

  socket.on('ride-confirmed', (ride) => {
    console.log("🚀 Ride confirmed event received", ride);
    setconfirmridepanel(false);
    setvehiclefound(false);
    setwaitingfordriver(true);
    setRide(ride);
  });

}, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('ride-started', (ride) => {
      console.log("🚀 Ride started event received", ride);
      setwaitingfordriver(false);
      navigate('/riding', { state: { ride } });
    });
  }, [socket]);

  const Submithandler = (e) => {
    e.preventDefault()
    console.log('Form submitted')
  }

  useGSAP(function () {
    if (panelopen) {
      gsap.to(panelref.current, {
        height: '70%',
        duration: 1,
        ease: 'power2.inOut',
      })
    } else {
      gsap.to(panelref.current, {
        height: '0%',
        duration: 1,
        ease: 'power2.inOut',
      })
    }
  }, [panelopen])
  const vehiclepanelopenref = useRef(null)

  useGSAP(function () {
    if (vehiclepanelopen) {
      gsap.to(vehiclepanelopenref.current, {
        transform: 'translateY(0%)',
        duration: 1,
      })
    } else {
      gsap.to(vehiclepanelopenref.current, {
        transform: 'translateY(120%)',
        duration: 1,
      })
    }
  }, [vehiclepanelopen])

  useGSAP(function () {
    if (confirmridepanel) {
      gsap.to(confirmridepanelref.current, {
        transform: 'translateY(0%)',
        duration: 1,
      })
    } else {
      gsap.to(confirmridepanelref.current, {
        transform: 'translateY(120%)',
        duration: 1,
      })
    }
  }, [confirmridepanel])

  useGSAP(function () {
    if (vehiclefound) {
      gsap.to(vehiclefoundref.current, {
        transform: 'translateY(0%)',
        duration: 1,
      })
    } else {
      gsap.to(vehiclefoundref.current, {
        transform: 'translateY(120%)',
        duration: 1,
      })
    }
  }, [vehiclefound])

  useGSAP(function () {
    if (waitingfordriver) {
      gsap.to(waitingfordriverref.current, {
        transform: 'translateY(0%)',
        duration: 1,
      })
    } else {
      gsap.to(waitingfordriverref.current, {
        transform: 'translateY(120%)',
        duration: 1,
      })
    }
  }, [waitingfordriver])

  // clear suggestions when panel is closed
  useEffect(() => {
    if (!panelopen) setSuggestions([])
  }, [panelopen])

  // fetch suggestions when pickup changes
  useEffect(() => {
    if (searchType === 'pickup' && pickup.length > 2) {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestion`, { params: { input: pickup },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        } })
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]))
    }
  }, [pickup, searchType])

  // fetch suggestions when destination changes
  useEffect(() => {
    if (searchType === 'destination' && destination.length > 2) {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestion`, { params: { input: destination },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        } })
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]))
    }
  }, [destination, searchType])

  async function findTrip() {
    if (pickup && destination) {
      setvehiclepanelopen(true)
      setpanelopen(false)
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
          params: { pickup, destination },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log("Fare response:", response.data);
        setfare(response.data);

        // Fetch route polyline
        const routeResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`, {
          params: { origin: pickup, destination: destination },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log("Route response:", routeResponse.data);
        if (routeResponse.data && routeResponse.data.polyline) {
          setRoutePolyline(routeResponse.data.polyline);
        }
      } catch (error) {
        console.error("Error fetching fare:", error);
      }
    } else {
      alert('Please enter both pickup and destination locations.')
    }
  }

  async function createride() {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`,
        { pickup, destination, vehicleType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Ride created successfully:', response.data);
      // setconfirmridepanel(true);
      // setvehiclepanelopen(false);
    } catch (err) {
      console.error('Error creating ride:', err);
    }
  }

  return (
    <div className="h-screen w-screen relative bg-gray-100">
      <header className="absolute top-0 left-0 w-full flex items-center justify-between bg-transparent z-10 px-4 py-2 mb-300">
        <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber"
        />
        <Link
          to="/user/logout"
          className="h-10 w-10 rounded-full bg-white/70 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white/90 transition"
        >
          <i className="ri-logout-circle-line text-gray-700 text-xl"></i>
        </Link>
      </header>

      {/* <div className="h-screen w-screen relative">
  <Livetracking routePolyline={routePolyline} />
  <div className="absolute top-0 left-0 z-10 p-4 text-white">
    <h1 className="text-2xl font-bold">Welcome to Your Ride</h1>
    <p>Tracking your current location...</p>
  </div>
</div> */}
      <div className="absolute inset-0 z-0">
        <Livetracking routePolyline={routePolyline} />
      </div>
      <div className="absolute flex flex-col top-0 justify-end w-full h-screen pointer-events-none">
        <div className="h-auto p-5 bg-white shadow-2xl rounded-t-3xl relative pointer-events-auto flex flex-col justify-between">
          {/* Drag Handle */}
          <div 
            onClick={() => setpanelopen(!panelopen)}
            className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-2 cursor-pointer hover:bg-gray-400 transition"
          ></div>
          
          <h4
            onClick={() => {
              setpanelopen(!panelopen);
            }}
            className="absolute right-5 top-5 text-2xl text-gray-400 cursor-pointer hover:text-gray-700 transition"
          >
            {panelopen ? <i className="ri-arrow-down-wide-line"></i> : <i className="ri-arrow-up-wide-line"></i>}
          </h4>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Find a trip</h3>
          <form onSubmit={Submithandler} className="gap-4 mt-2">
            <div className="flex justify-center items-center gap-4 relative">
              <i className="ri-map-pin-2-fill absolute left-4 text-gray-400 text-lg"></i>
              <input
                type="text"
                placeholder="Add a pick-up location"
                className="bg-gray-100 px-12 py-3 rounded-xl w-full placeholder:text-gray-500 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={pickup}
                onClick={() => {
                  setSearchType("pickup");
                  setpanelopen(true);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setpickup(val);
                  setSearchType("pickup");
                  if (val.length > 2) setpanelopen(true);
                }}
              />
            </div>
            <div className="flex justify-center items-center gap-4 relative mt-3">
              <i className="ri-square-fill absolute left-4 text-black text-lg"></i>
              <input
                type="text"
                placeholder="Enter your destination"
                className="bg-gray-100 px-12 py-3 rounded-xl w-full placeholder:text-gray-500 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={destination}
                onClick={() => {
                  setSearchType("destination");
                  setpanelopen(true);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setdestination(val);
                  setSearchType("destination");
                  if (val.length > 2) setpanelopen(true);
                }}
              />
            </div>
          </form>
          <button onClick={findTrip} className="bg-black hover:bg-gray-800 transition-colors text-white px-4 py-3 rounded-xl mt-4 w-full flex items-center justify-center shadow-lg">
            <p className="font-bold text-lg">Find a trip</p>
            <i className="ri-arrow-right-line text-xl ml-2"></i>
          </button>
        </div>
        <div ref={panelref} className="h-[70%] bg-white pointer-events-auto">
          <Locationsearchpanel
            setpanelopen={setpanelopen}
            setvehiclepanelopen={setvehiclepanelopen}
            setPickup={setpickup}
            setDestination={setdestination}
            suggestions={suggestions}
            searchType={searchType}
          />
        </div>
      </div>
      <div
        ref={vehiclepanelopenref}
        className="fixed z-10 bottom-0 w-full bg-white p-5 translate-y-full shadow-lg rounded-t-3xl"
      >
        <Vehiclepanel selectvehicleType={setvehicleType} fare={fare} setconfirmridepanel={setconfirmridepanel} setvehiclepanelopen={setvehiclepanelopen} />
      </div>
      <div
        ref={confirmridepanelref}
        className="fixed z-10 bottom-0 w-full bg-white p-5 translate-y-full shadow-lg rounded-t-3xl"
      >
        <Confirmride createride={createride}
        pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType}
        setconfirmridepanel={setconfirmridepanel} setvehiclefound={setvehiclefound} />
      </div>
      <div
        ref={vehiclefoundref}
        className="fixed z-10 bottom-0 w-full bg-white p-5 translate-y-full shadow-lg rounded-t-3xl"
      >
        <Lookingfordriver pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType} setvehiclefound={setvehiclefound} />
      </div>
      <div
        ref={waitingfordriverref}
        className="fixed z-10 bottom-0 w-full bg-white p-5 shadow-lg rounded-t-3xl"
      >
        <Waitingfordeiver setwaitingfordriver={setwaitingfordriver} ride={ride} vehicleType={vehicleType} />
      </div>
    </div>
  );
}

export default Home
