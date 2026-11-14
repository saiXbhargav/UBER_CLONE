export const formatMoney = (value) =>
  `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

export const formatKm = (meters) => `${((Number(meters) || 0) / 1000).toFixed(1)} km`;

export const formatMinutes = (seconds) => {
  const mins = Math.max(1, Math.round((Number(seconds) || 0) / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};

export const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const fullName = (person) =>
  [person?.fullname?.firstname, person?.fullname?.lastname].filter(Boolean).join(' ') || 'Unknown';

export const initials = (person) =>
  [person?.fullname?.firstname, person?.fullname?.lastname]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('') || '?';

/** Shorten "Street, Area, City, State, Country" to its first two parts for headings. */
export const shortPlace = (place = '') => place.split(',').slice(0, 2).join(',').trim();
