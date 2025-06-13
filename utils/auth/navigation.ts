import { router } from 'expo-router';
import type { AuthRoutes } from './types';

const authNavigation = {
  goToLogin: () => router.replace('/(auth)/login'),
  
  goToForgotPassword: () => router.push('/(auth)/forgot-password'),
  
  goToVerifyOTP: (params: AuthRoutes['verify-otp']) => 
    router.push({
      pathname: '/(auth)/verify-otp',
      params
    }),
  
  goToResetPassword: (params: AuthRoutes['reset-password']) => 
    router.push({
      pathname: '/(auth)/reset-password',
      params
    }),
  
  goBack: () => router.back(),
  
  // After successful login/reset, navigate to the main app
  goToMainApp: () => router.replace('/(app)/dashboard')
};

// Adding a default export to satisfy Expo Router
// const navigation = {};
export default authNavigation; 