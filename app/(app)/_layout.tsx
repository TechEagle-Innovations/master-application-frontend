import { Stack } from 'expo-router';


export default function AppLayout() {

  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          title: '',
          headerShown: false, // Disable default header to allow custom header in DashboardScreen
        }}
      />
    </Stack>
  );
} 