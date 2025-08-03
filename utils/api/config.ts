import { Platform } from 'react-native';

// Get the environment from process.env or use development as default
const ENV = process.env.NODE_ENV || 'development';
const cms= "https://cdn.techeagle.in"
export const CLEARSKY_URL="https://training.clearsky.techeagle.org"
export const UPLOAD_URL = `${cms}/images/new-add`;
export const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IlRlc3RpbmciLCJ1c2VyRW1haWwiOiJ0ZXN0aW5nQHRlY2hlYWdsZS5pbiIsInByb2plY3ROYW1lIjoiQURNSU4iLCJpYXQiOjE3NTE4OTE0MjR9.1zw3KaOFPsZUbW8quvmnB4dQY7ShzzPlxUXaFAnAH6E';

// Handle localhost for different platforms
const getLocalhost = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.1.145:6000'; // Android emulator localhost
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
export const locationIdToNameMap = {
  // From TE-clearsky-training.hublocationinfos.json
  "63930f82865ec3abed90bc1b": "Mendipathar PHC",
  "639310eb865ec3abed90bc1f": "Pedaldoba PHC",
  "639311e2865ec3abed90bc23": "Nongalbibra PHC",
  "6393126c865ec3abed90bc27": "Shallang PHC",
  "639312ff865ec3abed90bc2b": "Samanda PHC",
  "64d0895c3ea096f727fb9121": "Gabil PHC",
  "64d094523cb3ee07cf92adc8": "Songsak PHC",
  "64d095163cb3ee07cf92add7": "Dadenggre CHC",
  "6614b482eedca0a1a5df9bf0": "Dobu PHC",
  "661b551073054244262980ff": "Manikganj",
  "6616786d0ea790d0f3e7ad3a": "Chamba",
  "661678a20ea790d0f3e7ad5d": "New Tehri",
  "661678d20ea790d0f3e7ad77": "Fakot",
  "661678f50ea790d0f3e7ad91": "JAIRAM AASHRAM",
  "6683bd9be33e3fe878d5a67a": "Goroimari",
  "6690e358349f682b7dfe0137": "Sualmeri PHC",
  "669a28e8772df389cfe3bb97": "solon",
  "669c98e27a1379a4b26f5b62": "Mohanchatti",
  "66ab61d94c0251c8aa50c6b4": "Testing 1",
  "66ab8f7c4c0251c8aa50c964": "AIIMS Bilaspur",
  "66ab92e54c0251c8aa50c9b9": "Kanda",
  "66c83f5d3aad3df7ce7e4500": "Bansinggre PHC",
  "66e80616c4748f2ca7b91946": "Old Rao",
  "6710cef0ec74d6e8c513ed18": "Testing Tab Node",
  "676cfe2814edda2e286b98d1": "asdfghjkk",
  "680c718af80785e475d5737e": "Tosekgre SC",
  "683da258f519573ac82dc5cf": "Mapsko Casa Bella",
  "63932c7ab1cab628335ae969": "Jengjal",
  "6710ccbaec74d6e8c513ec8f": "Testing Tab",
  "65e06baa3e4ce03cdb92f18e": "Bilaspur",
  "65e6e60c9c75b119083c9530": "Rishikesh",
  "65eac3286a599653eac38d62": "Gurugram",
  "65f15b99a46eccde40b1d966": "Guwahati",
  "683da0149177ac86eb21811f": "Myntra Bilaspur FC",
  // From TE-clearsky-training.locationinfos.json
  // (Note: This file contains the same locations as above, so no additional entries needed)
};

// If you need just the locations from TE-clearsky-training.locationinfos.json:
export const locationInfoMap = {
  "66e80616c4748f2ca7b91946": "Old Rao",
  "6690e358349f682b7dfe0137": "Sualmeri PHC",
  "66ab92e54c0251c8aa50c9b9": "Kanda",
  "661678a20ea790d0f3e7ad5d": "New Tehri",
  "661678f50ea790d0f3e7ad91": "JAIRAM AASHRAM",
  "6683bd9be33e3fe878d5a67a": "Goroimari",
  "639311e2865ec3abed90bc23": "Nongalbibra PHC",
  "639312ff865ec3abed90bc2b": "Samanda PHC",
  "64d094523cb3ee07cf92adc8": "Songsak PHC",
  "66c83f5d3aad3df7ce7e4500": "Bansinggre PHC",
  "63930f82865ec3abed90bc1b": "Mendipathar PHC",
  "6616786d0ea790d0f3e7ad3a": "Chamba",
  "64d0895c3ea096f727fb9121": "Gabil PHC",
  "639310eb865ec3abed90bc1f": "Pedaldoba PHC",
  "661b551073054244262980ff": "Manikganj",
  "66ab8f7c4c0251c8aa50c964": "AIIMS Bilaspur",
  "6614b482eedca0a1a5df9bf0": "Dobu PHC",
  "669a28e8772df389cfe3bb97": "solon",
  "64d095163cb3ee07cf92add7": "Dadenggre CHC",
  "661678d20ea790d0f3e7ad77": "Fakot",
  "669c98e27a1379a4b26f5b62": "Mohanchatti",
  "6393126c865ec3abed90bc27": "Shallang PHC",
  "680c718af80785e475d5737e": "Tosekgre SC",
  "683da258f519573ac82dc5cf": "Mapsko Casa Bella"
};