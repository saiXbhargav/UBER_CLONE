import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapLayout from '../Components/common/MapLayout';
import Navbar from '../Components/common/Navbar';
import Livetracking from '../Components/Livetracking';
import RouteSummary from '../Components/common/RouteSummary';
import StarRating from '../Components/common/StarRating';
import { Spinner } from '../Components/common/Spinner';
import DriverCard from '../Components/rider/DriverCard';
import { UserDataContext } from '../Context/Usercontext';
import { useSocketEvent } from '../Context/SocketContext';
import { useToast } from '../Context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import ChatSheet, { ChatButton } from '../Components/common/ChatSheet';
import useRideChat from '../hooks/useRideChat';
import { formatKm, formatMinutes, formatMoney, fullName, shortPlace } from '../lib/format';

const RATING_LABELS = ['', 'Poor', 'Could be better', 'Okay', 'Good', 'Excellent'];

const Riding = () => {
  const { user } = useContext(UserDataContext);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [ride, setRide] = useState(location.state?.ride || null);
  const [phase, setPhase] = useState('riding'); // riding | rate
  const [route, setRoute] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const chat = useRideChat(phase === 'riding' ? ride?._id : null, 'user');

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Always confirm with the server so a refresh or a stale link still works.
  useEffect(() => {
    api('user')
      .get('/rides/active')
      .then(({ ride: active }) => {
        if (active?.status === 'on-going') setRide(active);
        else if (phaseRef.current !== 'rate') navigate('/home', { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (!ride?.pickup) return;
    api('user')
      .get('/maps/get-distance-time', { origin: ride.pickup, destination: ride.destination })
      .then((d) => setRoute(d.polyline || null))
      .catch(() => setRoute(null));
  }, [ride?.pickup, ride?.destination]);

  useSocketEvent(
    'captain-location',
    useCallback(({ lat, lng }) => setDriverPos({ lat, lng }), [])
  );

  useSocketEvent(
    'ride-ended',
    useCallback((ended) => {
      setRide((r) => ({ ...r, ...ended, captain: ended?.captain || r?.captain }));
      setPhase('rate');
    }, [])
  );

  const shareTrip = async () => {
    const text = `I'm on a ride from ${shortPlace(ride.pickup)} to ${shortPlace(ride.destination)} with ${fullName(
      ride.captain
    )} (${ride.captain?.vehicle?.plate?.toUpperCase()}).`;
    try {
      if (navigator.share) await navigator.share({ title: 'My trip', text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success('Trip details copied — paste them to a friend');
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const submitRating = async () => {
    setSubmitting(true);
    try {
      await api('user').post('/rides/rate', { rideId: ride._id, score, comment: comment.trim() || undefined });
      toast.success('Thanks for rating your trip!');
      navigate('/home');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save your rating'));
      setSubmitting(false);
    }
  };

  if (!ride) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const panel =
    phase === 'rate' ? (
      <div className="animate-fade-in text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <i className="ri-flag-2-fill text-3xl text-emerald-600" />
        </div>
        <h2 className="panel-title mt-4">You’ve arrived</h2>
        <p className="mt-1 text-neutral-500">
          Please pay <span className="font-semibold text-neutral-900">{formatMoney(ride.fare)}</span> in cash to your driver.
        </p>

        <div className="mt-6 rounded-2xl bg-neutral-50 p-5">
          <p className="font-semibold">How was your trip with {ride.captain?.fullname?.firstname || 'your driver'}?</p>
          <div className="mt-3 flex justify-center">
            <StarRating value={score} onChange={setScore} size="text-4xl" />
          </div>
          <p className="mt-1 h-5 text-sm text-neutral-500">{RATING_LABELS[score]}</p>
          <textarea
            className="input mt-3 min-h-[80px] resize-none text-sm"
            placeholder="Add a comment (optional)"
            maxLength={300}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button type="button" className="btn-primary mt-5 w-full" disabled={!score || submitting} onClick={submitRating}>
          {submitting ? <Spinner /> : 'Submit rating'}
        </button>
        <button type="button" className="mt-3 w-full py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900" onClick={() => navigate('/home')}>
          Skip
        </button>
      </div>
    ) : (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">On trip</p>
            <h2 className="panel-title">Heading to {shortPlace(ride.destination).split(',')[0]}</h2>
          </div>
          {ride.duration > 0 && (
            <div className="rounded-xl bg-neutral-100 px-3 py-2 text-center">
              <p className="text-lg font-bold leading-none">{formatMinutes(ride.duration)}</p>
              <p className="text-xs text-neutral-500">{formatKm(ride.distance)}</p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-200 p-4">
          <DriverCard captain={ride.captain} />
        </div>

        <div className="mt-5">
          <RouteSummary pickup={ride.pickup} destination={ride.destination} compact />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-neutral-600">
            <i className="ri-cash-line text-emerald-600" /> Pay in cash
          </span>
          <span className="text-lg font-bold">{formatMoney(ride.fare)}</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <ChatButton chat={chat} className="btn-secondary px-2 text-sm" />
          <button type="button" className="btn-secondary px-2 text-sm" onClick={shareTrip}>
            <i className="ri-share-forward-line" /> Share
          </button>
          <a href="tel:112" className="btn-danger px-2 text-sm">
            <i className="ri-alarm-warning-line" /> SOS
          </a>
        </div>
      </div>
    );

  return (
    <MapLayout
      navbar={<Navbar role="user" person={user} />}
      map={<Livetracking routePolyline={route} driverPosition={driverPos} />}
    >
      {panel}
      <ChatSheet chat={chat} role="user" other={ride.captain} />
    </MapLayout>
  );
};

export default Riding;
