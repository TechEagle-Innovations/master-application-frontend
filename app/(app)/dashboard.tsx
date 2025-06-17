import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Platform, StatusBar, Dimensions, ViewStyle, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../utils/auth/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { HomeIcon as HomeOutline, ClockIcon as ClockOutline } from 'react-native-heroicons/outline';
import { HomeIcon as HomeSolid, ClockIcon as ClockSolid } from 'react-native-heroicons/solid';
import HamburgerMenu from '../../components/HamburgerMenu';
import DroneCard from '../../components/DroneCard';
import Drone from "@/assets/images/drone.svg";
import History from "@/assets/images/history.svg";
import DroneActive from "@/assets/images/drone-active.svg";
import HistoryActive from "@/assets/images/history-active.svg";

interface Layout {
  headerHeight: number;
  bottomNavHeight: number;
  contentHeight: number;
}

interface Drone {
  id: string;
  location: string;
  lastUsed: string;
  status: 'Assigned' | 'Stand-By';
}

interface DashboardState {
  isLoading: boolean;
  error: string | null;
  drones: Drone[];
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
        <DroneActive size={25} className="text-primary"/> : 
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
        <History size={24} className="text-gray-500"/>
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
  const [isMenuVisible, setMenuVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'available' | 'inFlight'>('available');
  const [activeNav, setActiveNav] = useState<'drones' | 'history'>('drones');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [state, setState] = useState<DashboardState>({
    isLoading: true,
    error: null,
    drones: [],
  });

  // Calculate layout values that persist across re-renders
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

  // Fetch drones data
  useEffect(() => {
    const fetchDrones = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Simulated API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockDrones: Drone[] = [
          { id: 'DRN-2023-001', location: 'New York City, NY', lastUsed: 'Oct 15, 2023', status: 'Assigned' },
          { id: 'DRN-2023-002', location: 'Los Angeles, CA', lastUsed: 'Oct 16, 2023', status: 'Stand-By' },
          { id: 'DRN-2023-003', location: 'San Francisco, CA', lastUsed: 'Oct 15, 2023', status: 'Stand-By' },
          { id: 'DRN-2023-004', location: 'New York, NY', lastUsed: 'Oct 14, 2023', status: 'Stand-By' },
          { id: 'DRN-2023-005', location: 'Chicago, IL', lastUsed: 'Oct 13, 2023', status: 'Stand-By' },
        ];

        setState(prev => ({ ...prev, isLoading: false, drones: mockDrones }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch drones' 
        }));
      }
    };

    fetchDrones();
  }, []);

  // Filter drones based on search query and active tab
  const filteredDrones = useMemo(() => {
    return state.drones.filter(drone => {
      const matchesSearch = drone.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drone.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'available' ? drone.status === 'Stand-By' : drone.status === 'Assigned';
      return matchesSearch && matchesTab;
    });
  }, [state.drones, searchQuery, activeTab]);

  // Memoized callbacks
  const handleMenuPress = useCallback(() => setMenuVisible(true), []);
  const handleTabPress = useCallback((tab: 'available' | 'inFlight') => setActiveTab(tab), []);
  const handleNavPress = useCallback((nav: 'drones' | 'history') => setActiveNav(nav), []);
  const handleMenuClose = useCallback(() => setMenuVisible(false), []);
  const handleSearchChange = useCallback((text: string) => setSearchQuery(text), []);

  // Styles
  const headerStyle: ViewStyle = {
    height: layout.headerHeight,
    paddingTop: insets.top,
  };

  const bottomNavStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: layout.bottomNavHeight,
    paddingBottom: insets.bottom,
  };

  const scrollViewStyle: ViewStyle = {
    height: layout.contentHeight,
    paddingBottom: layout.bottomNavHeight + 20, // Add extra padding for content
  };

  const renderContent = () => {
    if (state.isLoading) {
      return (
        <View 
          className="flex-1 items-center justify-center"
          accessibilityRole="progressbar"
          accessibilityLabel="Loading drones"
        >
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="mt-4 text-gray-600">Loading drones...</Text>
        </View>
      );
    }

    if (state.error) {
      return (
        <View 
          className="flex-1 items-center justify-center px-4"
          accessibilityRole="alert"
        >
          <Text className="text-red-500 text-lg text-center mb-4">{state.error}</Text>
          <TouchableOpacity 
            className="bg-orange-500 px-6 py-3 rounded-lg"
            onPress={() => setState(prev => ({ ...prev, isLoading: true, error: null }))}
            accessibilityRole="button"
            accessibilityLabel="Retry loading drones"
            accessibilityHint="Attempts to load drones again"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredDrones.length === 0) {
      return (
        <View 
          className="flex-1 items-center justify-center px-4"
          accessibilityRole="none"
        >
          <Text className="text-gray-600 text-lg text-center">
            {searchQuery ? 'No drones found matching your search' : 'No drones available'}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView 
        className="flex-1 mt-4 px-4"
        contentContainerStyle={{
          paddingBottom: layout.bottomNavHeight + 20,
        }}
        style={scrollViewStyle}
        accessibilityRole="list"
        accessibilityLabel={`List of ${filteredDrones.length} drones`}
        showsVerticalScrollIndicator={false}
      >
        {filteredDrones.map((drone) => (
          <DroneCard key={drone.id} {...drone} />
        ))}
      </ScrollView>
    );
  };

  return (
    <View 
      className="flex-1 bg-white"
      accessibilityRole="none"
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <Header 
        headerHeight={layout.headerHeight}
        paddingTop={insets.top}
        onMenuPress={handleMenuPress}
      />

      <View 
        className="px-4 py-2"
        accessibilityRole="none"
      >
        <Text className="text-gray-600 text-lg">Select a drone to view details</Text>
      </View>

      <Tabs activeTab={activeTab} onTabPress={handleTabPress} />

      <View 
        className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-2"
        accessibilityRole="search"
      >
        <MagnifyingGlassIcon size={20} color="gray" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-700"
          placeholder="Search drones..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={handleSearchChange}
          accessibilityRole="search"
          accessibilityLabel="Search drones"
          accessibilityHint="Type to search for drones by ID or location"
        />
      </View>

      {renderContent()}

      <BottomNav 
        activeNav={activeNav}
        onNavPress={handleNavPress}
        style={bottomNavStyle}
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