import { apiRequest, setClientAuthToken } from './apiClient';
import { AdminUser, BackendStatus } from '../types/backend';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
  expiresAt: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: AdminUser;
  expiresAt?: string;
}

export const authService = {
  async login(passkey: string, email: string = 'admin@muhammadakram.dev'): Promise<LoginResponse> {
    const data = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, passkey })
    });
    if (data.token) {
      setClientAuthToken(data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setClientAuthToken(null);
    }
  },

  async checkSession(): Promise<SessionResponse> {
    try {
      return await apiRequest<SessionResponse>('/api/auth/session', {
        method: 'GET'
      });
    } catch {
      return { authenticated: false };
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    return await apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  },

  async getBackendStatus(): Promise<BackendStatus> {
    return await apiRequest<BackendStatus>('/api/status', { method: 'GET' });
  }
};
