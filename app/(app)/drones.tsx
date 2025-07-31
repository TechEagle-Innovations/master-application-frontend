import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Platform, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import DroneCard from '../../components/DroneCard';
import { droneService } from '../../utils/api/services/DroneService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Notification, { NotificationType } from '@/components/Notification';
import Loader from '@/components/Loader';
import Header from '@/components/Header';

interface AvailableDrone {
  id: string;
  location: string;
  lastMaintenance: string;
  status: 'Assigned' | 'Stand-By';
  currentFlightId?: string;
}

interface DronesState {
  isLoading: boolean;
  error: string | null;
  drones: AvailableDrone[];
}

export default function DronesAtHub() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ message: string, type: NotificationType }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: NotificationType } | null>(null);
  const router = useRouter();

  const [state, setState] = useState<DronesState>({
    isLoading: true,
    error: null,
    drones: [],
  });

  // Notification effect
  useEffect(() => {
    if (params.message && params.type) {
      setNotification({ message: params.message, type: params.type });

      const timer = setTimeout(() => {
        setNotification(null);
        router.setParams({ message: undefined, type: undefined });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [params.message, params.type]);

  // Layout calculation
  const layout = useMemo(() => {
    const windowHeight = Dimensions.get('window').height;
    const headerHeight = Platform.OS === 'ios' ? 44 + insets.top : 56 + insets.top;
    const contentHeight = windowHeight - headerHeight;

    return {
      headerHeight,
      contentHeight,
    };
  }, [insets.top]);

  // Fetch available drones
  const fetchAvailableDrones = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const response: any = await droneService.getAllDronesAtHub();

      if (!response || response?.status !== 'success' || !Array.isArray(response?.data)) {
        throw new Error('Invalid response structure from drones API');
      }

      const drones: AvailableDrone[] = response.data.map((item: any) => ({
        id: item.internal_id || item._id,
        location: item.hub_location || 'Unknown',
        lastMaintenance: item.last_maintenance_date
          ? new Date(item.last_maintenance_date).toLocaleDateString()
          : new Date(item.manufacturing_date).toLocaleDateString(),
        status: item.current_flight_id ? 'Assigned' : 'Stand-By',
        currentFlightId: item.current_flight_id,
      }));

      setState({
        isLoading: false,
        error: null,
        drones,
      });
    } catch (error: any) {
      console.error('Failed to fetch available drones:', error);

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to fetch available drones. Please try again.';

      setState({
        isLoading: false,
        error: errorMessage,
        drones: [],
      });

      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert('Session Expired', 'Please login again');
      } else if (error.response?.status >= 500) {
        Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
      }
    }
  }, []);

  useEffect(() => {
    fetchAvailableDrones();
  }, [fetchAvailableDrones]);

  // Filter drones based on search query
  const filteredDrones = useMemo(() => {
    if (!searchQuery.trim()) {
      return state.drones;
    }

    const query = searchQuery.toLowerCase();
    return state.drones.filter(drone => (
      drone.id.toLowerCase().includes(query) ||
      drone.location.toLowerCase().includes(query)
    ));
  }, [state.drones, searchQuery]);

  const handleSearchChange = useCallback((text: string) => setSearchQuery(text), []);

  const handleDronePress = useCallback((drone: AvailableDrone) => {
    router.push({
      pathname: '/(app)/drone-detail',
      params: {
        id: drone.id,
        assigned: drone.status === 'Assigned' ? '1' : '0',
        currentFlightId: drone.currentFlightId || '',
      }
    });
  }, [router]);

  // Render loading state
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <Loader fullscreen />
      <Text className="mt-4 text-gray-600">Loading available drones...</Text>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="text-red-500 text-lg text-center mb-4">
        {state.error}
      </Text>
      <TouchableOpacity
        className="bg-orange-500 px-6 py-3 rounded-lg"
        onPress={fetchAvailableDrones}
      >
        <Text className="text-white font-semibold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="text-gray-600 text-lg text-center">
        {searchQuery
          ? 'No results found matching your search'
          : 'No drones currently available'}
      </Text>
    </View>
  );

  // Render drone list
  const renderDroneList = () => (
    <ScrollView
      className="flex-1 mt-4 px-4"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {filteredDrones.map((drone) => (
        <DroneCard
          key={drone.id}
          id={drone.id}
          location={drone.location}
          lastMaintainance={drone.lastMaintenance}
          status={drone.status}
          onPress={() => handleDronePress(drone)}
        />
      ))}
    </ScrollView>
  );

  // Main render function
  const renderContent = () => {
    if (state.isLoading) {
      return renderLoading();
    }

    if (state.error) {
      return renderError();
    }

    if (filteredDrones.length === 0) {
      return renderEmpty();
    }

    return renderDroneList();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Notification Snackbar */}
      {notification && (
        <Notification
          key={`${notification.message}-${Date.now()}`}
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
          position="top"
          duration={4000}
        />
      )}

      {/* Header */}
      {/* <View
        className="flex-row items-center justify-between px-4 bg-white"
        style={{ height: layout.headerHeight, paddingTop: insets.top }}
      >
         
        <Text className="text-3xl font-bold text-gray-800">Drones</Text>
      </View> */}
      <Header insets={insets} text={`Drones`} />
      {/* Content */}
      {/* <View className="px-4 py-2">
        <Text className="text-gray-600 text-lg">Select a drone to view details</Text>
      </View> */}

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-2">
        <MagnifyingGlassIcon size={20} color="gray" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-700"
          placeholder="Search drones..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>

      {/* Drone List */}
      <View style={{ height: layout.contentHeight }}>
        {renderContent()}
      </View>
    </View>
  );
}