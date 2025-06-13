import { AuthResponse, LoginFormData } from '@/utils/auth/types';
import { ERROR_MESSAGES } from '../config';
import { IAuthService } from '../interfaces/IAuthService';
import { BaseService } from './BaseService';

class AuthService extends BaseService implements IAuthService {
  private static instance: AuthService;

  private constructor() {
    super('user');
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      console.log('AuthService: Attempting login...');
      const response = await this.post<AuthResponse>('login', credentials);
      console.log('AuthService: Login successful');
      return response;
    } catch (error) {
      console.error('AuthService: Login failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        } else if (error.message.includes('Network Error')) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
      }
      throw this.handleError(error);
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await this.post<{ message: string }>('forgot-password', { email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    try {
      return await this.post<{ message: string }>('verify-otp', { email, otp });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      return await this.post<{ message: string }>('reset-password', {
        email,
        otp,
        newPassword,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      return await this.post<AuthResponse>(
        'refresh-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.post('logout');
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const authService = AuthService.getInstance(); 