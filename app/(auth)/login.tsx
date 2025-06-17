import Logo from "@/assets/images/logo.svg";
import Button from "@/components/auth/Button";
import EmailInput from '@/components/auth/EmailInput';
import PasswordInput from '@/components/auth/PasswordInput';
import { Error } from "@/components/Error";
import { ERROR_MESSAGES } from '@/utils/api/config';
import { authService } from '@/utils/api/services/AuthService';
import { useAuth } from '@/utils/auth/AuthContext';
import authNavigation from '@/utils/auth/navigation';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ApiError {
  message: string;
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
      // console.log('Attempting login with email:', email);
      const response = await authService.login({ email, password });
      // console.log('Login successful, response:', { ...response});
      await authLogin(response);
      // console.log('Auth context updated successfully');
    } catch (error) {
      console.error('Login failed:', error);
      // handleLoginError(error);
      setError(error.message);
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

  // const handleLoginError = (error: unknown) => {
  //   if (error instanceof Error) {
  //     setError(error.message);
  //   } else if (typeof error === 'object' && error !== null && 'message' in error) {
  //     setError((error as ApiError).message);
  //   } else {
  //     setError(ERROR_MESSAGES.GENERIC_ERROR);
  //   }
  // };

  return (
    <View className="flex-1 bg-white p-7 justify-center pb-28">
      <View className="items-center mb-20">
        <Logo width={161} height={41} />
      </View>

      <View className="space-y-4">
        
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
          {error && (
          <View className="mb-4">
            <Error error={error} />
          </View>
        )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 