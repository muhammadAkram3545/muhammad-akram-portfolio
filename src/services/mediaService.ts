import { apiRequest } from './apiClient';
import { MediaItem } from '../types/portfolio';

export const mediaService = {
  async list(): Promise<MediaItem[]> {
    return await apiRequest<MediaItem[]>('/api/media', {
      method: 'GET'
    });
  },

  async upload(payload: {
    dataUrl: string;
    filename: string;
    name?: string;
    mimeType?: string;
    altText?: string;
    caption?: string;
    description?: string;
    category?: string;
  }): Promise<MediaItem> {
    return await apiRequest<MediaItem>('/api/media/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateMetadata(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    return await apiRequest<MediaItem>(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async replace(
    id: string,
    payload: { newUrl?: string; dataUrl?: string; filename?: string; mimeType?: string }
  ): Promise<{ success: boolean; updatedMedia: MediaItem; propagatedDraft: boolean }> {
    return await apiRequest(`/api/media/${id}/replace`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async delete(id: string, force: boolean = false): Promise<{ success: boolean }> {
    return await apiRequest(`/api/media/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
      body: JSON.stringify({ force })
    });
  }
};
