import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAction, AuthResponse, AuthState } from '@/utils/auth/types';
import { tokenService } from './tokenService';
import { useShipment } from '../ShipmentContext';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  clearskyToken: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
        isLoading: false,
        clearskyToken: state.clearskyToken,
      };
    case 'LOGOUT':
    case 'SET_AUTH_ERROR':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (response: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setClearskToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [clearskyToken, setClearskTokenState] = useState<string | null>(null);
  const { resetShipmentState } = useShipment();

  const login = useCallback(async (response: AuthResponse) => {
    try {
      await tokenService.saveTokens(response);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({ type: 'SET_AUTH_ERROR' });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const success = await tokenService.logout();
      resetShipmentState();
      if (!success) {
        console.warn('Logout failed or partially failed. Tokens may not be cleared.');
      }
    } catch (error) {
      console.error('Logout exception:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await tokenService.refreshTokens();
      await tokenService.saveTokens(response);
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: response });
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  }, [logout]);

  const checkAuth = useCallback(async () => {
    try {
      const { access_token, refresh_token } = await tokenService.getTokens();

      if (!access_token || !refresh_token) {
        dispatch({ type: 'LOGOUT' });
        return;
      }

      if (tokenService.isTokenExpired(access_token)) {
        await refreshAuth();
      } else {
        let user = null;

        try {
          const payload = JSON.parse(atob(access_token.split('.')[1]));
          user = payload.user;
        } catch (e) {
          console.warn('Failed to parse token payload:', e);
        }

        if (!user) {
          const userStr = await AsyncStorage.getItem('auth_user');
          user = userStr ? JSON.parse(userStr) : null;
        }

        if (!user) {
          dispatch({ type: 'LOGOUT' });
          return;
        }

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { access_token, refresh_token, user },
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    } finally {
      setIsInitialized(true);
    }
  }, [refreshAuth, logout]);

  const setClearskToken = useCallback((token: string | null) => {
    setClearskTokenState(token);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isInitialized) return null;

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshAuth,
        clearskyToken,
        setClearskToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
