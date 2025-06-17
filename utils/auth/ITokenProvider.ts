import { AuthResponse } from './types';

export interface ITokenProvider {
  getTokens(): Promise<{ access_token: string | null; refresh_token: string | null }>;
  saveTokens(tokens: AuthResponse | { access_token: string; refresh_token: string }): Promise<void>;
  clearTokens(): Promise<void>;
  isTokenExpired(token: string): boolean;
  refreshTokens(): Promise<AuthResponse>;
} 