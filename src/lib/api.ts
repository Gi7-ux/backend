import axios from 'axios';

// API interfaces
interface Message {
  id: number;
  content: string;
  sender_id: number;
  recipient_id: number;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TimeEntry {
  id: number;
  user_id: number;
  job_id: number;
  started_at: string;
  ended_at: string | null;
  duration: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

// API request/response types
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

type Config = {
  url?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  baseURL?: string;
  withCredentials?: boolean;
};

type RequestConfig<TData> = Omit<Config, 'data'> & {
  data?: TData;
};

// Custom error class with typed properties
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// API client configuration
const API_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

/**
 * API client for making HTTP requests with automatic error handling
 */
class ApiClient {
  private http;

  constructor() {
    this.http = axios.create({
      baseURL: API_URL,
      headers: DEFAULT_HEADERS,
      withCredentials: true,
    });

    // Add auth token to requests
    this.http.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.http.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const { data, status } = error.response;
          throw new ApiError(
            (data as ErrorResponse)?.message || 'An error occurred',
            status,
            (data as ErrorResponse)?.errors
          );
        }
        throw new ApiError('Network error', 500);
      }
    );
  }

  // Message endpoints
  async getMessages(): Promise<Message[]> {
    const response = await this.http({
      method: 'get',
      url: '/messages'
    });
    return response.data;
  }

  async sendMessage(content: string, recipientId: number): Promise<Message> {
    const response = await this.http({
      method: 'post',
      url: '/messages',
      data: { content, recipient_id: recipientId }
    });
    return response.data;
  }

  async getUnreadMessageCount(): Promise<number> {
    const response = await this.http({
      method: 'get',
      url: '/messages/unread-count'
    });
    return response.data.count;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await this.http({
      method: 'put',
      url: `/messages/${id}/read`
    });
  }

  async deleteMessage(id: number): Promise<void> {
    await this.http({
      method: 'delete',
      url: `/messages/${id}`
    });
  }

  // Time tracking endpoints
  async getTimeEntries(): Promise<TimeEntry[]> {
    const response = await this.http({
      method: 'get',
      url: '/time-entries'
    });
    return response.data;
  }

  async createTimeEntry(data: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>): Promise<TimeEntry> {
    const response = await this.http({
      method: 'post',
      url: '/time-entries',
      data
    });
    return response.data;
  }

  async updateTimeEntry(id: number, data: Partial<TimeEntry>): Promise<TimeEntry> {
    const response = await this.http({
      method: 'put',
      url: `/time-entries/${id}`,
      data
    });
    return response.data;
  }

  async deleteTimeEntry(id: number): Promise<void> {
    await this.http({
      method: 'delete',
      url: `/time-entries/${id}`
    });
  }

  async getTimeSummary(): Promise<Record<string, number>> {
    const response = await this.http({
      method: 'get',
      url: '/time-entries/summary'
    });
    return response.data;
  }

  // Generic request helper for custom endpoints
  async request<TResponse = object, TRequest = object>(
    config: RequestConfig<TRequest>
  ): Promise<TResponse> {
    const response = await this.http({
      ...config,
      method: config.method || 'get'
    });
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;

// Export types
export type { Message, TimeEntry, RequestConfig, HttpMethod };