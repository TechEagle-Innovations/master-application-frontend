import React, { useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Animated, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDroneTracking } from '../../hooks/useDroneTracking';
import Header from '@/components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DroneImage from '@/assets/images/drone_img.png';
import { useParcelPhoto } from '../../hooks/useParcelPhoto';
import ParcelValidationModal from '@/components/ParcelValidationModal';
import ValidationSuccessModal from '@/components/ValidationSuccessModal';
import { isAtDelivery, haversineDistance } from '@/utils/droneUtils';

const DroneTracking = () => {
  // All hooks and state at the top
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const flightId = params.flightId as string || '';

  // Enhanced state for error and timeout
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { drone, route, connectionStatus } = useDroneTracking(flightId);
  const mapRef = useRef<MapView>(null);
  const [followDrone, setFollowDrone] = useState(true);
  const [lastRegion, setLastRegion] = useState<any>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [showParcelValidation, setShowParcelValidation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const { photo, loading: photoLoading, error: photoError, takePhoto, reset: resetPhoto } = useParcelPhoto();

  // Progress bar width state and ref (for bottom info card)
  const [barWidth, setBarWidth] = useState<number>(300); // fallback 300px
  const barRef = useRef<View>(null);

  // Timeout for loading state (10 seconds)
  useEffect(() => {
    if (connectionStatus === 'error') {
      setTimeout(() => {
        router.replace({ pathname: '/(app)/dashboard', params: { message: 'Please Connect Drone First', type: connectionStatus } });
      }, 200);
    }
    if (connectionStatus === 'connected' && drone) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTimedOut(false);
      setError(null);
      return;
    }
    setTimedOut(false);
    setError(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      setError('No live data received for this drone. Please try again later.');
    }, 10000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [connectionStatus, drone, router]);

  // Validate flightId
  useEffect(() => {
    if (!flightId) {
      setError('No flight ID provided.');
    }
  }, [flightId]);

  // Validate drone data
  useEffect(() => {
    if (drone && (typeof drone.lat !== 'number' || typeof drone.long !== 'number')) {
      setError('Invalid drone data received.');
    }
  }, [drone]);

  // Safe access to route points
  const origin = route && route.length > 0 ? route[0] : null;
  const destination = route && route.length > 1 ? route[route.length - 1] : null;
  const dronePos = drone && typeof drone.lat === 'number' && typeof drone.long === 'number' ? { latitude: drone.lat, longitude: drone.long } : undefined;

  // Debug: Log route
  useEffect(() => {
    console.log('[UI] Route array:', route);
  }, [route]);

  // Retry handler
  const handleRetry = () => {
    setError(null);
    setTimedOut(false);
    // Force re-mount by navigating away and back
    router.replace({ pathname: '/(app)/drone-tracking', params: { flightId } });
  };

  // Calculate heading (direction) for drone marker
  let droneHeading = typeof drone?.heading === 'number' ? drone.heading
    : (typeof drone?.yaw === 'number' ? drone.yaw
      : undefined);
  // Fallback: calculate heading from last two route points if not present
  if (droneHeading === undefined && route && route.length > 1) {
    const prev = route[route.length - 2];
    const curr = route[route.length - 1];
    if (prev && curr && typeof prev.longitude === 'number' && typeof prev.latitude === 'number' && 
        typeof curr.longitude === 'number' && typeof curr.latitude === 'number') {
      const toRad = (deg: number) => deg * Math.PI / 180;
      const toDeg = (rad: number) => rad * 180 / Math.PI;
      const dLon = toRad(curr.longitude - prev.longitude);
      const y = Math.sin(dLon) * Math.cos(toRad(curr.latitude));
      const x = Math.cos(toRad(prev.latitude)) * Math.sin(toRad(curr.latitude)) - Math.sin(toRad(prev.latitude)) * Math.cos(toRad(curr.latitude)) * Math.cos(dLon);
      droneHeading = (toDeg(Math.atan2(y, x)) + 360) % 360;
    }
  }

  // Animate map to drone when follow mode is enabled and drone moves
  useEffect(() => {
    if (followDrone && dronePos && mapRef.current) {
      mapRef.current.animateCamera({
        center: dronePos,
        heading: droneHeading || 0,
        pitch: 0,
        zoom: 17,
      }, { duration: 500 });
    }
  }, [dronePos, droneHeading, followDrone]);

  // Disable follow mode if user interacts with the map
  const handleRegionChange = (region: any) => {
    setLastRegion(region);
    if (followDrone) setFollowDrone(false);
  };

  // Effect: trigger parcel validation popup
  useEffect(() => {
    if (
      drone &&
      drone.arm_status === false &&
      destination &&
      isAtDelivery(drone, destination) &&
      !showParcelValidation &&
      !showSuccess &&
      !hasValidated
    ) {
      setShowParcelValidation(true);
    }
  }, [drone, destination, showParcelValidation, showSuccess, hasValidated]);

  // Handler: validate parcel
  const handleValidate = () => {
    setShowParcelValidation(false);
    setShowSuccess(true);
    setHasValidated(true);
    resetPhoto();
  };

  // Handler: close success popup
  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSelectedOption(null);
    resetPhoto();
  };

  // Handler: close/cancel validation modal
  const handleValidationClose = () => {
    setShowParcelValidation(false);
    setHasValidated(true);
    setSelectedOption(null);
    resetPhoto();
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-100 bg-white">
          <Ionicons name="arrow-back" size={28} onPress={() => router.back()} />
          <Text className="text-xl font-semibold text-gray-900">{flightId || 'No Flight'}</Text>
          <View style={{ width: 28 }} />
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={48} color="#e74c3c" />
          <Text className="mt-4 text-lg text-red-500 font-semibold text-center">{error}</Text>
          <TouchableOpacity
            className="mt-6 bg-orange-500 px-6 py-3 rounded-lg"
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            accessibilityHint="Retry loading drone data"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
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
          <TouchableOpacity
            className="mt-6 bg-orange-500 px-6 py-3 rounded-lg"
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            accessibilityHint="Retry connecting to server"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
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
            {connectionStatus === 'connecting' ? 'Connecting...' : timedOut ? 'No live data received.' : 'Waiting for drone data...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const deliveryOptions = ['Delivered', 'Not Delivered'];

  // Safe initial region calculation
  const initialRegion = {
    latitude: drone.lat || 0,
    longitude: drone.long || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
      {/* Header */}
      <Header insets={insets} text={params.localFlightId as string} />
      {/* Map */}
      <View className="w-full h-full">
        <MapView
          ref={mapRef}
          style={{ flex: 1, borderRadius: 0 }}
          initialRegion={initialRegion}
          region={followDrone ? {
            latitude: drone.lat || 0,
            longitude: drone.long || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          } : lastRegion}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          zoomControlEnabled={false}
          mapType={mapType}
        >
          {/* Route Polyline */}
          {route && route.length > 1 && (
            <Polyline
              coordinates={route}
              strokeColor="#2962ff"
              strokeWidth={3}
            />
          )}
          {/* Origin Marker (Takeoff) */}
          {origin && (
            <Marker coordinate={{ latitude: origin.latitude, longitude: origin.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
              <View className="w-6 h-6 rounded-full border-4 border-blue-500 bg-white" />
            </Marker>
          )}
          {/* Destination Marker (Landing) */}
          {destination && (
            <Marker coordinate={{ latitude: destination.latitude, longitude: destination.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
              <View className="w-6 h-6 rounded-full border-4 border-green-500 bg-white" />
            </Marker>
          )}
          {/* Drone Marker */}
          {dronePos && (
            <Marker coordinate={dronePos} anchor={{ x: 0.5, y: 0.5 }}>
              <Animated.View style={{
                transform: [{ rotate: `${droneHeading || 0}deg` }],
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Image
                  source={DroneImage}
                  style={{ width: 63, height: 63, resizeMode: 'contain' }}
                  accessibilityLabel="Drone"
                />
              </Animated.View>
            </Marker>
          )}
        </MapView>
        {/* Follow Drone Button */}
        <View style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => setFollowDrone((f) => !f)}
            style={{ backgroundColor: followDrone ? '#1E90FF' : '#fff', borderRadius: 24, padding: 10, borderWidth: 1, borderColor: '#1E90FF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, marginRight: 8, alignItems: 'center', justifyContent: 'center' }}
            accessibilityRole="button"
            accessibilityLabel={followDrone ? 'Disable follow drone (map will not auto-center)' : 'Enable follow drone (map will auto-center on drone)'}
            accessibilityHint="Toggles whether the map follows the drone's position."
          >
            <Ionicons name="locate" size={24} color={followDrone ? '#fff' : '#1E90FF'} />
            <Text style={{ fontSize: 10, color: followDrone ? '#fff' : '#1E90FF', marginTop: 2 }}>{followDrone ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMapType((t) => t === 'standard' ? 'satellite' : 'standard')}
            style={{ backgroundColor: mapType === 'satellite' ? '#1E90FF' : '#fff', borderRadius: 24, padding: 10, borderWidth: 1, borderColor: '#1E90FF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, alignItems: 'center', justifyContent: 'center' }}
            accessibilityRole="button"
            accessibilityLabel={mapType === 'satellite' ? 'Switch to standard map' : 'Switch to satellite map'}
            accessibilityHint="Toggles between standard and satellite map views."
          >
            <Ionicons name="globe-outline" size={24} color={mapType === 'satellite' ? '#fff' : '#1E90FF'} />
            <Text style={{ fontSize: 10, color: mapType === 'satellite' ? '#fff' : '#1E90FF', marginTop: 2 }}>{mapType === 'satellite' ? 'Satellite' : 'Standard'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Info Card - Redesigned for live progress */}
      <View className="absolute bottom-0 left-0 w-full">
        <View className="bg-white rounded-2xl p-4" style={{
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 2 },
        }}>
          <View className='p-5 mb-5 rounded-2xl border border-gray-200 bg-white'
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.9,
              shadowRadius: 2,
            }}>
            {/* Top Row: Drone ID and Battery */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold text-gray-800">{drone.id || params.localFlightId || '---'}</Text>
              <View className="flex-row items-center">
                <Ionicons name="battery-full" size={22} color="#27ae60" />
                <Text className="ml-1 text-green-600 font-semibold text-base">{drone.battery ?? '--'}%</Text>
              </View>
            </View>

            {/* Progress Bar with Endpoints, Drone Icon, and ETA */}
            <View className="flex-row items-center mb-1 relative h-9">
              {/* Origin Dot */}
              <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1 z-10" />
              {/* Progress Bar */}
              <View
                className="flex-1 h-0.5 bg-gray-800 relative justify-center"
                ref={barRef}
                onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
              >
                {/* Live Drone Icon on Progress Bar */}
                {(() => {
                  let progress = 0;
                  if (route && route.length > 1 && drone.lat && drone.long && origin && destination) {
                    const totalDist = haversineDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
                    const currDist = haversineDistance(origin.latitude, origin.longitude, drone.lat, drone.long);
                    progress = totalDist > 0 ? currDist / totalDist : 0;
                  }
                  progress = Math.max(0, Math.min(1, progress));
                  const iconWidth = 32;
                  const leftPx = progress * (barWidth - iconWidth);
                  return barWidth > 0 ? (
                    <View
                      style={{
                        position: 'absolute',
                        left: leftPx,
                        top: -15,
                        width: iconWidth,
                      }}
                      className="z-20"
                    >
                      <Image source={DroneImage} className="w-9 h-9" style={{ resizeMode: 'contain', transform: [{ rotate: '90deg' }] }} accessibilityLabel="Drone" />
                    </View>
                  ) : null;
                })()}
              </View>
              {/* Destination Dot */}
              <View className="w-2.5 h-2.5 rounded-full bg-green-600 ml-1 z-10" />
            </View>

            {/* Origin, ETA, Destination */}
            <View className="flex-row items-center">
              <Text className="flex-1 text-gray-600 text-sm">{origin?.name || 'Central Hub'}</Text>
              <Text className="font-bold text-base text-gray-800 mx-2">ETA: {drone.eta ?? '--'} min</Text>
              <Text className="flex-1 text-gray-600 text-sm text-right">{destination?.name || 'Retail Store'}</Text>
            </View>
          </View>

          {/* Altitude, Speed, Distance */}
          <View className="flex-row justify-between items-end mb-5">
            <View className="items-center flex-1">
              <Text className="text-gray-500 text-base">Altitude</Text>
              <Text className="font-bold text-xl text-gray-800 mt-0.5">
                {drone.alt ?? '--'}<Text className="font-normal text-base text-gray-500">m</Text>
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-gray-500 text-base">Speed</Text>
              <Text className="font-bold text-xl text-gray-800 mt-0.5">
                {drone.speed ?? '--'}<Text className="font-normal text-base text-gray-500"> km/h</Text>
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-gray-500 text-base">Distance</Text>
              <Text className="font-bold text-xl text-gray-800 mt-0.5">
                {drone.distance ?? '--'}<Text className="font-normal text-base text-gray-500"> km</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
      {/* Parcel Validation Modal */}
      <ParcelValidationModal
        visible={showParcelValidation}
        onValidate={handleValidate}
        onClose={handleValidationClose}
        options={deliveryOptions}
        loading={photoLoading}
        error={photoError}
        photo={photo}
        onTakePhoto={takePhoto}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      />
      {/* Success Modal */}
      <ValidationSuccessModal
        visible={showSuccess}
        onClose={handleSuccessClose}
      />
    </SafeAreaView>
  );
};

export default DroneTracking; 