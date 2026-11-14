import React from 'react';
import RouteSummary from '../common/RouteSummary';
import Spinner from '../common/Spinner';
import { getVehicle } from '../../lib/vehicles';
import { formatMoney } from '../../lib/format';

const SearchingDriver = ({ ride, onCancel, cancelling }) => {
  const vehicle = getVehicle(ride?.vehicleType);
  return (
    <div className="animate-fade-in">
      <h2 className="panel-title">Finding your driver</h2>
      <p className="mt-1 text-sm text-neutral-500">We’ve sent your request to drivers nearby.</p>

      <div className="relative mx-auto my-8 flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-neutral-900/20" />
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-neutral-900/20 [animation-delay:0.8s]" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
          <img src={vehicle.image} alt="" className="h-12 object-contain" />
        </span>
      </div>

      <RouteSummary pickup={ride?.pickup} destination={ride?.destination} compact />

      <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
        <span className="text-sm text-neutral-600">{vehicle.name} · Cash</span>
        <span className="font-bold">{formatMoney(ride?.fare)}</span>
      </div>

      <button type="button" className="btn-danger mt-5 w-full" onClick={onCancel} disabled={cancelling}>
        {cancelling ? <Spinner /> : 'Cancel request'}
      </button>
    </div>
  );
};

export default SearchingDriver;
