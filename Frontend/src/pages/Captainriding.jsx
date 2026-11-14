import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapLayout from '../Components/common/MapLayout';
import Navbar from '../Components/common/Navbar';
import Livetracking from '../Components/Livetracking';
import Avatar from '../Components/common/Avatar';
import RouteSummary from '../Components/common/RouteSummary';
import { Spinner } from '../Components/common/Spinner';
import { CaptainDataContext } from '../Context/CaptainContext';
import { useToast } from '../Context/ToastContext';
import useCaptainLocation from '../hooks/useCaptainLocation';
import { api, getErrorMessage } from '../lib/api';
import { formatKm, formatMinutes, formatMoney, fullName, shortPlace } from '../lib/format';
import { directionsUrl } from '../lib/navigation';
import ChatSheet, { ChatButton } from '../Components/common/ChatSheet';
import useRideChat from '../hooks/useRideChat';

const Captainriding = () => {
  const { captain } = useContext(CaptainDataContext);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [ride, setRide] = useState(location.state?.ride || null);
  const [route, setRoute] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [ending, setEnding] = useState(false);
  const chat = useRideChat(ride?._id, 'captain');

  // Keep the rider's map updated while driving.
  useCaptainLocation(true);

  useEffect(() => {
    api('captain')
      .get('/rides/active')
      .then(({ ride: active }) => {
        if (active?.status === 'on-going') setRide(active);
        else navigate('/captain-home', { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (!ride?.pickup) return;
    api('captain')
      .get('/maps/get-distance-time', { origin: ride.pickup, destination: ride.destination })
      .then((d) => setRoute(d.polyline || null))
      .catch(() => setRoute(null));
  }, [ride?.pickup, ride?.destination]);

  const endRide = useCallback(async () => {
    setEnding(true);
    try {
      await api('captain').post('/rides/end', { rideId: ride._id });
      toast.success(`Trip complete · ${formatMoney(ride.fare)} earned`);
      navigate('/captain-home');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not complete the trip'));
      setEnding(false);
    }
  }, [ride, toast, navigate]);

  if (!ride) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <MapLayout navbar={<Navbar role="captain" person={captain} />} map={<Livetracking routePolyline={route} />}>
      <div className="animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-600">On trip</p>
            <h2 className="panel-title">Drop off at {shortPlace(ride.destination).split(',')[0]}</h2>
          </div>
          {ride.duration > 0 && (
            <div className="shrink-0 rounded-xl bg-neutral-100 px-3 py-2 text-center">
              <p className="text-lg font-bold leading-none">{formatMinutes(ride.duration)}</p>
              <p className="text-xs text-neutral-500">{formatKm(ride.distance)}</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
          <Avatar person={ride.user} dark={false} />
          <p className="min-w-0 flex-1 truncate font-semibold capitalize">{fullName(ride.user)}</p>
          <p className="text-xl font-bold">{formatMoney(ride.fare)}</p>
        </div>

        <div className="mt-5">
          <RouteSummary pickup={ride.pickup} destination={ride.destination} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a href={directionsUrl(ride.destination, ride.destinationCoords)} target="_blank" rel="noreferrer" className="btn-secondary">
            <i className="ri-navigation-line" /> Navigate
          </a>
          <ChatButton chat={chat} />
        </div>

        {confirming ? (
          <div className="mt-5 animate-fade-in rounded-2xl border-2 border-neutral-900 p-4">
            <p className="font-semibold">Collect {formatMoney(ride.fare)} in cash</p>
            <p className="mt-1 text-sm text-neutral-500">Confirm once the rider has paid and left the vehicle.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" className="btn-secondary" onClick={() => setConfirming(false)} disabled={ending}>
                Back
              </button>
              <button type="button" className="btn-success" onClick={endRide} disabled={ending}>
                {ending ? <Spinner /> : 'Cash collected'}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn-primary mt-3 w-full" onClick={() => setConfirming(true)}>
            Complete trip
          </button>
        )}
      </div>
      <ChatSheet chat={chat} role="captain" other={ride.user} />
    </MapLayout>
  );
};

export default Captainriding;
