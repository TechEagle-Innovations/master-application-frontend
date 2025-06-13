import { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosInstance from '../axiosInstance';

export abstract class BaseService {
  protected constructor(protected readonly basePath: string) {}

  protected async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.get(
      this.getFullPath(endpoint),
      config
    );
    return response.data;
  }

  protected async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log('Making request to:', this.getFullPath(endpoint));
    const response: AxiosResponse<T> = await axiosInstance.post(
      this.getFullPath(endpoint),
      data,
      config
    );
    console.log('Response:', response.data);
    return response.data;
  }

  protected async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.put(
      this.getFullPath(endpoint),
      data,
      config
    );
    return response.data;
  }

  protected async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.delete(
      this.getFullPath(endpoint),
      config
    );
    return response.data;
  }

  private getFullPath(endpoint: string): string {
    // Remove any leading slashes from endpoint and basePath
    const cleanBasePath = this.basePath.replace(/^\/+/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    return `/${cleanBasePath}/${cleanEndpoint}`.replace(/\/+/g, '/');
  }

  protected handleError(error: unknown): never {
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const response = error.response as { data?: { message?: string } };
      throw new Error(response.data?.message || 'An error occurred');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
} 