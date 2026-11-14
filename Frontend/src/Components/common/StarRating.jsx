import React from 'react';

/** Interactive when onChange is passed, otherwise read-only. */
const StarRating = ({ value = 0, onChange, size = 'text-3xl' }) => (
  <div className="flex items-center gap-1" role={onChange ? 'radiogroup' : undefined} aria-label="Rating">
    {[1, 2, 3, 4, 5].map((n) =>
      onChange ? (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className={`${size} transition-transform hover:scale-110 ${n <= value ? 'text-amber-400' : 'text-neutral-300'}`}
        >
          <i className={n <= value ? 'ri-star-fill' : 'ri-star-line'} />
        </button>
      ) : (
        <i key={n} className={`${size} ${n <= Math.round(value) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-neutral-300'}`} />
      )
    )}
  </div>
);

export const RatingBadge = ({ rating }) =>
  rating?.count ? (
    <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
      <i className="ri-star-fill text-amber-400" />
      {rating.average.toFixed(1)}
      <span className="text-neutral-400">({rating.count})</span>
    </span>
  ) : (
    <span className="text-sm text-neutral-400">New</span>
  );

export default StarRating;
