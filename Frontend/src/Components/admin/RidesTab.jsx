import React, { useEffect, useState } from 'react';
import { Spinner } from '../common/Spinner';
import { useToast } from '../../Context/ToastContext';
import { api, getErrorMessage } from '../../lib/api';
import { formatDateTime, formatKm, formatMoney, fullName, shortPlace } from '../../lib/format';
import { getVehicle } from '../../lib/vehicles';
import { EmptyRow, Pagination, StatusBadge } from './ui';

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'canceled', label: 'Cancelled' },
];

const PAGE_SIZE = 15;

const RidesTab = () => {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rides: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api('user')
      .get('/admin/rides', { status: status || undefined, page, limit: PAGE_SIZE })
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && toast.error(getErrorMessage(err, 'Could not load rides')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, page, toast]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.id || 'all'}
              type="button"
              aria-pressed={status === f.id}
              onClick={() => {
                setStatus(f.id);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                status === f.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-neutral-500">{data.total} rides</p>
      </div>

      <div className="card relative mt-4 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {!loading && data.rides.length === 0 ? (
          <EmptyRow icon="ri-road-map-line">No rides match this filter.</EmptyRow>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">When</th>
                    <th scope="col" className="px-4 py-3 font-medium">Rider</th>
                    <th scope="col" className="px-4 py-3 font-medium">Driver</th>
                    <th scope="col" className="px-4 py-3 font-medium">Route</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Fare</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.rides.map((r) => (
                    <tr key={r._id} className="align-top hover:bg-neutral-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium">{formatDateTime(r.createdAt)}</p>
                        <p className="text-xs text-neutral-500">
                          {getVehicle(r.vehicleType).name}
                          {r.distance > 0 && ` · ${formatKm(r.distance)}`}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="capitalize">{fullName(r.user)}</p>
                        <p className="text-xs text-neutral-500">{r.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {r.captain ? (
                          <>
                            <p className="capitalize">{fullName(r.captain)}</p>
                            <p className="text-xs uppercase text-neutral-500">{r.captain.vehicle?.plate}</p>
                          </>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="max-w-[260px] px-4 py-3">
                        <p className="truncate">{shortPlace(r.pickup)}</p>
                        <p className="truncate text-neutral-500">→ {shortPlace(r.destination)}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(r.fare)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                        {r.status === 'canceled' && r.cancelledBy && (
                          <p className="mt-1 text-xs text-neutral-500">by {r.cancelledBy === 'captain' ? 'driver' : r.cancelledBy}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-neutral-100 md:hidden">
              {data.rides.map((r) => (
                <li key={r._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{formatDateTime(r.createdAt)}</p>
                      <p className="truncate text-sm capitalize text-neutral-500">
                        {fullName(r.user)}
                        {r.captain && ` → ${fullName(r.captain)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatMoney(r.fare)}</p>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                  <p className="mt-2 truncate text-sm text-neutral-600">
                    {shortPlace(r.pickup)} → {shortPlace(r.destination)}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Pagination page={page} pages={data.pages} onChange={setPage} disabled={loading} />
    </div>
  );
};

export default RidesTab;
