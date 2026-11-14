import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapLayout from '../Components/common/MapLayout';
import Navbar from '../Components/common/Navbar';
import Livetracking from '../Components/Livetracking';
import Avatar from '../Components/common/Avatar';
import RouteSummary from '../Components/common/RouteSummary';
import { Spinner } from '../Components/common/Spinner';
import CaptainSummary from '../Components/captain/CaptainSummary';
import RideRequestCard from '../Components/captain/RideRequestCard';
import { CaptainDataContext } from '../Context/CaptainContext';
import { useSocketEvent } from '../Context/SocketContext';
import { useToast } from '../Context/ToastContext';
import useCaptainLocation from '../hooks/useCaptainLocation';
import { api, getErrorMessage } from '../lib/api';
import { formatMoney, fullName } from '../lib/format';
import { directionsUrl } from '../lib/navigation';
import ChatSheet, { ChatButton } from '../Components/common/ChatSheet';
import useRideChat from '../hooks/useRideChat';

const Captainhome = () => {
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [route, setRoute] = useState(null);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(null); // which action is in flight
  const [loading, setLoading] = useState(true);
  const chat = useRideChat(activeRide?._id, 'captain');

  const activeRideRef = useRef(null);
  activeRideRef.current = activeRide;

  const online = captain?.status === 'active';
  const position = useCaptainLocation(online || !!activeRide);

  const loadStats = useCallback(() => {
    api('captain')
      .get('/captains/stats')
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadStats();
    api('captain')
      .get('/rides/active')
      .then(({ ride }) => {
        if (ride?.status === 'on-going') navigate('/captain-riding', { replace: true, state: { ride } });
        else if (ride) setActiveRide(ride);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadStats, navigate]);

  // Route from the driver to the pickup, fetched once per accepted ride.
  const routedFor = useRef(null);
  useEffect(() => {
    if (!activeRide) {
      routedFor.current = null;
      setRoute(null);
      return;
    }
    if (!position || routedFor.current === activeRide._id) return;
    routedFor.current = activeRide._id;
    api('captain')
      .get('/maps/get-distance-time', { origin: `${position.lng},${position.lat}`, destination: activeRide.pickup })
      .then((d) => setRoute(d.polyline || null))
      .catch(() => setRoute(null));
  }, [activeRide, position]);

  // --- realtime ------------------------------------------------------------
  useSocketEvent(
    'new-ride',
    useCallback((ride) => {
      setRequests((list) => (list.some((r) => r._id === ride._id) ? list : [ride, ...list]));
      navigator.vibrate?.(200);
    }, [])
  );

  useSocketEvent(
    'ride-unavailable',
    useCallback(({ rideId }) => setRequests((list) => list.filter((r) => r._id !== rideId)), [])
  );

  useSocketEvent(
    'ride-canceled',
    useCallback(
      ({ rideId, by }) => {
        setRequests((list) => list.filter((r) => r._id !== rideId));
        if (activeRideRef.current?._id === rideId && by !== 'captain') {
          toast.error('The rider cancelled this trip.');
          setActiveRide(null);
        }
      },
      [toast]
    )
  );

  // --- actions ---------------------------------------------------------------
  const toggleOnline = async () => {
    setBusy('toggle');
    try {
      const { captain: updated } = await api('captain').patch('/captains/status', {
        status: online ? 'inactive' : 'active',
      });
      setCaptain((c) => ({ ...c, ...updated }));
      if (online) setRequests([]);
      toast.info(online ? 'You are offline' : 'You are online');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const accept = async (ride) => {
    setBusy(ride._id);
    try {
      const confirmed = await api('captain').post('/rides/confirm', { rideId: ride._id });
      setActiveRide(confirmed);
      setRequests([]);
      setOtp('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'This ride is no longer available'));
      setRequests((list) => list.filter((r) => r._id !== ride._id));
    } finally {
      setBusy(null);
    }
  };

  const startRide = async (e) => {
    e.preventDefault();
    setBusy('start');
    try {
      const ride = await api('captain').post('/rides/start', { rideId: activeRide._id, otp });
      navigate('/captain-riding', { state: { ride } });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not start the ride'));
      setBusy(null);
    }
  };

  const cancelRide = async () => {
    if (!window.confirm('Cancel this trip? The rider will be notified.')) return;
    setBusy('cancel');
    try {
      await api('captain').post('/rides/cancel', { rideId: activeRide._id });
      setActiveRide(null);
      toast.info('Trip cancelled');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  // --- render ---------------------------------------------------------------
  let panel;
  if (loading) {
    panel = (
      <div className="flex justify-center py-10">
        <Spinner className="h-6 w-6" />
      </div>
    );
  } else if (activeRide) {
    panel = (
      <div className="animate-fade-in">
        <p className="text-sm font-medium text-emerald-600">Trip accepted</p>
        <h2 className="panel-title">Pick up {activeRide.user?.fullname?.firstname || 'your rider'}</h2>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
          <Avatar person={activeRide.user} dark={false} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold capitalize">{fullName(activeRide.user)}</p>
            <p className="text-sm text-neutral-500">Cash trip</p>
          </div>
          <p className="text-xl font-bold">{formatMoney(activeRide.fare)}</p>
        </div>

        <div className="mt-5">
          <RouteSummary pickup={activeRide.pickup} destination={activeRide.destination} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a href={directionsUrl(activeRide.pickup, activeRide.pickupCoords)} target="_blank" rel="noreferrer" className="btn-secondary">
            <i className="ri-navigation-line" /> Navigate
          </a>
          <ChatButton chat={chat} />
        </div>

        <form onSubmit={startRide} className="mt-6 border-t border-neutral-100 pt-5">
          <label htmlFor="otp" className="label">
            Ask the rider for their 6-digit PIN
          </label>
          <input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="input text-center font-mono text-2xl tracking-[0.5em]"
          />
          <button className="btn-primary mt-4 w-full" disabled={otp.length !== 6 || busy === 'start'}>
            {busy === 'start' ? <Spinner /> : 'Start trip'}
          </button>
        </form>
        <button type="button" onClick={cancelRide} disabled={busy === 'cancel'} className="btn-danger mt-3 w-full">
          {busy === 'cancel' ? <Spinner /> : 'Cancel trip'}
        </button>
      </div>
    );
  } else {
    panel = (
      <div className="animate-fade-in">
        <CaptainSummary captain={captain} stats={stats} online={online} onToggle={toggleOnline} toggling={busy === 'toggle'} />

        {online && (
          <section className="mt-6" aria-live="polite">
            <h3 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Ride requests
              {requests.length > 0 && (
                <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">{requests.length}</span>
              )}
            </h3>
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
                <i className="ri-radar-line mb-2 block text-3xl text-neutral-400" />
                New requests near you will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <RideRequestCard
                    key={r._id}
                    ride={r}
                    accepting={busy === r._id}
                    onAccept={() => accept(r)}
                    onIgnore={() => setRequests((list) => list.filter((x) => x._id !== r._id))}
                  />
                ))}
              </div>
            )}
          </section>
        )}
        {!position && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <i className="ri-map-pin-line mt-0.5" /> Allow location access so riders near you can find you.
          </p>
        )}
      </div>
    );
  }

  return (
    <MapLayout
      navbar={<Navbar role="captain" person={captain} />}
      map={<Livetracking routePolyline={route} routeLabels={[null, 'Pickup']} />}
    >
      {panel}
      {activeRide && <ChatSheet chat={chat} role="captain" other={activeRide.user} />}
    </MapLayout>
  );
};

export default Captainhome;
