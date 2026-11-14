import React, { useId, useState } from 'react';

/** Labelled input. type="password" gets a show/hide toggle. */
const Field = ({ label, type = 'text', className = '', ...props }) => {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <input id={id} type={isPassword && visible ? 'text' : type} className={`input ${isPassword ? 'pr-12' : ''}`} {...props} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-neutral-500 hover:text-neutral-900"
          >
            <i className={visible ? 'ri-eye-off-line' : 'ri-eye-line'} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Field;
