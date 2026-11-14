import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/common/Navbar';
import RouteSummary from '../Components/common/RouteSummary';
import StarRating from '../Components/common/StarRating';
import { Spinner } from '../Components/common/Spinner';
import { UserDataContext } from '../Context/Usercontext';
import { CaptainDataContext } from '../Context/CaptainContext';
import { useToast } from '../Context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import { formatDateTime, formatKm, formatMoney, fullName } from '../lib/format';
import { getVehicle } from '../lib/vehicles';
import ReceiptModal from '../Components/common/ReceiptModal';

const STATUS = {
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700' },
  canceled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700' },
  'on-going': { label: 'On trip', cls: 'bg-sky-50 text-sky-700' },
  accepted: { label: 'Driver assigned', cls: 'bg-amber-50 text-amber-700' },
  pending: { label: 'Searching', cls: 'bg-neutral-100 text-neutral-700' },
};

const PAGE_SIZE = 10;

/** Trip history for riders, or trips + earnings for drivers. */
const History = ({ role }) => {
  const isCaptain = role === 'captain';
  const { user } = useContext(UserDataContext);
  const { captain } = useContext(CaptainDataContext);
  const toast = useToast();

  const [rides, setRides] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(
    async (next) => {
      setLoading(true);
      try {
        const data = await api(role).get('/rides/history', { page: next, limit: PAGE_SIZE });
        setRides((prev) => (next === 1 ? data.rides : [...prev, ...data.rides]));
        setPage(data.page);
        setPages(data.pages);
        setTotal(data.total);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Could not load your trips'));
      } finally {
        setLoading(false);
      }
    },
    [role, toast]
  );

  useEffect(() => {
    load(1);
    if (isCaptain) api('captain').get('/captains/stats').then(setStats).catch(() => {});
  }, [load, isCaptain]);

  return (
    <div className="min-h-[100dvh] bg-neutral-50">
      <Navbar role={role} person={isCaptain ? captain : user} floating={false} />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight">{isCaptain ? 'Trips & earnings' : 'My trips'}</h1>
        <p className="mt-1 text-neutral-500">{total ? `${total} trip${total === 1 ? '' : 's'}` : 'Your past rides will show up here.'}</p>

        {isCaptain && stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Today', formatMoney(stats.today?.earnings)],
              ['Trips today', stats.today?.rides ?? 0],
              ['Total earned', formatMoney(stats.total?.earnings)],
              ['Total trips', stats.total?.rides ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="card p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        )}

        <ul className="mt-8 space-y-3">
          {rides.map((ride) => {
            const other = isCaptain ? ride.user : ride.captain;
            const status = STATUS[ride.status] || STATUS.pending;
            return (
              <li key={ride._id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img src={getVehicle(ride.vehicleType).image} alt="" className="h-10 w-14 object-contain" />
                    <div>
                      <p className="font-semibold">{formatDateTime(ride.createdAt)}</p>
                      <p className="text-sm capitalize text-neutral-500">
                        {other ? `${isCaptain ? 'Rider' : 'Driver'}: ${fullName(other)}` : getVehicle(ride.vehicleType).name}
                        {ride.distance > 0 && ` · ${formatKm(ride.distance)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                    <span className="text-lg font-bold">{formatMoney(ride.fare)}</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-neutral-100 pt-4">
                  <RouteSummary pickup={ride.pickup} destination={ride.destination} compact />
                </div>
                {(ride.rating?.score || ride.status === 'completed') && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-neutral-500">
                      {ride.rating?.score && <StarRating value={ride.rating.score} size="text-base" />}
                      {ride.rating?.comment && <span className="truncate">“{ride.rating.comment}”</span>}
                    </div>
                    {ride.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => setReceipt(ride)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
                      >
                        <i className="ri-file-list-3-line" /> Receipt
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {loading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {!loading && rides.length === 0 && (
          <div className="card mt-2 flex flex-col items-center px-6 py-14 text-center">
            <i className="ri-road-map-line text-4xl text-neutral-400" />
            <p className="mt-3 font-semibold">No trips yet</p>
            <p className="mt-1 text-sm text-neutral-500">
              {isCaptain ? 'Go online to start receiving ride requests.' : 'Book your first ride in a few taps.'}
            </p>
            <Link to={isCaptain ? '/captain-home' : '/home'} className="btn-primary mt-5">
              {isCaptain ? 'Go online' : 'Book a ride'}
            </Link>
          </div>
        )}

        {!loading && page < pages && (
          <button type="button" className="btn-secondary mx-auto mt-6 flex" onClick={() => load(page + 1)}>
            Load more
          </button>
        )}
      </main>
      {receipt && <ReceiptModal ride={receipt} role={role} onClose={() => setReceipt(null)} />}
    </div>
  );
};

export default History;
