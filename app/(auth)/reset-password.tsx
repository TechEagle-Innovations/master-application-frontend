import Logo from "@/assets/images/logo.svg";
import Button from "@/components/auth/Button";
import  PasswordInput  from '@/components/auth/PasswordInput';
import { Error } from "@/components/Error";
import authNavigation  from '@/utils/auth/navigation';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { email, token } = useLocalSearchParams<{ email: string; token: string }>();

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:6000/user/reset-password', {
        email,
        token,
        newPassword
      });
      
      if (response.data) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully',
          [
            {
              text: 'Login',
              onPress: authNavigation.goToLogin
            }
          ]
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      // Alert.alert('Error', error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const validatePasswords = () => {
    setError(null);
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill all fields');
      // Alert.alert('Error', 'Please fill all fields');
      return false;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      // Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      // Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={authNavigation.goBack}
          className="p-2"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-3xl font-semibold mr-10">
          Reset Password
        </Text>
      </View>

      <View className="flex-1 p-7 justify-center pb-28">
        <View className="items-center mb-20">
          <Logo width={161} height={41} />
        </View>

        <View className="space-y-6">
          <Text className="text-gray-600 text-center text-base">
            Enter your new password
          </Text>

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={(text: string) => {
              setNewPassword(text);
              setError(null);
            }}
            placeholder="Enter new password"
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text: string) => {
              setConfirmPassword(text);
              setError(null);
            }}
            placeholder="Confirm new password"
          />
          <Button loading={loading} actionFunction={handleResetPassword} buttonText="Reset Password" buttonTextLoading="Resetting Password..." />
          {error && <Error error={error} />}
        </View>
      </View>
    </View>
  );
} 