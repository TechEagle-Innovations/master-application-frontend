import { API_CONFIG } from './config';
import { HttpClient } from './httpClient';
import { tokenService } from '../auth/tokenService';

export const httpClient = new HttpClient(
  API_CONFIG.BASE_URL,
  API_CONFIG.HEADERS,
  async () => {
    const { access_token } = await tokenService.getTokens();
    return { access_token };
  }
); 