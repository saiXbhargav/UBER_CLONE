import React from 'react';
import Avatar from '../common/Avatar';
import { RatingBadge } from '../common/StarRating';
import { formatMoney, fullName } from '../../lib/format';
import { getVehicle } from '../../lib/vehicles';

const Stat = ({ icon, label, value }) => (
  <div className="rounded-xl bg-neutral-50 p-3">
    <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
      <i className={`${icon} text-sm`} /> {label}
    </p>
    <p className="mt-1 text-lg font-bold">{value}</p>
  </div>
);

/** Driver header with online switch and today's numbers. */
const CaptainSummary = ({ captain, stats, online, onToggle, toggling }) => (
  <div>
    <div className="flex items-center gap-3">
      <Avatar person={captain} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold capitalize">{fullName(captain)}</p>
        <p className="flex items-center gap-2 text-sm text-neutral-500">
          <span className="uppercase">{captain?.vehicle?.plate}</span>·
          <span>{getVehicle(captain?.vehicle?.vehicleType).name}</span>
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={online}
        aria-label="Go online"
        onClick={onToggle}
        disabled={toggling}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-60 ${online ? 'bg-emerald-500' : 'bg-neutral-300'}`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${online ? 'left-7' : 'left-1'}`} />
      </button>
    </div>

    <div
      className={`mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
        online ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
      }`}
    >
      <span className="relative flex h-2.5 w-2.5">
        {online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
      </span>
      {online ? 'You’re online. Waiting for nearby requests…' : 'You’re offline. Go online to receive trips.'}
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <Stat icon="ri-wallet-3-line" label="Today" value={formatMoney(stats?.today?.earnings)} />
      <Stat icon="ri-route-line" label="Trips today" value={stats?.today?.rides ?? 0} />
      <Stat icon="ri-speed-up-line" label="Total distance" value={`${(stats?.total?.distanceKm ?? 0).toFixed(1)} km`} />
      <div className="rounded-xl bg-neutral-50 p-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
          <i className="ri-star-line text-sm" /> Rating
        </p>
        <div className="mt-1.5">
          <RatingBadge rating={stats?.rating || captain?.rating} />
        </div>
      </div>
    </div>
  </div>
);

export default CaptainSummary;
