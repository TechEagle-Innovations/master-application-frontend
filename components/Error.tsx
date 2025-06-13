import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const Error = ({ error }: { error: string }) => {
  if (!error) return null;
  
  return (
    <View className='bg-red-100 p-4 rounded-lg flex-row items-center'>
      <Ionicons name="alert-circle" size={24} color="#EF4444" />
      <Text className='text-red-600 ml-2 flex-1'>{error}</Text>
    </View>
  )
}

const Success = ({ message }: { message: string }) => {
  if (!message) return null;

  return (
    <View className='bg-green-100 p-4 rounded-lg flex-row items-center'>
      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      <Text className='text-green-600 ml-2 flex-1'>{message}</Text>
    </View>
  )
}

export { Error, Success };
