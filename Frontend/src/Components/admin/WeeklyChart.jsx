import React from 'react';
import { formatMoney } from '../../lib/format';

const H = 160; // drawing height in SVG units
const COL = 100; // width per day in SVG units

const dayLabel = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short' });
};

/**
 * Rides per day for the last 7 days. Bars are SVG (stretched to the container width);
 * text lives in HTML so it stays crisp and readable on narrow screens.
 * Dark segment = completed rides, light = all other rides.
 */
const WeeklyChart = ({ days = [] }) => {
  const max = Math.max(1, ...days.map((d) => d.rides));
  const totalRides = days.reduce((s, d) => s + d.rides, 0);
  const totalRevenue = days.reduce((s, d) => s + d.revenue, 0);
  const summary = days.map((d) => `${dayLabel(d.date)}: ${d.rides} rides, ${d.completed} completed, ${formatMoney(d.revenue)}`).join('; ');

  return (
    <figure>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <figcaption className="font-semibold">Last 7 days</figcaption>
        <p className="text-sm text-neutral-500">
          {totalRides} rides · {formatMoney(totalRevenue)} revenue
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium tabular-nums text-neutral-500 sm:text-xs" aria-hidden="true">
        {days.map((d) => (
          <span key={d.date} className="truncate">
            {d.revenue ? formatMoney(d.revenue) : '–'}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${COL * days.length || COL} ${H}`}
        preserveAspectRatio="none"
        className="mt-2 h-40 w-full sm:h-48"
        role="img"
        aria-label={`Rides per day. ${summary}`}
      >
        <title>{`Rides per day. ${summary}`}</title>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={COL * days.length} y1={H * f} y2={H * f} stroke="#e5e5e5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {days.map((d, i) => {
          const all = (d.rides / max) * (H - 4);
          const done = (d.completed / max) * (H - 4);
          const x = i * COL + COL * 0.2;
          const w = COL * 0.6;
          return (
            <g key={d.date}>
              <title>{`${dayLabel(d.date)} ${d.date}: ${d.rides} rides, ${d.completed} completed, ${formatMoney(d.revenue)}`}</title>
              <rect x={x} y={H - all} width={w} height={Math.max(all, d.rides ? 2 : 0)} rx="6" fill="#d4d4d4" />
              <rect x={x} y={H - done} width={w} height={done} rx="6" fill="#171717" />
            </g>
          );
        })}
        <line x1="0" x2={COL * days.length} y1={H - 0.5} y2={H - 0.5} stroke="#a3a3a3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs" aria-hidden="true">
        {days.map((d) => (
          <div key={d.date}>
            <p className="font-semibold text-neutral-900">{d.rides}</p>
            <p className="text-neutral-500">{dayLabel(d.date)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-neutral-900" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-neutral-300" /> Other rides
        </span>
      </div>
    </figure>
  );
};

export default WeeklyChart;
