const ACCESS_TOKEN_KEY = 'ticketing_access_token';
const REFRESH_TOKEN_KEY = 'ticketing_refresh_token';
const USER_KEY = 'ticketing_user';

export const authStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser() {
    const value = localStorage.getItem(USER_KEY);
    if (!value || value === 'undefined' || value === 'null') return null;

    try {
      return JSON.parse(value);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setSession({ accessToken, refreshToken, user }) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  setAccessToken(accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
