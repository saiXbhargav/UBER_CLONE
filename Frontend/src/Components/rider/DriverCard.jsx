import React from 'react';
import Avatar from '../common/Avatar';
import { RatingBadge } from '../common/StarRating';
import { getVehicle } from '../../lib/vehicles';
import { fullName } from '../../lib/format';

/** Driver name, rating and vehicle. Shown once a driver accepts. */
const DriverCard = ({ captain }) => {
  const vehicle = getVehicle(captain?.vehicle?.vehicleType);
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar person={captain} size="h-14 w-14 text-lg" />
        <img src={vehicle.image} alt="" className="absolute -bottom-2 -right-6 h-8 w-12 object-contain" />
      </div>
      <div className="ml-4 min-w-0 flex-1">
        <p className="truncate font-semibold capitalize">{fullName(captain)}</p>
        <RatingBadge rating={captain?.rating} />
      </div>
      <div className="text-right">
        <p className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-sm font-bold uppercase tracking-wider">
          {captain?.vehicle?.plate}
        </p>
        <p className="mt-1 text-xs capitalize text-neutral-500">
          {captain?.vehicle?.color} {vehicle.name}
        </p>
      </div>
    </div>
  );
};

export default DriverCard;
