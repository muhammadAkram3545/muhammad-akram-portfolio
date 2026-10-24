import { apiRequest } from './apiClient';
import { PortfolioData } from '../types/portfolio';
import { VersionHistoryItem, PublishValidationResult } from '../types/backend';

export interface PublishResponse {
  success: boolean;
  published: PortfolioData;
  version: VersionHistoryItem;
  validation: PublishValidationResult;
}

export const portfolioService = {
  // Public Endpoint: returns strictly published portfolio
  async getPublishedPortfolio(): Promise<PortfolioData> {
    return await apiRequest<PortfolioData>('/api/portfolio/published', {
      method: 'GET'
    });
  },

  // Protected Studio Endpoint: returns draft
  async getDraft(): Promise<PortfolioData> {
    return await apiRequest<PortfolioData>('/api/portfolio/draft', {
      method: 'GET'
    });
  },

  // Protected Studio Endpoint: saves draft
  async saveDraft(data: PortfolioData): Promise<{ success: boolean; lastUpdated: string }> {
    return await apiRequest('/api/portfolio/draft', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Protected Studio Endpoint: validates and publishes draft
  async publish(data?: PortfolioData, releaseNotes?: string): Promise<PublishResponse> {
    return await apiRequest<PublishResponse>('/api/portfolio/publish', {
      method: 'POST',
      body: JSON.stringify({ data, releaseNotes })
    });
  },

  // Protected Studio Endpoint: discards changes and resets draft to current published state
  async discardDraft(): Promise<{ success: boolean; draft: PortfolioData }> {
    return await apiRequest('/api/portfolio/discard', {
      method: 'POST'
    });
  }
};
