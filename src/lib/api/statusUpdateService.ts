import { StatusUpdate, AdminComment } from '@/types';
import { api } from '../api';

/**
 * Service for interacting with the status updates API
 */
export const statusUpdateService = {
  /**
   * Get all status updates with optional filtering
   */
  async getStatusUpdates(params?: {
    job_id?: string;
    user_id?: string;
    is_read?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{ data: StatusUpdate[] }> {
    const response = await api.http({
      method: 'get',
      url: '/status-updates',
      params
    });
    return response.data;
  },

  /**
   * Get a specific status update by ID
   */
  async getStatusUpdate(id: string): Promise<{ data: StatusUpdate }> {
    const response = await api.http({
      method: 'get',
      url: `/status-updates/${id}`
    });
    return response.data;
  },

  /**
   * Create a new status update
   */
  async createStatusUpdate(data: {
    job_id: string;
    content: string;
  }): Promise<{ data: StatusUpdate }> {
    const response = await api.http({
      method: 'post',
      url: '/status-updates',
      data
    });
    return response.data;
  },

  /**
   * Mark a status update as read
   */
  async markStatusUpdateAsRead(id: string): Promise<{ message: string }> {
    const response = await api.http({
      method: 'put',
      url: `/status-updates/${id}/read`
    });
    return response.data;
  },

  /**
   * Delete a status update
   */
  async deleteStatusUpdate(id: string): Promise<{ message: string }> {
    const response = await api.http({
      method: 'delete',
      url: `/status-updates/${id}`
    });
    return response.data;
  },

  /**
   * Get all admin comments for a status update
   */
  async getAdminComments(statusUpdateId: string): Promise<{ data: AdminComment[] }> {
    const response = await api.http({
      method: 'get',
      url: `/status-updates/${statusUpdateId}/comments`
    });
    return response.data;
  },

  /**
   * Create a new admin comment on a status update
   */
  async createAdminComment(statusUpdateId: string, data: {
    content: string;
  }): Promise<{ data: AdminComment }> {
    const response = await api.http({
      method: 'post',
      url: `/status-updates/${statusUpdateId}/comments`,
      data
    });
    return response.data;
  },

  /**
   * Mark an admin comment as read
   */
  async markAdminCommentAsRead(id: string): Promise<{ message: string }> {
    const response = await api.http({
      method: 'put',
      url: `/status-updates/comments/${id}/read`
    });
    return response.data;
  },

  /**
   * Delete an admin comment
   */
  async deleteAdminComment(id: string): Promise<{ message: string }> {
    const response = await api.http({
      method: 'delete',
      url: `/status-updates/comments/${id}`
    });
    return response.data;
  }
};
