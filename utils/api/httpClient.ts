import { ERROR_MESSAGES } from './config';
import { ApiResponseHandler } from './ApiResponse';
import { ITokenProvider } from '../auth/ITokenProvider';

interface RequestConfig extends RequestInit {
  _retry?: boolean;
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;
  private tokenProvider: ITokenProvider;

  constructor(baseUrl: string, defaultHeaders: HeadersInit, tokenProvider: ITokenProvider) {
    if (!tokenProvider || typeof tokenProvider.getTokens !== 'function') {
      throw new Error('Invalid token provider');
    }
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
    this.tokenProvider = tokenProvider;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      const { access_token } = await this.tokenProvider.getTokens();
      return access_token ? { Authorization: `Bearer ${access_token}` } : {};
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {};
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
    
      try {
        const errorData = await response.json();

        console.log('Error data:', errorData);
        const error = new Error(errorData.message || ERROR_MESSAGES.GENERIC_ERROR);
        throw error;
      } catch (error) {
        throw error;
      }
    }
    return response.json();
  }

  private getFullUrl(path: string): string {
    // Remove any leading/trailing slashes from both baseUrl and path
    const cleanBaseUrl = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    return `${cleanBaseUrl}/${cleanPath}`;
  }

  private async fetchWithAuth<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    try {
      const fullUrl = this.getFullUrl(url);
      console.log('Making request to:', fullUrl);

      const authHeaders = await this.getAuthHeaders();
      const headers = {
        ...this.defaultHeaders,
        ...authHeaders,
        ...config.headers,
      };

      const response = await fetch(fullUrl, {
        ...config,
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.log('Request failed:', error);
      if (error instanceof Error) {
        throw ApiResponseHandler.error(error.message);
      }
      throw ApiResponseHandler.error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.fetchWithAuth<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.fetchWithAuth<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(url: string, data: any, config?: RequestConfig): Promise<T> {
    return this.fetchWithAuth<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.fetchWithAuth<T>(url, { ...config, method: 'DELETE' });
  }
}

// Export the class instead of an instance
export { HttpClient }; 