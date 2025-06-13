export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    // Add other user fields as needed
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface AuthRoutes {
  login: undefined;
  'forgot-password': undefined;
  'verify-otp': {
    email: string;
  };
  'reset-password': {
    email: string;
    token: string;
  };
}
export interface User {
  id: string;
  email: string;
  userName: string;
  permission: string;
  location: string;
  designation: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH_ERROR'; payload: string };

export interface LoginFormData {
  email: string;
  password: string;
} 
// Adding a default export to satisfy Expo Router
const types = {};
export default types; 