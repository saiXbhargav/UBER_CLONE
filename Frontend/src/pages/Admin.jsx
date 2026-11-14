import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/common/Navbar';
import Avatar from '../Components/common/Avatar';
import { Spinner } from '../Components/common/Spinner';
import { RatingBadge } from '../Components/common/StarRating';
import WeeklyChart from '../Components/admin/WeeklyChart';
import RidesTab from '../Components/admin/RidesTab';
import DriversTab from '../Components/admin/DriversTab';
import { BarList, KpiCard } from '../Components/admin/ui';
import { UserDataContext } from '../Context/Usercontext';
import { useToast } from '../Context/ToastContext';
import { api, getErrorMessage } from '../lib/api';
import { formatMoney, fullName } from '../lib/format';
import { getVehicle } from '../lib/vehicles';

const TABS = [
  { id: 'rides', label: 'Rides', icon: 'ri-route-line' },
  { id: 'drivers', label: 'Drivers', icon: 'ri-steering-2-line' },
];

const Section = ({ title, children, className = '' }) => (
  <section className={`card p-5 ${className}`}>
    {title && <h2 className="mb-4 font-semibold">{title}</h2>}
    {children}
  </section>
);

const Admin = () => {
  const { user } = useContext(UserDataContext);
  const toast = useToast();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('rides');

  const loadOverview = useCallback(() => {
    setLoading(true);
    api('user')
      .get('/admin/overview')
      .then(setOverview)
      .catch((err) => toast.error(getErrorMessage(err, 'Could not load the dashboard')))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (user?.isAdmin) loadOverview();
  }, [user?.isAdmin, loadOverview]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-[100dvh] bg-neutral-50">
        <Navbar role="user" person={user} floating={false} />
        <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white">
            <i className="ri-lock-2-line text-2xl" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Admins only</h1>
          <p className="mt-2 text-neutral-500">
            This dashboard is available to accounts listed in the server’s <code className="rounded bg-neutral-100 px-1">ADMIN_EMAILS</code> setting.
          </p>
          <Link to="/home" className="btn-primary mt-8">
            Back to booking
          </Link>
        </main>
      </div>
    );
  }

  const t = overview?.totals;
  const completedPct = t?.rides ? Math.round((t.completedRides / t.rides) * 100) : 0;

  return (
    <div className="min-h-[100dvh] bg-neutral-50">
      <Navbar role="user" person={user} floating={false} />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
            <p className="mt-1 text-neutral-500">Platform health, rides and drivers.</p>
          </div>
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={loadOverview} disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : <i className="ri-refresh-line" aria-hidden="true" />} Refresh
          </button>
        </div>

        {!overview ? (
          <div className="flex justify-center py-24">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
              <KpiCard icon="ri-money-rupee-circle-line" label="Revenue" value={formatMoney(t.revenue)} hint={`${formatMoney(overview.today.revenue)} today`} />
              <KpiCard icon="ri-route-line" label="Rides" value={t.rides.toLocaleString('en-IN')} hint={`${overview.today.rides} today · ${t.activeRides} active`} />
              <KpiCard icon="ri-checkbox-circle-line" label="Completed" value={`${completedPct}%`} hint={`${t.completedRides} done · ${t.canceledRides} cancelled`} />
              <KpiCard icon="ri-steering-2-line" label="Drivers online" value={`${t.captainsOnline}/${t.captains}`} hint="online / registered" />
              <KpiCard icon="ri-user-3-line" label="Riders" value={t.users.toLocaleString('en-IN')} hint="registered accounts" />
            </div>

            {/* Charts */}
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Section className="lg:col-span-2">
                <WeeklyChart days={overview.last7Days} />
              </Section>
              <div className="grid gap-4">
                <Section title="Vehicle mix">
                  <BarList
                    items={overview.byVehicle.map((v) => ({
                      label: getVehicle(v.vehicleType).name,
                      value: v.rides,
                      sub: formatMoney(v.revenue),
                    }))}
                    format={(v) => `${v} rides`}
                  />
                </Section>
                <Section title="Cancellations">
                  <BarList
                    items={[
                      { label: 'By riders', value: overview.cancellation.byUser, color: 'bg-red-400' },
                      { label: 'By drivers', value: overview.cancellation.byCaptain, color: 'bg-amber-400' },
                      { label: 'No driver found', value: overview.cancellation.bySystem, color: 'bg-neutral-400' },
                    ]}
                    empty="No cancellations"
                  />
                </Section>
              </div>
            </div>

            {/* Top drivers */}
            <Section title="Top drivers" className="mt-4">
              {overview.topCaptains.length === 0 ? (
                <p className="text-sm text-neutral-500">No completed trips yet.</p>
              ) : (
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {overview.topCaptains.map((c, i) => (
                    <li key={c._id} className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                      <span className="w-4 text-sm font-bold text-neutral-400">{i + 1}</span>
                      <Avatar person={c} size="h-10 w-10 text-sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold capitalize">{fullName(c)}</p>
                        <p className="text-xs text-neutral-500">
                          {formatMoney(c.earnings)} · {c.trips} trips
                        </p>
                        <RatingBadge rating={c.rating} />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          </>
        )}

        {/* Tables */}
        <div className="mt-10">
          <div className="flex gap-1 border-b border-neutral-200" role="tablist" aria-label="Admin data">
            {TABS.map((tb) => (
              <button
                key={tb.id}
                type="button"
                role="tab"
                id={`tab-${tb.id}`}
                aria-selected={tab === tb.id}
                aria-controls={`panel-${tb.id}`}
                onClick={() => setTab(tb.id)}
                className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === tb.id ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <i className={tb.icon} aria-hidden="true" /> {tb.label}
              </button>
            ))}
          </div>
          <div className="pt-5" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'rides' ? <RidesTab /> : <DriversTab onChanged={loadOverview} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
