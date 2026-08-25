import api from './api';
import { authStorage } from './authStorage';

const unwrapData = (response) => response?.data?.data || response?.data || response;

export const authApi = {
  async register(payload) {
    const { data } = await api.post('/register', payload, { skipAuth: true });
    return data;
  },

  async login(payload) {
    const { data: response } = await api.post('/login', payload, { skipAuth: true });
    const data = unwrapData(response);

    if (!data.accessToken || !data.refreshToken || !data.user) {
      throw new Error('Login response is missing token or user data');
    }

    authStorage.setSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });

    return data;
  },

  async refresh(refreshToken = authStorage.getRefreshToken()) {
    const { data: response } = await api.put('/refresh', { refreshToken }, { skipAuth: true });
    const data = unwrapData(response);
    authStorage.setAccessToken(data.accessToken);
    return data;
  },

  async logout(refreshToken = authStorage.getRefreshToken()) {
    try {
      await api.delete('/logout', {
        data: { refreshToken },
        skipAuth: true,
      });
    } finally {
      authStorage.clear();
    }
  },
};

export const ticketApi = {
  async list() {
    const { data } = await api.get('/ticket');
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/ticket', payload);
    return data;
  },

  async updateStatus(ticketId, status, resolutionNote) {
    console.log('API updateStatus called:', { ticketId, status, resolutionNote });
    const { data } = await api.patch(`/ticket/${ticketId}`, { status, resolution_notes: resolutionNote });
    console.log('API updateStatus response:', data);
    return data;
  },
};
