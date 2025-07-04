import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Platform, StatusBar, Dimensions, ViewStyle, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../utils/auth/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import HamburgerMenu from '../../components/HamburgerMenu';
import DroneCard from '../../components/DroneCard';
import Drone from "@/assets/images/drone.svg";
import History from "@/assets/images/history.svg";
import DroneActive from "@/assets/images/drone-active.svg";
import HistoryActive from "@/assets/images/history-active.svg";
import InFlightDroneCard from '../../components/InFlightDroneCard';
import { droneService } from '../../utils/api/services/DroneService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FlightHistoryItem, flightService } from '@/utils/api/services/FlightService';
import Notification, { NotificationType } from '@/components/Notification';

// Layout interface remains the same
interface Layout {
  headerHeight: number;
  bottomNavHeight: number;
  contentHeight: number;
}

// Separate interfaces for different drone states
interface AvailableDrone {
  id: string;
  location: string;
  lastMaintenance: string;
  status: 'Assigned' | 'Stand-By';
  currentFlightId?: string;
}

interface InFlightDrone {
  id: string;
  flightId: string;
  localFlightId: string;
  from: string;
  to: string;
  eta: string;
  battery: number;
  status: 'In Transit' | 'Arrived';
  startTime: string;
}

// Separate state interfaces for better type safety
interface AvailableDronesState {
  isLoading: boolean;
  error: string | null;
  drones: AvailableDrone[];
}

interface InFlightDronesState {
  isLoading: boolean;
  error: string | null;
  drones: InFlightDrone[];
}

// Dashboard state combines both
interface DashboardState {
  available: AvailableDronesState;
  inFlight: InFlightDronesState;
}
// Memoized components
const Header = React.memo(({
  headerHeight,
  paddingTop,
  onMenuPress
}: {
  headerHeight: number;
  paddingTop: number;
  onMenuPress: () => void;
}) => (
  <View
    className="flex-row items-center justify-between px-4 bg-white"
    style={{ height: headerHeight, paddingTop }}
    accessibilityRole="header"
  >
    <Text
      className="text-3xl font-bold text-gray-800"
      accessibilityRole="header"
      accessibilityLabel="Drones"
    >
      Drones
    </Text>
    <TouchableOpacity
      onPress={onMenuPress}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      accessibilityHint="Opens the navigation menu"
    >
      <Bars3Icon size={30} color="black" />
    </TouchableOpacity>
  </View>
));

