import { AuthProvider } from '@/utils/auth/AuthContext';
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (!inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [segments, navigationState?.key]);

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
      <RootLayoutNav />
    </AuthProvider>
  );
}
