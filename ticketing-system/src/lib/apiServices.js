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

  async updateProfile(payload) {
    const { data: response } = await api.put('/profile', payload);
    return unwrapData(response);
  },

  async updatePassword(payload) {
    const { data: response } = await api.put('/password', payload);
    return unwrapData(response);
  },

  async forgotPassword(payload) {
    const { data: response } = await api.post('/forgot-password', payload, { skipAuth: true });
    return unwrapData(response);
  },

  async resetPassword(payload) {
    const { data: response } = await api.post('/reset-password', payload, { skipAuth: true });
    return unwrapData(response);
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

  async updateStatus(ticketId, status, resolutionNote, resolutionImage) {
    console.log('API updateStatus called:', { ticketId, status, resolutionNote, resolutionImage: resolutionImage ? 'IMAGE_PROVIDED' : 'NO_IMAGE' });
    const { data } = await api.patch(`/ticket/${ticketId}`, { status, resolution_notes: resolutionNote, resolution_image: resolutionImage });
    console.log('API updateStatus response:', data);
    return data;
  },

  async assign(ticketId, assignee_id, assignment_note) {
    const { data } = await api.patch(`/ticket/${ticketId}/assign`, { assignee_id, assignment_note });
    return data;
  },

  async claim(ticketId, assignment_note) {
    const { data } = await api.patch(`/ticket/${ticketId}/claim`, { assignment_note });
    return data;
  },

  async delete(ticketId) {
    const { data } = await api.delete(`/ticket/${ticketId}`);
    return data;
  },

  async submitFeedback(ticketId, payload) {
    const { data } = await api.patch(`/ticket/${ticketId}/confirm`, payload);
    return data;
  },
};

export const userApi = {
  async list() {
    const { data } = await api.get('/users');
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/register-tech', payload);
    return data;
  },
  async delete(userId) {
    const { data } = await api.delete(`/users/${userId}`);
    return data;
  },
  async getDetails(userId) {
    const { data } = await api.get(`/users/${userId}/details`);
    return data;
  }
};
