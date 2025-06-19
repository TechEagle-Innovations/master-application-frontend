import { AuthProvider } from '@/utils/auth/AuthContext';
import { ShipmentProvider } from '../utils/ShipmentContext';
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect, useCallback } from "react";
import { View } from "react-native";
import { useAuth } from '@/utils/auth/AuthContext';

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading } = useAuth();

  const handleNavigation = useCallback(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/dashboard');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [segments, navigationState?.key, isAuthenticated, isLoading, router]);

  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  if (!navigationState?.key || isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(app)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const navigationState = useRootNavigationState();

  if (!navigationState?.key) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <AuthProvider>
      <ShipmentProvider>
        <RootLayoutNav />
      </ShipmentProvider>
    </AuthProvider>
  );
}
