import { Text, View } from 'react-native'
import React from 'react'
import Login from './login';
import ForgetPassword from './forgot-password';
import ResetPassword from './reset-password';
import VerifyOTP from './verify-otp';
import { Stack } from 'expo-router';

const Auth = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>

      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="verify-otp"
        options={{ headerShown: false }}
      />
    </Stack>
    // <View className='flex-1 h-full'>
    //   <VerifyOTP/>
    // </View>
  )
}

export default Auth;

