import axios from 'axios';
import { getToken } from './auth';

export const BASE_URL = import.meta.env.VITE_BASE_URL;

const http = axios.create({ baseURL: BASE_URL, timeout: 20000 });

/**
 * Make an authenticated request as a rider ('user') or driver ('captain').
 * Usage: api('user').get('/rides/active')
 */
export const api = (role) => {
  const token = role ? getToken(role) : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return {
    get: (url, params) => http.get(url, { params, headers }).then((r) => r.data),
    post: (url, body) => http.post(url, body, { headers }).then((r) => r.data),
    patch: (url, body) => http.patch(url, body, { headers }).then((r) => r.data),
    put: (url, body) => http.put(url, body, { headers }).then((r) => r.data),
  };
};

/** Pull a human-readable message out of an axios error. */
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors[0]?.msg) return data.errors[0].msg;
  if (data?.error) return data.error;
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the server. Check your connection.';
  return fallback;
};
