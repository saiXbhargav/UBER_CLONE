import React from 'react';
import { initials } from '../../lib/format';

const Avatar = ({ person, size = 'h-12 w-12 text-base', dark = true }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${size} ${
      dark ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800'
    }`}
    aria-hidden="true"
  >
    {initials(person)}
  </div>
);

export default Avatar;
