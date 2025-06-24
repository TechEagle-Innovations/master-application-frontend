import { Platform } from 'react-native';

// Get the environment from process.env or use development as default
const ENV = process.env.NODE_ENV || 'development';

// Handle localhost for different platforms
const getLocalhost = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.1.4:6000'; // Android emulator localhost
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:6000'; // iOS simulator localhost
  }
  return 'http://localhost:6000'; // Web/default
};

const API_URLS = {
  development: getLocalhost(),
  production: 'https://your-production-api.com',
} as const;

export const API_CONFIG = {
  BASE_URL: API_URLS[ENV as keyof typeof API_URLS],
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/user/login',
      LOGOUT: '/user/logout',
      REFRESH_TOKEN: '/user/refresh-token',
      FORGOT_PASSWORD: '/user/forgot-password',
      VERIFY_OTP: '/user/verify-otp',
      RESET_PASSWORD: '/user/reset-password',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/update-profile',
      CHANGE_PASSWORD: '/user/change-password',
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please Login again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_OTP: 'Invalid OTP. Please try again.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
} as const; 