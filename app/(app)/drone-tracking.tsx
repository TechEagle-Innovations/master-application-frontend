import React from 'react';
import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDroneTracking } from '../../hooks/useDroneTracking';
import Header from '@/components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

 // Update to your backend URL if needed

const DroneTracking = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const flightId = params.flightId as string || 'DRN-2024-0342';

  const { drone, route, connectionStatus } = useDroneTracking(flightId);

  // Markers
  const origin = route[0];
  const destination = route[route.length - 1];
  const dronePos = drone ? { latitude: drone.lat, longitude: drone.long } : undefined;

  // Error/Loading UI
  if (connectionStatus === 'disconnected') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-100 bg-white">
          <Ionicons name="arrow-back" size={28} onPress={() => router.back()} />
          <Text className="text-xl font-semibold text-gray-900">{flightId}</Text>
          <View style={{ width: 28 }} />
        </View>
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle" size={48} color="#e74c3c" />
          <Text className="mt-4 text-lg text-red-500 font-semibold">Connection lost</Text>
          <Text className="text-gray-500 mt-2">Unable to connect to the drone server.</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (connectionStatus !== 'connected' || !drone || !dronePos) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-100 bg-white">
          <Ionicons name="arrow-back" size={28} onPress={() => router.back()} />
          <Text className="text-xl font-semibold text-gray-900">{flightId}</Text>
          <View style={{ width: 28 }} />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1E90FF" />
          <Text className="mt-4 text-gray-500 text-base">
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for drone data...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" style={{paddingBottom:insets.bottom}}>
      {/* Header */}
      <Header insets={insets} text={drone.id}/>
      {/* Map */}
      <View className="w-full" style={{ height: 420 }}>
        <MapView
          style={{ flex: 1, borderRadius: 0 }}
          initialRegion={{
            latitude: drone.lat,
            longitude: drone.long,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={{
            latitude: drone.lat,
            longitude: drone.long,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          zoomControlEnabled={false}
        >
          {/* Route Polyline */}
          {route.length > 1 && (
            <Polyline
              coordinates={route}
              strokeColor="#1E90FF"
              strokeWidth={3}
              lineDashPattern={[10, 10]}
            />
          )}
          {/* Origin Marker */}
          {origin && (
            <Marker coordinate={origin}>
              <View className="w-6 h-6 rounded-full border-4 border-blue-500 bg-white" />
            </Marker>
          )}
          {/* Destination Marker */}
          {destination && (
            <Marker coordinate={destination}>
              <View className="w-6 h-6 rounded-full border-4 border-green-500 bg-white" />
            </Marker>
          )}
          {/* Drone Marker */}
          {dronePos && (
            <Marker coordinate={dronePos}>
              <Ionicons name="airplane" size={36} color="#222" style={{ transform: [{ rotate: '45deg' }] }} />
            </Marker>
          )}
        </MapView>
      </View>
      {/* Info Card */}
      <View className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl px-6 pt-5 pb-8 shadow-lg border-t border-gray-100">
        <View className="flex-row items-center mb-2">
          <Text className="text-lg font-semibold text-gray-900 mr-2">{drone.id}</Text>
          <Ionicons name="battery-full" size={20} color="#27ae60" />
          <Text className="ml-2 text-green-600 font-medium text-base">{drone.battery ?? '--'}%</Text>
        </View>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm text-gray-500 w-28 text-center">Central Hub</Text>
          <View className="flex-1 flex-row items-center justify-center">
            <View className="w-3 h-3 rounded-full bg-blue-500" />
            <View className="h-0.5 w-10 bg-gray-200" />
            <Ionicons name="airplane" size={20} color="#222" style={{ marginHorizontal: 2 }} />
            <View className="h-0.5 w-10 bg-gray-200" />
            <View className="w-3 h-3 rounded-full bg-green-500" />
          </View>
          <Text className="text-sm text-gray-500 w-28 text-center">Retail Store C</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-400 mb-1">ETA</Text>
            <Text className="text-xl font-semibold text-gray-900">{drone.eta ?? '--'} mins</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-400 mb-1">Speed</Text>
            <Text className="text-xl font-semibold text-gray-900">{drone.speed ?? '--'} km/h</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-xs text-gray-400 mb-1">Distance</Text>
            <Text className="text-xl font-semibold text-gray-900">{drone.distance ?? '--'} km</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DroneTracking; 