const Tabs = React.memo(({
  activeTab,
  onTabPress
}: {
  activeTab: 'available' | 'inFlight';
  onTabPress: (tab: 'available' | 'inFlight') => void;
}) => (
  <View
    className="w-full flex-row px-4 mt-2 border-b border-gray-200"
    accessibilityRole="tablist"
  >
    <TouchableOpacity
      className={`pb-2 ${activeTab === 'available' ? 'border-b-2 border-orange-500' : ''} mr-6 flex-1`}
      onPress={() => onTabPress('available')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === 'available' }}
      accessibilityLabel="Available drones"
      accessibilityHint="Shows list of available drones"
    >
      <Text className={`${activeTab === 'available' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>
        Available
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      className={`pb-2 ${activeTab === 'inFlight' ? 'border-b-2 border-orange-500' : ''} flex-1`}
      onPress={() => onTabPress('inFlight')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === 'inFlight' }}
      accessibilityLabel="In flight drones"
      accessibilityHint="Shows list of drones currently in flight"
    >
      <Text className={`${activeTab === 'inFlight' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>
        In Flight
      </Text>
    </TouchableOpacity>
  </View>
));

const BottomNav = React.memo(({
  activeNav,
  onNavPress,
  style
}: {
  activeNav: 'drones' | 'history';
  onNavPress: (nav: 'drones' | 'history') => void;
  style: ViewStyle;
}) => (
  <View
    className="w-full bg-white border-t border-gray-200 flex-row justify-around"
    style={[
      style,
      {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
      }
    ]}
    accessibilityRole="tablist"
  >
    <TouchableOpacity
      className="items-center justify-center flex-1 py-2"
      onPress={() => onNavPress('drones')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeNav === 'drones' }}
      accessibilityLabel="Drones tab"
      accessibilityHint="Navigate to drones list"
    >
      {activeNav === 'drones' ?
        <DroneActive size={25} className="text-primary" /> :
        <Drone size={24} className="text-gray-500" />
      }
      <Text className={`${activeNav === 'drones' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>
        Drones
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      className="items-center justify-center flex-1 py-2"
      onPress={() => onNavPress('history')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeNav === 'history' }}
      accessibilityLabel="History tab"
      accessibilityHint="Navigate to history view"
    >
      {activeNav === 'history' ?
        <HistoryActive size={24} className="text-primary" /> :
        <History size={24} className="text-gray-500" />
      }
      <Text className={`${activeNav === 'history' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>
        History
      </Text>
    </TouchableOpacity>
  </View>
));

export default function Dashboard() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ message: string, type: NotificationType }>();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'inFlight'>('available');
  const [activeNav, setActiveNav] = useState<'drones' | 'history'>('drones');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: NotificationType } | null>(null);
  const router = useRouter();

  // Separate states for available and in-flight drones
  const [state, setState] = useState<DashboardState>({
    available: {
      isLoading: true,
      error: null,
      drones: [],
    },
    inFlight: {
      isLoading: true,
      error: null,
      drones: [],
    },
  });

  // Notification effect remains the same
  useEffect(() => {
    console.log("Notification params:", params.message, params.type);
    if (params.message && params.type) {
      setNotification({ message: params.message, type: params.type });

      // Clear both the state and URL params after showing
      const timer = setTimeout(() => {
        setNotification(null);
        // Optionally clear the params from URL
        router.setParams({ message: undefined, type: undefined });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [params.message, params.type]);

  // Layout calculation remains the same
  const layout = useMemo<Layout>(() => {
    const windowHeight = Dimensions.get('window').height;
    const bottomNavHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 56 + insets.bottom;
    const headerHeight = Platform.OS === 'ios' ? 44 + insets.top : 56 + insets.top;

    return {
      headerHeight,
      bottomNavHeight,
      contentHeight: windowHeight - headerHeight - bottomNavHeight,
    };
  }, [insets.top, insets.bottom]);

  // Fetch available drones
  const fetchAvailableDrones = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        available: {
          ...prev.available,
          isLoading: true,
          error: null,
        },
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

      setState(prev => ({
        ...prev,
        available: {
          ...prev.available,
          isLoading: false,
          drones,
        },
      }));
    } catch (error: any) {
      console.error('Failed to fetch available drones:', error);

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to fetch available drones. Please try again.';

      setState(prev => ({
        ...prev,
        available: {
          ...prev.available,
          isLoading: false,
          error: errorMessage,
          drones: [],
        },
      }));

      // Show alert for serious errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert('Session Expired', 'Please login again');
      } else if (error.response?.status >= 500) {
        Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
      }
    }
  }, []);

  // Fetch in-flight drones
  const fetchInFlightDrones = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        inFlight: {
          ...prev.inFlight,
          isLoading: true,
          error: null,
        },
      }));

      const response: any = await flightService.getFlightHistory("T008VEE0003VERPL1003012024");

      if (!response || response.status !== 'success' || !Array.isArray(response.data)) {
        throw new Error('Invalid response structure from flights API');
      }

      // Filter for active flights (pre-flight completed but not post-flight)
      const activeFlights = response.data.filter(
        (flight: any) =>
          flight.isPreFlightChecklistCompleted &&
          !flight.isPostFlightChecklistCompleted &&
          !flight.isCompleted &&
          new Date().getDay() === new Date(flight.createdAt).getDay()
      );

      const drones: InFlightDrone[] = activeFlights.map((flight: any) => ({
        id: flight.drone_id || 'Unknown',
        flightId: flight._id,
        localFlightId: flight.localFlightId,
        from: flight.start_location || 'Unknown',
        to: flight.end_location || 'Unknown',
        eta: flight.time_taken ? `${flight.time_taken} mins` : 'Calculating...',
        battery: 100, // Replace with actual data if available
        status: 'In Transit', // You might have actual status from API
        startTime: flight.date_created || new Date().toISOString(),
      }));

      setState(prev => ({
        ...prev,
        inFlight: {
          ...prev.inFlight,
          isLoading: false,
          drones,
        },
      }));
    } catch (error: any) {
      console.error('Failed to fetch in-flight drones:', error);

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to fetch in-flight drones. Please try again.';

      setState(prev => ({
        ...prev,
        inFlight: {
          ...prev.inFlight,
          isLoading: false,
          error: errorMessage,
          drones: [],
        },
      }));

      // Show alert for serious errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert('Session Expired', 'Please login again');
      } else if (error.response?.status >= 500) {
        Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
      }
    }
  }, []);

  // Fetch data when tab changes or component mounts
  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailableDrones();
    } else {
      fetchInFlightDrones();
    }
  }, [activeTab, fetchAvailableDrones, fetchInFlightDrones]);

  // Filter drones based on search query
  const filteredDrones = useMemo(() => {
    const currentState = activeTab === 'available' ? state.available : state.inFlight;
    const drones = currentState.drones;

    if (!searchQuery.trim()) {
      return drones;
    }

    const query = searchQuery.toLowerCase();

    return drones.filter(drone => {
      if (activeTab === 'available') {
        const availableDrone = drone as AvailableDrone;
        return (
          availableDrone.id.toLowerCase().includes(query) ||
          availableDrone.location.toLowerCase().includes(query)
        );
      } else {
        const inFlightDrone = drone as InFlightDrone;
        return (
          inFlightDrone.id.toLowerCase().includes(query) ||
          inFlightDrone.from.toLowerCase().includes(query) ||
          inFlightDrone.to.toLowerCase().includes(query)
        );
      }
    });
  }, [activeTab, state.available.drones, state.inFlight.drones, searchQuery]);

  // Memoized callbacks
  const handleMenuPress = useCallback(() => setMenuVisible(true), []);
  const handleTabPress = useCallback((tab: 'available' | 'inFlight') => setActiveTab(tab), []);
  const handleNavPress = useCallback((nav: 'drones' | 'history') => {
    setActiveNav(nav);
    if (nav === 'history') {
      router.push('/(app)/history');
    }
  }, [router]);
  const handleMenuClose = useCallback(() => setMenuVisible(false), []);
  const handleSearchChange = useCallback((text: string) => setSearchQuery(text), []);

  const handleDronePress = useCallback((drone: AvailableDrone | InFlightDrone) => {
    if (activeTab === 'available') {
      const availableDrone = drone as AvailableDrone;
      router.push({
        pathname: '/(app)/drone-detail',
        params: {
          id: availableDrone.id,
          assigned: availableDrone.status === 'Assigned' ? '1' : '0',
          currentFlightId: availableDrone.currentFlightId || '',

        }
      });
    } else {
      const inFlightDrone = drone as InFlightDrone;
      router.push({
        pathname: '/(app)/drone-tracking',
        params: {
          flightId: inFlightDrone.flightId,
          localFlightId: inFlightDrone.localFlightId,
          droneId: inFlightDrone.id,
          from: inFlightDrone.from,
          to: inFlightDrone.to,
          eta: inFlightDrone.eta,
        }
      });
    }
  }, [activeTab, router]);

  // Render loading state
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ea580c" />
      <Text className="mt-4 text-gray-600">
        {activeTab === 'available'
          ? 'Loading available drones...'
          : 'Loading in-flight drones...'}
      </Text>
    </View>
  );

  // Render error state
  const renderError = () => {
    const error = activeTab === 'available' ? state.available.error : state.inFlight.error;

    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-red-500 text-lg text-center mb-4">
          {error}
        </Text>
        <TouchableOpacity
          className="bg-orange-500 px-6 py-3 rounded-lg"
          onPress={activeTab === 'available' ? fetchAvailableDrones : fetchInFlightDrones}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="text-gray-600 text-lg text-center">
        {searchQuery
          ? 'No results found matching your search'
          : activeTab === 'available'
            ? 'No drones currently available'
            : 'No drones currently in flight'}
      </Text>
    </View>
  );

  // Render drone list
  const renderDroneList = () => {
    if (activeTab === 'available') {
      return (
        <ScrollView
          className="flex-1 mt-4 px-4"
          contentContainerStyle={{ paddingBottom: layout.bottomNavHeight + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {(filteredDrones as AvailableDrone[]).map((drone) => (
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
    } else {
      return (
        <ScrollView
          className="flex-1 mt-4 px-4"
          contentContainerStyle={{ paddingBottom: layout.bottomNavHeight + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {(filteredDrones as InFlightDrone[]).map((drone) => (
            <InFlightDroneCard
              key={drone.flightId}
              id={drone.localFlightId}
              droneId={drone.id}
              from={drone.from}
              to={drone.to}
              eta={drone.eta}
              battery={drone.battery}
              // status={drone.status}
              onPress={() => handleDronePress(drone)}
            />
          ))}
        </ScrollView>
      );
    }
  };

  // Main render function
  const renderContent = () => {
    const currentState = activeTab === 'available' ? state.available : state.inFlight;

    if (currentState.isLoading) {
      return renderLoading();
    }

    if (currentState.error) {
      return renderError();
    }

    if (filteredDrones.length === 0) {
      return renderEmpty();
    }

    return renderDroneList();
  };

  // Keep your existing JSX return statement
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Notification Snackbar */}
      {notification && (
        <Notification
          key={`${notification.message}-${Date.now()}`} // Unique key to force re-render
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
          position="top"
          duration={4000}
        />
      )}

      <Header
        headerHeight={layout.headerHeight}
        paddingTop={insets.top}
        onMenuPress={handleMenuPress}
      />

      <View className="px-4 py-2">
        <Text className="text-gray-600 text-lg">Select a drone to view details</Text>
      </View>

      <Tabs activeTab={activeTab} onTabPress={handleTabPress} />

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

      {renderContent()}

      <BottomNav
        activeNav={activeNav}
        onNavPress={handleNavPress}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: layout.bottomNavHeight,
          paddingBottom: insets.bottom,
        }}
      />

      <HamburgerMenu
        isVisible={isMenuVisible}
        onClose={handleMenuClose}
      />
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
      <Text className="text-gray-600 font-medium">{label}</Text>
      <Text className="text-gray-800">{value || 'N/A'}</Text>
    </View>
  );
} 