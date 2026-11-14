import React from 'react';

export const Spinner = ({ className = 'h-5 w-5' }) => (
  <span
    className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    aria-hidden="true"
  />
);

export const FullPageLoader = ({ label = 'Loading…' }) => (
  <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 text-neutral-500">
    <Spinner className="h-8 w-8 text-neutral-900" />
    <p className="text-sm">{label}</p>
  </div>
);

export default Spinner;
