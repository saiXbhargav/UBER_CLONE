import React from 'react';
import Avatar from '../common/Avatar';
import RouteSummary from '../common/RouteSummary';
import Spinner from '../common/Spinner';
import { formatKm, formatMinutes, formatMoney, fullName } from '../../lib/format';
import { getVehicle } from '../../lib/vehicles';

const RideRequestCard = ({ ride, onAccept, onIgnore, accepting }) => (
  <div className="animate-slide-up rounded-2xl border-2 border-neutral-900 bg-white p-4 shadow-lg">
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar person={ride.user} size="h-11 w-11 text-sm" dark={false} />
        <div className="min-w-0">
          <p className="truncate font-semibold capitalize">{fullName(ride.user)}</p>
          <p className="text-xs text-neutral-500">
            {getVehicle(ride.vehicleType).name}
            {ride.distance > 0 && ` · ${formatKm(ride.distance)} · ${formatMinutes(ride.duration)}`}
          </p>
        </div>
      </div>
      <p className="text-2xl font-bold">{formatMoney(ride.fare)}</p>
    </div>

    <div className="mt-4">
      <RouteSummary pickup={ride.pickup} destination={ride.destination} compact />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <button type="button" className="btn-secondary py-2.5" onClick={onIgnore} disabled={accepting}>
        Ignore
      </button>
      <button type="button" className="btn-success py-2.5" onClick={onAccept} disabled={accepting}>
        {accepting ? <Spinner /> : 'Accept'}
      </button>
    </div>
  </div>
);

export default RideRequestCard;
