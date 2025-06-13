import { Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { useAuth } from '../../utils/auth/AuthContext';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  // This layout will only be rendered if the user is authenticated
  // due to the navigation logic in AuthContext
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <LogoutButton />
          ),
        }}
      />
    </Stack>
  );
}

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Pressable
      onPress={logout}
      className="px-4 py-2"
    >
      <Text className="text-red-500 font-medium">Logout</Text>
    </Pressable>
  );
} 