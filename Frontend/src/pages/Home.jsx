import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapLayout from '../Components/common/MapLayout';
import Navbar from '../Components/common/Navbar';
import Livetracking from '../Components/Livetracking';
import { Spinner } from '../Components/common/Spinner';
import LocationSearch from '../Components/rider/LocationSearch';
import VehicleList from '../Components/rider/VehicleList';
import ConfirmRide from '../Components/rider/ConfirmRide';
import SearchingDriver from '../Components/rider/SearchingDriver';
import DriverAssigned from '../Components/rider/DriverAssigned';
import SavedPlacesEditor from '../Components/rider/SavedPlacesEditor';
import { UserDataContext } from '../Context/Usercontext';
import { useSocketEvent } from '../Context/SocketContext';
import { useToast } from '../Context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import ChatSheet from '../Components/common/ChatSheet';
import useRideChat from '../hooks/useRideChat';

// Booking flow: search → vehicles → confirm → searching → assigned → (/riding)
const Home = () => {
  const { user } = useContext(UserDataContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [stage, setStage] = useState('loading');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [quote, setQuote] = useState(null);
  const [vehicleType, setVehicleType] = useState('car');
  const [ride, setRide] = useState(null);
  const [route, setRoute] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [busy, setBusy] = useState(false);
  const [places, setPlaces] = useState(null);
  const chat = useRideChat(stage === 'assigned' ? ride?._id : null, 'user');

  const loadRoute = useCallback((from, to) => {
    api('user')
      .get('/maps/get-distance-time', { origin: from, destination: to })
      .then((d) => setRoute(d.polyline || null))
      .catch(() => setRoute(null));
  }, []);

  useEffect(() => {
    api('user').get('/users/places').then(setPlaces).catch(() => {});
  }, []);

  // Resume an in-progress booking after a refresh.
  useEffect(() => {
    api('user')
      .get('/rides/active')
      .then(({ ride: active }) => {
        if (!active) return setStage('search');
        if (active.status === 'on-going') return navigate('/riding', { replace: true, state: { ride: active } });
        setRide(active);
        setPickup(active.pickup);
        setDestination(active.destination);
        setVehicleType(active.vehicleType || 'car');
        loadRoute(active.pickup, active.destination);
        setStage(active.status === 'accepted' ? 'assigned' : 'searching');
      })
      .catch(() => setStage('search'));
  }, [navigate, loadRoute]);

  const resetAfterRide = useCallback(() => {
    setRide(null);
    setDriverPos(null);
    setStage(quote ? 'vehicles' : 'search');
  }, [quote]);

  // --- realtime events ----------------------------------------------------
  useSocketEvent(
    'ride-confirmed',
    useCallback(
      (confirmed) => {
        setRide(confirmed);
        setStage('assigned');
        toast.success('A driver accepted your ride');
      },
      [toast]
    )
  );

  useSocketEvent(
    'ride-started',
    useCallback((started) => navigate('/riding', { state: { ride: started } }), [navigate])
  );

  useSocketEvent(
    'ride-timeout',
    useCallback(() => {
      toast.error('No drivers accepted your request. Please try again.');
      resetAfterRide();
    }, [toast, resetAfterRide])
  );

  useSocketEvent(
    'ride-canceled',
    useCallback(
      ({ by }) => {
        if (by === 'user') return;
        toast.error('Your driver cancelled. You can request another ride.');
        resetAfterRide();
      },
      [toast, resetAfterRide]
    )
  );

  useSocketEvent(
    'captain-location',
    useCallback(({ lat, lng }) => setDriverPos({ lat, lng }), [])
  );

  // --- actions --------------------------------------------------------------
  const getQuote = async () => {
    setBusy(true);
    try {
      const data = await api('user').get('/rides/get-fare', { pickup, destination });
      setQuote(data);
      setRoute(data.polyline || null);
      setStage('vehicles');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not find a route between these places'));
    } finally {
      setBusy(false);
    }
  };

  const requestRide = async () => {
    setBusy(true);
    try {
      const created = await api('user').post('/rides/create', { pickup, destination, vehicleType });
      setRide(created);
      setStage('searching');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not request a ride'));
    } finally {
      setBusy(false);
    }
  };

  const cancelRide = async () => {
    if (!ride) return;
    setBusy(true);
    try {
      await api('user').post('/rides/cancel', { rideId: ride._id });
      toast.info('Ride cancelled');
      resetAfterRide();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not cancel the ride'));
    } finally {
      setBusy(false);
    }
  };

  // --- render -------------------------------------------------------------
  let panel;
  switch (stage) {
    case 'loading':
      panel = (
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6" />
        </div>
      );
      break;
    case 'vehicles':
      panel = (
        <VehicleList
          quote={quote}
          selected={vehicleType}
          onSelect={setVehicleType}
          onBack={() => setStage('search')}
          onContinue={(v) => {
            setVehicleType(v);
            setStage('confirm');
          }}
        />
      );
      break;
    case 'confirm':
      panel = (
        <ConfirmRide
          pickup={pickup}
          destination={destination}
          vehicleType={vehicleType}
          fare={quote?.fares?.[vehicleType]}
          quote={quote}
          loading={busy}
          onBack={() => setStage('vehicles')}
          onConfirm={requestRide}
        />
      );
      break;
    case 'places':
      panel = (
        <SavedPlacesEditor
          places={places}
          pickup={pickup}
          destination={destination}
          onSaved={(saved) => setPlaces((p) => ({ ...p, ...saved }))}
          onClose={() => setStage('search')}
        />
      );
      break;
    case 'searching':
      panel = <SearchingDriver ride={ride} onCancel={cancelRide} cancelling={busy} />;
      break;
    case 'assigned':
      panel = <DriverAssigned ride={ride} onCancel={cancelRide} cancelling={busy} chat={chat} />;
      break;
    default:
      panel = (
        <div className="animate-fade-in">
          <h1 className="panel-title">
            {user?.fullname?.firstname ? (
              <>
                Where to, <span className="capitalize">{user.fullname.firstname}</span>?
              </>
            ) : (
              'Where to?'
            )}
          </h1>
          <p className="mb-5 mt-1 text-sm text-neutral-500">Enter your pickup and drop-off to see prices.</p>
          <LocationSearch
            pickup={pickup}
            destination={destination}
            setPickup={setPickup}
            setDestination={setDestination}
            onSubmit={getQuote}
            loading={busy}
            places={places}
            onEditPlaces={() => setStage('places')}
          />
        </div>
      );
  }

  return (
    <MapLayout
      navbar={<Navbar role="user" person={user} />}
      map={<Livetracking routePolyline={['search', 'places'].includes(stage) ? null : route} driverPosition={driverPos} />}
    >
      {panel}
      {stage === 'assigned' && <ChatSheet chat={chat} role="user" other={ride?.captain} />}
    </MapLayout>
  );
};

export default Home;
