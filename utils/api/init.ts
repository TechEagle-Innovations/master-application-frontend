import { API_CONFIG } from './config';
import { HttpClient } from './httpClient';
import { tokenService } from '../auth/tokenService';

console.log('Initializing HTTP client with base URL:', API_CONFIG.BASE_URL);

// Initialize HTTP client with proper error handling
let httpClient: HttpClient;
try {
  httpClient = new HttpClient(
    API_CONFIG.BASE_URL,
    API_CONFIG.HEADERS,
    tokenService
  );
  console.log('HTTP client initialized successfully');
} catch (error) {
  console.error('Failed to initialize HTTP client:', error);
  throw error;
}

// Set HTTP client in token service with proper error handling
try {
  tokenService.setHttpClient(httpClient);
  console.log('Token service configured with HTTP client');
} catch (error) {
  console.error('Failed to configure token service:', error);
  throw error;
}

export { httpClient }; 