import React, { useEffect, useRef, useState } from 'react';
import { api, getErrorMessage } from '../../lib/api';
import { shortPlace } from '../../lib/format';
import { useToast } from '../../Context/ToastContext';
import Spinner from '../common/Spinner';

const useDebounced = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const OptionRow = ({ icon, title, subtitle, onClick, busy }) => (
  <li>
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100">
        {busy ? <Spinner className="h-4 w-4" /> : <i className={icon} />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-neutral-900">{title}</span>
        {subtitle && <span className="block truncate text-xs text-neutral-500">{subtitle}</span>}
      </span>
    </button>
  </li>
);

/**
 * Pickup + destination inputs with:
 * - debounced place suggestions (free Photon/ORS)
 * - "use my current location" (free reverse geocoding)
 * - saved Home/Work and recent places
 */
const LocationSearch = ({ pickup, destination, setPickup, setDestination, onSubmit, loading, places, onEditPlaces }) => {
  const [active, setActive] = useState(null); // 'pickup' | 'destination' | null
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const selectedRef = useRef('');
  const toast = useToast();
  const activeValue = active === 'pickup' ? pickup : active === 'destination' ? destination : '';
  const query = useDebounced(activeValue);

  useEffect(() => {
    if (!active || query.trim().length < 3 || query === selectedRef.current) {
      setSuggestions([]);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    api('user')
      .get('/maps/get-suggestion', { input: query })
      .then((data) => !cancelled && setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => !cancelled && setSuggestions([]))
      .finally(() => !cancelled && setSearching(false));
    return () => {
      cancelled = true;
    };
  }, [query, active]);

  const fill = (field, name) => {
    selectedRef.current = name;
    (field === 'pickup' ? setPickup : setDestination)(name);
    setSuggestions([]);
    setActive(field === 'pickup' && !destination ? 'destination' : null);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser does not support location access');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { name } = await api('user').get('/maps/reverse', { lat: coords.latitude, lng: coords.longitude });
          fill('pickup', name);
        } catch (err) {
          toast.error(getErrorMessage(err, 'Could not find your address'));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error('Location permission denied. Type your pickup instead.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const swap = () => {
    setPickup(destination);
    setDestination(pickup);
  };

  const shortcuts = [];
  if (places?.home) shortcuts.push({ icon: 'ri-home-4-line', title: 'Home', subtitle: places.home, value: places.home });
  if (places?.work) shortcuts.push({ icon: 'ri-briefcase-4-line', title: 'Work', subtitle: places.work, value: places.work });
  (places?.recent || [])
    .filter((p) => p !== places?.home && p !== places?.work)
    .slice(0, 4)
    .forEach((p) => shortcuts.push({ icon: 'ri-history-line', title: shortPlace(p), subtitle: p, value: p }));

  const showShortcuts = active && activeValue.trim().length < 3;
  const showSuggestions = active && !showShortcuts && (searching || suggestions.length > 0);

  const inputRow = (key, value, setValue, placeholder, marker) => (
    <div className="relative">
      <span className={`absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 bg-neutral-900 ${marker}`} aria-hidden="true" />
      <input
        className="input pl-10 pr-10"
        placeholder={placeholder}
        value={value}
        aria-label={placeholder}
        autoComplete="off"
        onFocus={() => setActive(key)}
        onChange={(e) => {
          selectedRef.current = '';
          setValue(e.target.value);
          setActive(key);
        }}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear"
          onClick={() => {
            setValue('');
            setActive(key);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
        >
          <i className="ri-close-circle-fill text-lg" />
        </button>
      ) : (
        key === 'pickup' && (
          <button
            type="button"
            aria-label="Use my current location"
            title="Use my current location"
            onClick={useCurrentLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
          >
            {locating ? <Spinner className="h-4 w-4" /> : <i className="ri-crosshair-2-line text-lg" />}
          </button>
        )
      )}
    </div>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setActive(null);
        onSubmit();
      }}
    >
      <div className="relative space-y-3">
        {inputRow('pickup', pickup, setPickup, 'Pickup location', 'rounded-full')}
        {inputRow('destination', destination, setDestination, 'Where to?', 'rounded-[2px]')}
        <button
          type="button"
          onClick={swap}
          aria-label="Swap pickup and destination"
          className="absolute -right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm hover:text-neutral-900 sm:flex"
        >
          <i className="ri-arrow-up-down-line" />
        </button>
      </div>

      {showShortcuts && (active === 'pickup' || shortcuts.length > 0) && (
        <ul className="mt-3 animate-fade-in divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200">
          {active === 'pickup' && (
            <OptionRow icon="ri-crosshair-2-line" title="Use my current location" onClick={useCurrentLocation} busy={locating} />
          )}
          {shortcuts.map((s) => (
            <OptionRow key={`${s.title}-${s.value}`} icon={s.icon} title={s.title} subtitle={s.subtitle} onClick={() => fill(active, s.value)} />
          ))}
        </ul>
      )}

      {showSuggestions && (
        <ul className="mt-3 animate-fade-in divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200" role="listbox">
          {searching && suggestions.length === 0 && (
            <li className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-500">
              <Spinner className="h-4 w-4" /> Searching places…
            </li>
          )}
          {suggestions.map((s, i) => (
            <OptionRow key={`${s.name}-${i}`} icon="ri-map-pin-2-line" title={shortPlace(s.name)} subtitle={s.name} onClick={() => fill(active, s.name)} />
          ))}
        </ul>
      )}

      {!active && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {['home', 'work'].map((key) =>
            places?.[key] ? (
              <button
                key={key}
                type="button"
                onClick={() => fill('destination', places[key])}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium hover:bg-neutral-200"
              >
                <i className={key === 'home' ? 'ri-home-4-line' : 'ri-briefcase-4-line'} />
                {key === 'home' ? 'Home' : 'Work'}
              </button>
            ) : null
          )}
          {onEditPlaces && (
            <button type="button" onClick={onEditPlaces} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100">
              <i className="ri-bookmark-line" />
              {places?.home || places?.work ? 'Edit saved places' : 'Save Home & Work'}
            </button>
          )}
        </div>
      )}

      <button className="btn-primary mt-5 w-full" disabled={loading || !pickup.trim() || !destination.trim()}>
        {loading ? <Spinner /> : (
          <>
            See prices <i className="ri-arrow-right-line" />
          </>
        )}
      </button>
    </form>
  );
};

export default LocationSearch;
