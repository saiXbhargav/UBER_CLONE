import React from 'react';
import { Link } from 'react-router-dom';

export const BRAND = 'RideX';

/**
 * RideX wordmark. Size it with a text-size class (default text-2xl).
 * `invert` renders it white for dark backgrounds.
 */
const Logo = ({ to = '/', className = 'text-2xl', invert = false }) => (
  <Link to={to} aria-label={`${BRAND} home`} className="inline-flex shrink-0 items-center">
    <span
      className={`select-none font-black leading-none tracking-tight ${invert ? 'text-white' : 'text-neutral-950'} ${className}`}
    >
      Ride<span className="text-emerald-500">X</span>
    </span>
  </Link>
);

export default Logo;
