import { API_CONFIG } from '@/utils/api/config';
import { AuthResponse, User } from '@/utils/auth/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITokenProvider } from './ITokenProvider';

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

interface TokenData {
  access_token: string;
  refresh_token: string;
}

class TokenService implements ITokenProvider {
  private static instance: TokenService;
  private tokenRefreshPromise: Promise<AuthResponse> | null = null;
  private httpClient: any; // Will be set after initialization

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  setHttpClient(client: any) {
    this.httpClient = client;
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

  async saveTokens(data: AuthResponse | TokenData): Promise<void> {
    try {
      if ('user' in data) {
        const { user, ...tokenData } = data;
        await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
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
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const { refresh_token } = await this.getTokens();
        
        if (!refresh_token) {
          throw new Error('No refresh token available');
        }

        const response = await this.httpClient.post('/user/refresh-token', {}, {
          headers: {
            Authorization: `Bearer ${refresh_token}`,
          },
        }) as AuthResponse;

        await this.saveTokens(response);
        return response;
      } catch (error) {
        await this.clearTokens();
        throw error;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }

  async logout(): Promise<boolean> {
    try {
      if (!this.httpClient) {
        console.error('Logout failed: httpClient is not set on tokenService.');
        await this.clearTokens();
        return false;
      }
      await this.httpClient.post('/user/logout', {});
      await this.clearTokens();
      return true;
    } catch (error) {
      // Optionally log or handle error, but still clear tokens
      console.error('Logout API call failed:', error);
      await this.clearTokens();
      return false;
    }
  }
}

export const tokenService = TokenService.getInstance(); 