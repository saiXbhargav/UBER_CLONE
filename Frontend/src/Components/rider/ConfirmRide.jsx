import React from 'react';
import RouteSummary from '../common/RouteSummary';
import Spinner from '../common/Spinner';
import { getVehicle } from '../../lib/vehicles';
import { formatMoney } from '../../lib/format';

const ConfirmRide = ({ pickup, destination, vehicleType, fare, quote, onBack, onConfirm, loading }) => {
  const vehicle = getVehicle(vehicleType);
  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <h2 className="panel-title">Confirm your ride</h2>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">
        <img src={vehicle.image} alt="" className="h-16 w-24 object-contain" />
        <div className="flex-1">
          <p className="font-semibold">{vehicle.name}</p>
          <p className="text-sm text-neutral-500">{quote?.duration?.text} trip · {quote?.distance?.text}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">{formatMoney(fare)}</p>
          {quote?.surge?.multiplier > 1 && (
            <p className="text-xs font-semibold text-amber-600">
              <i className="ri-flashlight-fill" /> {quote.surge.multiplier}× surge
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <RouteSummary pickup={pickup} destination={destination} />
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
        <i className="ri-cash-line text-lg text-emerald-600" />
        Cash · pay the driver when you arrive
      </div>

      <button type="button" className="btn-primary mt-5 w-full" onClick={onConfirm} disabled={loading}>
        {loading ? <Spinner /> : `Request ${vehicle.name}`}
      </button>
    </div>
  );
};

export default ConfirmRide;
