import React from 'react';
import { shortPlace } from '../../lib/format';

/** Pickup → destination with a connecting line, used across rider and driver screens. */
const RouteSummary = ({ pickup, destination, compact = false }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center pt-1.5" aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />
      <span className="my-1 w-px flex-1 bg-neutral-300" />
      <span className="h-2.5 w-2.5 bg-neutral-900" />
    </div>
    <div className="min-w-0 flex-1 space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Pickup</p>
        <p className={`font-semibold ${compact ? 'truncate text-sm' : ''}`}>{shortPlace(pickup)}</p>
        {!compact && <p className="truncate text-sm text-neutral-500">{pickup}</p>}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Drop-off</p>
        <p className={`font-semibold ${compact ? 'truncate text-sm' : ''}`}>{shortPlace(destination)}</p>
        {!compact && <p className="truncate text-sm text-neutral-500">{destination}</p>}
      </div>
    </div>
  </div>
);

export default RouteSummary;
