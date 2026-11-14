import React, { useEffect, useState } from 'react';
import Avatar from '../common/Avatar';
import { Spinner } from '../common/Spinner';
import { RatingBadge } from '../common/StarRating';
import { useToast } from '../../Context/ToastContext';
import { api, getErrorMessage } from '../../lib/api';
import { formatDateTime, formatMoney, fullName } from '../../lib/format';
import { getVehicle } from '../../lib/vehicles';
import { EmptyRow, Pagination } from './ui';

const PAGE_SIZE = 15;

const DriverState = ({ captain }) => {
  if (captain.blocked) return <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Suspended</span>;
  if (captain.status === 'active')
    return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Online</span>;
  return <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">Offline</span>;
};

const DriversTab = ({ onChanged }) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ captains: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api('user')
      .get('/admin/captains', { search: query || undefined, page, limit: PAGE_SIZE })
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && toast.error(getErrorMessage(err, 'Could not load drivers')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, page, toast]);

  const toggleBlock = async (c) => {
    const next = !c.blocked;
    const name = fullName(c);
    const ok = window.confirm(
      next
        ? `Suspend ${name}? They will be signed out of new sessions, go offline and stop receiving rides.`
        : `Restore ${name}'s account?`
    );
    if (!ok) return;
    setBusyId(c._id);
    try {
      const { captain } = await api('user').patch(`/admin/captains/${c._id}/block`, { blocked: next });
      setData((d) => ({ ...d, captains: d.captains.map((x) => (x._id === c._id ? { ...x, ...captain } : x)) }));
      toast.success(next ? `${name} suspended` : `${name} restored`);
      onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const actionButton = (c) => (
    <button
      type="button"
      onClick={() => toggleBlock(c)}
      disabled={busyId === c._id}
      className={`${c.blocked ? 'btn-secondary' : 'btn-danger'} px-3 py-1.5 text-sm`}
    >
      {busyId === c._id ? <Spinner className="h-4 w-4" /> : c.blocked ? 'Restore' : 'Suspend'}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <input
            type="search"
            className="input py-2.5 pl-10"
            placeholder="Search name, email or plate"
            aria-label="Search drivers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-sm text-neutral-500">{data.total} drivers</p>
      </div>

      <div className="card relative mt-4 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {!loading && data.captains.length === 0 ? (
          <EmptyRow icon="ri-steering-2-line">{query ? 'No drivers match your search.' : 'No drivers have signed up yet.'}</EmptyRow>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Driver</th>
                    <th scope="col" className="px-4 py-3 font-medium">Vehicle</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium">Rating</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Trips</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Earned</th>
                    <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.captains.map((c) => (
                    <tr key={c._id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar person={c} size="h-9 w-9 text-xs" dark={false} />
                          <div className="min-w-0">
                            <p className="truncate font-medium capitalize">{fullName(c)}</p>
                            <p className="truncate text-xs text-neutral-500">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-mono text-xs font-semibold uppercase">{c.vehicle?.plate}</p>
                        <p className="text-xs capitalize text-neutral-500">
                          {c.vehicle?.color} {getVehicle(c.vehicle?.vehicleType).name}
                        </p>
                      </td>
                      <td className="px-4 py-3"><DriverState captain={c} /></td>
                      <td className="whitespace-nowrap px-4 py-3"><RatingBadge rating={c.rating} /></td>
                      <td className="px-4 py-3 text-right tabular-nums">{c.trips}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatMoney(c.earnings)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{formatDateTime(c.createdAt)}</td>
                      <td className="px-4 py-3 text-right">{actionButton(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-neutral-100 md:hidden">
              {data.captains.map((c) => (
                <li key={c._id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar person={c} size="h-10 w-10 text-sm" dark={false} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium capitalize">{fullName(c)}</p>
                      <p className="truncate text-xs text-neutral-500">
                        <span className="font-mono uppercase">{c.vehicle?.plate}</span> · {getVehicle(c.vehicle?.vehicleType).name}
                      </p>
                    </div>
                    <DriverState captain={c} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="flex items-center gap-3 text-sm text-neutral-600">
                      <RatingBadge rating={c.rating} />
                      <span>{c.trips} trips</span>
                      <span>{formatMoney(c.earnings)}</span>
                    </p>
                    {actionButton(c)}
                  </div>
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

export default DriversTab;
