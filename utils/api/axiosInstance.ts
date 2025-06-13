import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from '../auth/tokenService';
import { ApiResponseHandler } from './ApiResponse';
import { API_CONFIG, ERROR_MESSAGES } from './config';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

console.log('Initializing axios with base URL:', API_CONFIG.BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const { access_token } = await tokenService.getTokens();
    
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    
    const fullUrl = `${config.baseURL || API_CONFIG.BASE_URL}${config.url || ''}`;
    console.log('Making request to:', fullUrl);
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(
      ApiResponseHandler.error(
        error.message || ERROR_MESSAGES.NETWORK_ERROR
      )
    );
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response received for:', response.config.url);
    return response.data;
  },
  async (error: AxiosError) => {
    console.error('Response error for:', error.config?.url, error);
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!error.response) {
      return Promise.reject(
        ApiResponseHandler.error(ERROR_MESSAGES.NETWORK_ERROR)
      );
    }

    // Handle 401 Unauthorized error
    if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await tokenService.refreshTokens();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(
          ApiResponseHandler.error(ERROR_MESSAGES.UNAUTHORIZED)
        );
      }
    }

    // Handle other errors
    const errorResponse = error.response.data as { message?: string };
    const errorMessage = 
      errorResponse?.message || 
      getErrorMessageByStatus(error.response.status) ||
      ERROR_MESSAGES.GENERIC_ERROR;

    return Promise.reject(
      ApiResponseHandler.error(
        errorMessage,
        error.response.status?.toString(),
        error.response.data
      )
    );
  }
);

function getErrorMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.GENERIC_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.GENERIC_ERROR;
  }
}

export default axiosInstance; 