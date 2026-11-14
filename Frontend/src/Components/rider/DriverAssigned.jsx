import React from 'react';
import DriverCard from './DriverCard';
import RouteSummary from '../common/RouteSummary';
import Spinner from '../common/Spinner';
import { formatMoney } from '../../lib/format';
import { ChatButton } from '../common/ChatSheet';

const DriverAssigned = ({ ride, onCancel, cancelling, chat }) => (
  <div className="animate-fade-in">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="panel-title">Your driver is on the way</h2>
        <p className="mt-1 text-sm text-neutral-500">Meet them at the pickup point.</p>
      </div>
    </div>

    <div className="mt-5 flex items-center justify-between rounded-2xl bg-neutral-900 px-5 py-4 text-white">
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-400">Share this PIN with your driver</p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em]">{ride?.otp || '••••••'}</p>
      </div>
      <i className="ri-shield-check-line text-3xl text-emerald-400" />
    </div>

    <div className="mt-5">
      <DriverCard captain={ride?.captain} />
    </div>

    <div className="mt-6 border-t border-neutral-100 pt-5">
      <RouteSummary pickup={ride?.pickup} destination={ride?.destination} compact />
    </div>

    <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-neutral-600">
        <i className="ri-cash-line text-emerald-600" /> Cash
      </span>
      <span className="font-bold">{formatMoney(ride?.fare)}</span>
    </div>

    <div className="mt-5 grid grid-cols-2 gap-3">
      {chat && <ChatButton chat={chat} />}
      <button type="button" className={`btn-danger ${chat ? '' : 'col-span-2'}`} onClick={onCancel} disabled={cancelling}>
        {cancelling ? <Spinner /> : 'Cancel ride'}
      </button>
    </div>
  </div>
);

export default DriverAssigned;
