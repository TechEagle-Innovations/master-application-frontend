import { AuthAction, AuthResponse, AuthState } from '@/utils/auth/types';
import React, { createContext, useContext, useEffect, useReducer, useState, useCallback } from 'react';
import { tokenService } from './tokenService';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
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
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const { access_token, refresh_token } = await tokenService.getTokens();
      
      if (!access_token || !refresh_token) {
        dispatch({ type: 'LOGOUT' });
        setIsInitialized(true);
        return;
      }

      if (tokenService.isTokenExpired(access_token)) {
        await refreshAuth();
      } else {
        // Validate and decode the access token to get user info
        const payload = JSON.parse(atob(access_token.split('.')[1]));
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            access_token,
            refresh_token,
            user: payload.user,
          },
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (response: AuthResponse) => {
    await tokenService.saveTokens({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    });
    dispatch({ 
      type: 'LOGIN_SUCCESS', 
      payload: response
    });
  }, []);

  const logout = useCallback(async () => {
    const success = await tokenService.logout();
    if (!success) {
      // Optionally show a toast or log
      console.warn('Logout failed or partially failed. Tokens cleared.');
    }
    dispatch({ type: 'LOGOUT' });
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await tokenService.refreshTokens();
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: response });
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  }, [logout]);

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 