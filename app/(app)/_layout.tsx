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
      <Stack.Screen
        name="drone-detail"
        options={{
          headerShown: false, // Hide header for drone detail screen
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          headerShown: false, // Hide header for history screen
        }}
      />
      <Stack.Screen
        name="shipment-detail"
        options={{
          headerShown: false, // Hide header for history screen
        }}
      />
      <Stack.Screen
        name="otp-confirmation"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="parcel-validation"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="maintenance-detail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="battery"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="report-issue"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preflight-checklist"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="drone-tracking"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="postflight-checklist"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="battery-info"
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="after-charging"
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="add-battery"
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="drones"
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="maintainance"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="parcels"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 