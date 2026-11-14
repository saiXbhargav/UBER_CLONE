import React from 'react';
import Logo from './Logo';

const COPY = {
  rider: {
    headline: 'Go anywhere, anytime.',
    body: 'Upfront fares, live driver tracking and OTP-verified pickups on every trip.',
    points: ['See the fare before you book', 'Track your driver in real time', 'Rate every trip'],
  },
  captain: {
    headline: 'Drive on your own schedule.',
    body: 'Go online when you want, accept nearby requests and keep track of what you earn.',
    points: ['Requests from riders near you', 'Daily earnings at a glance', 'Build your rating'],
  },
};

/** Desktop: brand panel on the left, form on the right. Mobile: just the form. */
const AuthLayout = ({ variant = 'rider', title, subtitle, children, footer }) => {
  const copy = COPY[variant];
  return (
    <div className="flex min-h-[100dvh] bg-white">
      <section className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <Logo className="text-3xl" invert />
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold leading-tight tracking-tight">{copy.headline}</h1>
          <p className="mt-4 text-lg text-neutral-300">{copy.body}</p>
          <ul className="mt-8 space-y-3">
            {copy.points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-neutral-200">
                <i className="ri-checkbox-circle-fill text-xl text-emerald-400" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-neutral-500">© {new Date().getFullYear()} RideX · Built as a learning project</p>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full border-[48px] border-white/5"
        />
      </section>

      <section className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:items-center lg:justify-center">
        <div className="w-full max-w-md lg:mx-auto">
          <div className="mb-10 lg:hidden">
            <Logo className="text-2xl" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-2 text-neutral-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
