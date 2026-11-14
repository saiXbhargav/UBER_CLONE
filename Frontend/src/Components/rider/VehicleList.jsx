import React from 'react';
import { VEHICLE_LIST } from '../../lib/vehicles';
import { formatMoney } from '../../lib/format';

const VehicleList = ({ quote, selected, onSelect, onBack, onContinue }) => (
  <div className="animate-fade-in">
    <div className="mb-4 flex items-center gap-3">
      <button type="button" onClick={onBack} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
        <i className="ri-arrow-left-line text-xl" />
      </button>
      <div>
        <h2 className="panel-title">Choose a ride</h2>
        <p className="text-sm text-neutral-500">
          {quote.distance?.text} · about {quote.duration?.text}
        </p>
      </div>
    </div>

    {quote.surge?.multiplier > 1 && (
      <div className="mb-3 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <i className="ri-flashlight-fill mt-0.5 text-amber-500" />
        <p>
          <span className="font-semibold">High demand · {quote.surge.multiplier}×</span>
          <br />
          {quote.surge.demand} requests and {quote.surge.supply || 'no'} free driver{quote.surge.supply === 1 ? '' : 's'} nearby. Prices
          are temporarily higher.
        </p>
      </div>
    )}

    <div className="space-y-2" role="radiogroup" aria-label="Vehicle">
      {VEHICLE_LIST.map((v) => {
        const isSelected = selected === v.id;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(v.id)}
            onDoubleClick={() => onContinue(v.id)}
            className={`flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition ${
              isSelected ? 'border-neutral-900 bg-neutral-50' : 'border-transparent hover:bg-neutral-50'
            }`}
          >
            <img src={v.image} alt="" className="h-14 w-20 shrink-0 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold">
                {v.name}
                <span className="flex items-center gap-0.5 text-sm font-normal text-neutral-500">
                  <i className="ri-user-3-fill text-xs" /> {v.seats}
                </span>
              </p>
              <p className="truncate text-sm text-neutral-500">{v.tagline}</p>
            </div>
            <p className="text-lg font-bold">{formatMoney(quote.fares?.[v.id])}</p>
          </button>
        );
      })}
    </div>

    <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
      <i className="ri-money-rupee-circle-line text-lg" /> Pay in cash at the end of the trip
    </div>

    <button type="button" className="btn-primary mt-4 w-full" disabled={!selected} onClick={() => onContinue(selected)}>
      Continue
    </button>
  </div>
);

export default VehicleList;
