// Riders and drivers keep separate tokens so both can be signed in on one browser.
const KEYS = { user: 'token', captain: 'captainToken' };

export const getToken = (role) => {
  try {
    return localStorage.getItem(KEYS[role]);
  } catch {
    return null;
  }
};

export const setToken = (role, token) => {
  try {
    localStorage.setItem(KEYS[role], token);
  } catch {
    /* storage unavailable */
  }
};

export const clearToken = (role) => {
  try {
    localStorage.removeItem(KEYS[role]);
  } catch {
    /* storage unavailable */
  }
};
