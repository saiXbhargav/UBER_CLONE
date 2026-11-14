import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Logo from './Logo';
import RouteSummary from './RouteSummary';
import { formatDateTime, formatKm, formatMinutes, formatMoney, fullName } from '../../lib/format';
import { getVehicle } from '../../lib/vehicles';

const Row = ({ label, value, strong }) => (
  <div className={`flex justify-between py-1.5 ${strong ? 'text-base font-bold' : 'text-sm text-neutral-700'}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

/** Printable trip receipt. Uses the browser's print dialog (Save as PDF works too). */
const ReceiptModal = ({ ride, role, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const b = ride.fareBreakdown;
  const vehicle = getVehicle(ride.vehicleType);
  const other = role === 'captain' ? ride.user : ride.captain;

  return createPortal(
    <div className="fixed inset-0 z-[1500] flex items-end justify-center bg-black/40 sm:items-center sm:p-6 print:static print:bg-white print:p-0" onClick={onClose}>
      <section
        role="dialog"
        aria-label="Trip receipt"
        onClick={(e) => e.stopPropagation()}
        className="print-area max-h-[92dvh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl print:max-h-none print:rounded-none print:shadow-none"
      >
        <div className="flex items-center justify-between">
          <Logo className="text-xl" />
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 print:hidden">
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight">Trip receipt</h2>
        <p className="text-sm text-neutral-500">
          {formatDateTime(ride.completedAt || ride.createdAt)} · #{ride._id.slice(-8).toUpperCase()}
        </p>

        <p className="mt-5 text-4xl font-bold">{formatMoney(ride.fare)}</p>
        <p className="text-sm text-neutral-500">Paid in cash</p>

        <div className="mt-6 border-t border-neutral-200 pt-4">
          {b ? (
            <>
              <Row label="Base fare" value={formatMoney(b.base)} />
              <Row label={`Distance (${formatKm(ride.distance)})`} value={formatMoney(b.distance)} />
              <Row label={`Time (${formatMinutes(ride.duration)})`} value={formatMoney(b.time)} />
              {b.surgeMultiplier > 1 && <Row label={`High demand (${b.surgeMultiplier}×)`} value={formatMoney(b.surgeAmount)} />}
            </>
          ) : (
            <Row label="Trip fare" value={formatMoney(ride.fare)} />
          )}
          <div className="mt-2 border-t border-dashed border-neutral-300 pt-2">
            <Row label="Total" value={formatMoney(ride.fare)} strong />
          </div>
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-5">
          <RouteSummary pickup={ride.pickup} destination={ride.destination} />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 text-sm">
          <span className="capitalize">
            {role === 'captain' ? 'Rider' : 'Driver'}: <span className="font-semibold">{other ? fullName(other) : '—'}</span>
          </span>
          <span>
            {vehicle.name}
            {ride.captain?.vehicle?.plate && ` · ${ride.captain.vehicle.plate.toUpperCase()}`}
          </span>
        </div>

        <button type="button" onClick={() => window.print()} className="btn-primary mt-6 w-full print:hidden">
          <i className="ri-printer-line" /> Print / save as PDF
        </button>
      </section>
    </div>,
    document.body
  );
};

export default ReceiptModal;
