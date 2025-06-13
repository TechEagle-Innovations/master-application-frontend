import Logo from "@/assets/images/logo.svg";
import Button from "@/components/auth/Button";
import EmailInput from '@/components/auth/EmailInput';
import PasswordInput from '@/components/auth/PasswordInput';
import { Error } from "@/components/Error";
import { ERROR_MESSAGES } from '@/utils/api/config';
import { authService } from '@/utils/api/services/AuthService';
import { useAuth } from '@/utils/auth/AuthContext';
import authNavigation from '@/utils/auth/navigation';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  const handleLogin = async () => {
    if (!validateInputs()) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with email:', email);
      const response = await authService.login({ email, password });
      // const response = await axios.post('http://192.168.1.5:6000/user/login', { email, password });
      console.log('Login successful, response:', { ...response, access_token: '[REDACTED]', refresh_token: '[REDACTED]' });
      await authLogin(response);
      console.log('Auth context updated successfully');
    } catch (error) {
      console.error('Login failed:', error);
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill all fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleLoginError = (error: unknown) => {
    // Handle Axios errors
    if (error instanceof Error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data) {
        // API error with response
        setError(axiosError.response.data.message || ERROR_MESSAGES.GENERIC_ERROR);
      } else if (axiosError.message.includes('Network Error')) {
        // Network error
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      } else {
        // Other error with message
        setError(error.message || ERROR_MESSAGES.GENERIC_ERROR);
      }
    } else {
      // Unknown error
      setError(ERROR_MESSAGES.GENERIC_ERROR);
    }
  };

  return (
    <View className="flex-1 bg-white p-7 justify-center pb-28">
      <View className="items-center mb-20">
        <Logo width={161} height={41} />
      </View>

      <View className="space-y-4">
        {error && (
          <View className="mb-4">
            <Error error={error} />
          </View>
        )}
        
        <EmailInput
          label="Email"
          value={email}
          onChangeText={(text: string) => {
            setEmail(text);
            setError(null);
          }}
          placeholder="Enter your email"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={(text: string) => {
            setPassword(text);
            setError(null);
          }}
          placeholder="Enter your password"
        />

        <Button 
          loading={loading} 
          actionFunction={handleLogin} 
          buttonText="Login" 
          buttonTextLoading="Logging in..." 
        />

        <TouchableOpacity
          onPress={authNavigation.goToForgotPassword}
          className="mt-4"
        >
          <Text className="text-center text-base">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 