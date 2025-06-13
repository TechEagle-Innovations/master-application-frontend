import { AuthResponse, LoginFormData } from '@/utils/auth/types';

export interface IAuthService {
  login(credentials: LoginFormData): Promise<AuthResponse>;
  forgotPassword(email: string): Promise<{ message: string }>;
  verifyOTP(email: string, otp: string): Promise<{ message: string }>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  logout(): Promise<void>;
} 