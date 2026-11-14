import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

const LINKS = {
  user: [
    { to: '/home', label: 'Ride', icon: 'ri-roadster-line' },
    { to: '/history', label: 'My trips', icon: 'ri-history-line' },
  ],
  captain: [
    { to: '/captain-home', label: 'Drive', icon: 'ri-steering-2-line' },
    { to: '/captain/history', label: 'Trips & earnings', icon: 'ri-wallet-3-line' },
  ],
};

// Shown to rider accounts whose email is listed in the server's ADMIN_EMAILS.
const ADMIN_LINK = { to: '/admin', label: 'Admin', icon: 'ri-dashboard-3-line' };

/**
 * Mobile: floating logo + round icon buttons over the map.
 * Desktop: a regular top bar with text links.
 * Pass floating={false} on pages without a full-screen map.
 */
const Navbar = ({ role, person, floating = true }) => {
  const links = [...(LINKS[role] || []), ...(role === 'user' && person?.isAdmin ? [ADMIN_LINK] : [])];
  const logoutTo = role === 'captain' ? '/captain/logout' : '/user/logout';
  const homeTo = role === 'captain' ? '/captain-home' : '/home';

  return (
    <header
      className={`z-30 flex h-16 w-full shrink-0 items-center justify-between px-4 lg:relative lg:border-b lg:border-neutral-200 lg:bg-white lg:px-6 ${
        floating ? 'absolute left-0 top-0' : 'relative border-b border-neutral-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-8">
        <div className={floating ? 'rounded-full bg-white/90 px-3 py-2 shadow-md backdrop-blur lg:bg-transparent lg:p-0 lg:shadow-none' : ''}>
          <Logo to={homeTo} className="text-xl lg:text-2xl" />
        </div>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {person && (
          <span className="mr-2 hidden text-sm text-neutral-600 lg:inline">
            Hi, <span className="font-semibold capitalize text-neutral-900">{person.fullname?.firstname}</span>
          </span>
        )}
        {links.slice(1).map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            aria-label={l.label}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md lg:hidden"
          >
            <i className={`${l.icon} text-lg`} />
          </NavLink>
        ))}
        <NavLink
          to={logoutTo}
          aria-label="Log out"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-neutral-100 lg:w-auto lg:gap-2 lg:px-4 lg:shadow-none lg:ring-1 lg:ring-neutral-200"
        >
          <i className="ri-logout-box-r-line text-lg" />
          <span className="hidden text-sm font-medium lg:inline">Log out</span>
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;
