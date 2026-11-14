import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Components/common/Logo';

const HERO_IMAGE = '/hero-map.svg';

const FEATURES = [
  { icon: 'ri-price-tag-3-line', title: 'Upfront pricing', body: 'See the fare for every vehicle type before you book. No surprises.' },
  { icon: 'ri-map-2-line', title: 'Live tracking', body: 'Watch your driver approach on the map and follow the route in real time.' },
  { icon: 'ri-shield-check-line', title: 'PIN-verified pickups', body: 'Every trip starts only when your driver enters your one-time PIN.' },
  { icon: 'ri-star-smile-line', title: 'Rated drivers', body: 'Riders rate every trip, so you can see who is picking you up.' },
];

const Start = () => (
  <div className="min-h-[100dvh] bg-white">
    {/* Header */}
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo className="text-2xl" invert />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/captain-login" className="hidden rounded-full px-4 py-2 text-sm font-medium hover:bg-white/10 sm:inline-flex">
            Drive
          </Link>
          <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-white/10">
            Log in
          </Link>
          <Link to="/signup" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200">
            Sign up
          </Link>
        </nav>
      </div>
    </header>

    {/* Hero */}
    <section className="bg-neutral-950 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Cars, autos and motos near you
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Go anywhere with Ride<span className="text-emerald-400">X</span>.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-neutral-300">
            Request a car, auto or moto in seconds. Know the price up front and track your driver all the way.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="btn bg-white text-neutral-900 hover:bg-neutral-200">
              <i className="ri-roadster-line" /> Book a ride
            </Link>
            <Link to="/captain-signup" className="btn border border-white/30 text-white hover:bg-white/10">
              <i className="ri-steering-2-line" /> Drive &amp; earn
            </Link>
          </div>
        </div>
        <div className="relative">
          <img
            src={HERO_IMAGE}
            alt="Map showing a RideX driver on the way from pickup to drop-off"
            className="aspect-[3/2] w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/10"
          />
          <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-neutral-900 shadow-xl sm:left-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <i className="ri-time-line text-xl text-emerald-600" />
            </span>
            <div>
              <p className="text-sm font-semibold">Driver arriving</p>
              <p className="text-xs text-neutral-500">Tracked live on the map</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <h2 className="text-3xl font-bold tracking-tight">Why ride with RideX</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white">
              <i className={`${f.icon} text-xl`} />
            </span>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Driver CTA */}
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-neutral-100 p-8 sm:p-10 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Drive when it suits you</h2>
          <p className="mt-2 max-w-xl text-neutral-600">Go online, accept trips near you and see your earnings add up in real time.</p>
        </div>
        <Link to="/captain-signup" className="btn-primary shrink-0">
          Get started <i className="ri-arrow-right-line" />
        </Link>
      </div>
    </section>

    <footer className="border-t border-neutral-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-neutral-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} RideX · Built as a learning project.</p>
        <p>Maps © OpenStreetMap contributors</p>
      </div>
    </footer>
  </div>
);

export default Start;
