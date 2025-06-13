import { API_CONFIG } from '@/utils/api/config';
import { AuthResponse } from '@/utils/auth/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TOKEN_KEY = 'auth_tokens';
const REFRESH_TOKEN_URL = `${API_CONFIG.BASE_URL}/user/refresh-token`;

class TokenService {
  private static instance: TokenService;
  private tokenRefreshPromise: Promise<AuthResponse> | null = null;

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async saveTokens(tokens: { access_token: string; refresh_token: string }): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  async getTokens(): Promise<{ access_token: string | null; refresh_token: string | null }> {
    try {
      const tokens = await AsyncStorage.getItem(TOKEN_KEY);
      return tokens ? JSON.parse(tokens) : { access_token: null, refresh_token: null };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return { access_token: null, refresh_token: null };
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  async refreshTokens(): Promise<AuthResponse> {
    // If a refresh is already in progress, return the existing promise
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const { refresh_token } = await this.getTokens();
        
        if (!refresh_token) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<AuthResponse>(
          REFRESH_TOKEN_URL,
          {},
          {
            headers: {
              Authorization: `Bearer ${refresh_token}`,
            },
          }
        );

        await this.saveTokens({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        });

        return response.data;
      } catch (error) {
        await this.clearTokens();
        throw error;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }
}

export const tokenService = TokenService.getInstance(); 