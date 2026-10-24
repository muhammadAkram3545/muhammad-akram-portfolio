import { apiRequest } from './apiClient';
import { VersionHistoryItem } from '../types/backend';
import { PortfolioData } from '../types/portfolio';

export interface VersionSummary extends Omit<VersionHistoryItem, 'snapshot'> {}

export const versionService = {
  async listVersions(): Promise<VersionSummary[]> {
    return await apiRequest<VersionSummary[]>('/api/portfolio/versions', {
      method: 'GET'
    });
  },

  async getVersion(id: string): Promise<VersionHistoryItem> {
    return await apiRequest<VersionHistoryItem>(`/api/portfolio/versions/${id}`, {
      method: 'GET'
    });
  },

  async restoreVersion(id: string): Promise<{ success: boolean; message: string; restoredDraft: PortfolioData }> {
    return await apiRequest(`/api/portfolio/versions/${id}/restore`, {
      method: 'POST'
    });
  }
};
