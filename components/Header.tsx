import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { EdgeInsets } from 'react-native-safe-area-context';

const Header = ({text, insets}:{text: string, insets:EdgeInsets}) => {
    const router = useRouter();
  return (
    <View className="flex-row items-center px-4 bg-white border-b border-gray-100" style={{ paddingTop: insets.top, minHeight: 56 + insets.top }}>
    <TouchableOpacity onPress={router.back} className="p-2" accessibilityRole="button" accessibilityLabel="Go back">
        <ChevronLeft size={24} color="#000" />
    </TouchableOpacity>
    <Text className="flex-1 text-center text-xl mr-10">{text}</Text>
</View>
  )
}

export default Header;