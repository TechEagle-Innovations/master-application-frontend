import { httpClient } from '../init';

export abstract class BaseService {
  protected constructor(protected readonly basePath: string) {
    if (!basePath) {
      throw new Error('Base path is required');
    }
  }

  protected async get<T>(endpoint: string, config?: RequestInit): Promise<T> {
    const path = this.getFullPath(endpoint);
    console.log('GET request to:', path);
    return httpClient.get<T>(path, config);
  }

  protected async post<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    const path = this.getFullPath(endpoint);
    console.log('POST request to:', path, 'with data:', data);
    const response = await httpClient.post<T>(path, data, config);
    console.log('Response:', response);
    return response;
  }

  protected async put<T>(endpoint: string, data: any, config?: RequestInit): Promise<T> {
    const path = this.getFullPath(endpoint);
    console.log('PUT request to:', path);
    return httpClient.put<T>(path, data, config);
  }

  protected async delete<T>(endpoint: string, config?: RequestInit): Promise<T> {
    const path = this.getFullPath(endpoint);
    console.log('DELETE request to:', path);
    return httpClient.delete<T>(path, config);
  }

  private getFullPath(endpoint: string): string {
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }

    // Remove any leading/trailing slashes
    const cleanBasePath = this.basePath.replace(/^\/+|\/+$/g, '');
    const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');

    // Construct the path
    const path = `/${cleanBasePath}/${cleanEndpoint}`.replace(/\/+/g, '/');
    console.log('Constructed path:', path);
    return path;
  }

  protected handleError(error: unknown): never {
    console.error('Service error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
} 