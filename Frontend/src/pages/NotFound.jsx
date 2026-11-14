import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
    <p className="text-7xl font-bold tracking-tight">404</p>
    <p className="mt-3 text-lg font-semibold">This road doesn’t go anywhere</p>
    <p className="mt-1 text-neutral-500">The page you’re looking for doesn’t exist.</p>
    <Link to="/" className="btn-primary mt-8">
      Back to home
    </Link>
  </div>
);

export default NotFound;
