import React from 'react';

export const RIDE_STATUS = {
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700' },
  canceled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700' },
  'on-going': { label: 'On trip', cls: 'bg-sky-50 text-sky-700' },
  accepted: { label: 'Accepted', cls: 'bg-amber-50 text-amber-700' },
  pending: { label: 'Searching', cls: 'bg-neutral-100 text-neutral-700' },
};

export const StatusBadge = ({ status }) => {
  const s = RIDE_STATUS[status] || RIDE_STATUS.pending;
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
};

export const KpiCard = ({ icon, label, value, hint }) => (
  <div className="card p-4 sm:p-5">
    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
      <i className={`${icon} text-base`} aria-hidden="true" /> {label}
    </p>
    <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
    {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
  </div>
);

/** Horizontal bars for small categorical breakdowns. */
export const BarList = ({ items, format = (v) => v, empty = 'No data yet' }) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.some((i) => i.value > 0)) return <p className="py-4 text-sm text-neutral-500">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium capitalize">{i.label}</span>
            <span className="tabular-nums text-neutral-600">
              {format(i.value)}
              {i.sub && <span className="ml-2 text-xs text-neutral-400">{i.sub}</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
            <div className={`h-full rounded-full ${i.color || 'bg-neutral-900'}`} style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export const Pagination = ({ page, pages, onChange, disabled }) =>
  pages > 1 ? (
    <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Pagination">
      <button type="button" className="btn-secondary px-4 py-2 text-sm" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>
        <i className="ri-arrow-left-s-line" /> Prev
      </button>
      <span className="text-sm text-neutral-500">
        Page {page} of {pages}
      </span>
      <button type="button" className="btn-secondary px-4 py-2 text-sm" disabled={disabled || page >= pages} onClick={() => onChange(page + 1)}>
        Next <i className="ri-arrow-right-s-line" />
      </button>
    </nav>
  ) : null;

export const EmptyRow = ({ icon = 'ri-inbox-line', children }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center text-sm text-neutral-500">
    <i className={`${icon} mb-2 text-3xl text-neutral-400`} aria-hidden="true" />
    {children}
  </div>
);
