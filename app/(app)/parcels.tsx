
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ViewStyle, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../utils/auth/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { Router, useRouter } from 'expo-router';
import { Flight, flightService } from '@/utils/api/services/FlightService';
import Notification, { NotificationType } from '@/components/Notification';
import Loader from '@/components/Loader';
import InFlightDroneCard from '@/components/InFlightDroneCard';
import Flights from "@/assets/images/flights.svg";
import Parcel from "@/assets/images/parcels.svg";
import ActiveFlights from "@/assets/images/active-flights.svg";
import ActiveParcels from "@/assets/images/active-parcels.svg";
import HamburgerMenu from '@/components/HamburgerMenu';
import DownwardArrow from '@/assets/images/downward-arrow.svg';
import UpwardArrow from '@/assets/images/upward-arrow.svg';
import { locationIdToNameMap } from '@/utils/api/config';
import { Shipment } from '@/types/shipment';
import { useShipment } from '@/utils/ShipmentContext';
import { tags } from 'react-native-svg/lib/typescript/xmlTags';


// Flight status types
type FlightTab = 'inbound' | 'outbound' | 'history';

// Layout interface remains the same
interface Layout {
  headerHeight: number;
  bottomNavHeight: number;
  contentHeight: number;
}

// Flight card interface
interface FlightHistoryCardProps {
  flight: Flight;
  onPress: (flight: Flight) => void;
}
// interface  FlightCardProps{
//   flight: Flight;
//   onPress: (flight: Flight) => void;
//   userLocation: string | undefined
// }

// const FlightCard: React.FC<FlightCardProps> = React.memo(({ flight, onPress, userLocation }) => {
//   const flightDate = new Date(flight.scheduleDetails.date);
//   const formattedDate = flightDate.toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric'
//   });
//   const formattedTime = flightDate.toLocaleTimeString('en-US', {
//     hour: '2-digit',
//     minute: '2-digit'
//   });
//  let startLocation: string=flight.start_location.toString();
//  let endLocation: string=flight.end_location.toString();
//   return (
//     <TouchableOpacity
//       className="bg-white border border-gray-100 rounded-lg p-4 mb-3 shadow-sm"
//       onPress={() => onPress(flight)}
//       accessibilityRole="button"
//       accessibilityLabel={`Flight ${flight.localFlightId} details`}
//     >
//       <View className="flex-row justify-between items-start w-full">
//         <View className='w-full'>
//           <View className='flex-row justify-between items-center'>
//           <Text className="text-lg font-semibold text-gray-800">{flight.localFlightId}</Text>
//           {userLocation==flight.start_location && <UpwardArrow /> }
//           {userLocation==flight.end_location && <DownwardArrow />}
//           </View>
//           <Text className="text-gray-500 mt-1">{locationIdToNameMap[startLocation]} → {locationIdToNameMap[endLocation]}</Text>
//         </View>
//       </View>
//       <View className="mt-2 flex-row justify-between items-center">
//         <Text className="text-gray-500">{formattedDate} at {formattedTime}</Text>
//         <Text className="text-gray-300 text-2xl">›</Text>
//       </View>
//     </TouchableOpacity>
//   );
// });

const BottomNav = React.memo(({
  activeNav,
  onNavPress,
  style
}: {
  activeNav: 'flights' | 'parcels';
  onNavPress: (nav: 'flights' | 'parcels') => void;
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
      onPress={() => onNavPress('flights')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeNav === 'flights' }}
      accessibilityLabel="Drones tab"
      accessibilityHint="Navigate to drones list"
    >
      {activeNav === 'flights' ?
        <ActiveFlights size={25} className="text-primary" /> :
        <Flights size={24} className="text-gray-500" />
      }
      <Text className={`${activeNav === 'flights' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>
        Flights
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      className="items-center justify-center flex-1 py-2"
      onPress={() => onNavPress('parcels')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeNav === 'parcels' }}
      accessibilityLabel="History tab"
      accessibilityHint="Navigate to history view"
    >
      {activeNav === 'parcels' ?
        <ActiveParcels size={24} className="text-primary" /> :
        <Parcel size={24} className="text-gray-500" />
      }
      <Text className={`${activeNav === 'parcels' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>
        Parcels
      </Text>
    </TouchableOpacity>
  </View>
));

const ShipmentCard = ({ shipment, router, tab }: { shipment: Shipment, router: Router, tab: FlightTab }) => {
  const { setShipment } = useShipment();
  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm  flex-row items-center justify-between"
      accessibilityRole="button"
      accessibilityLabel={`View details for shipment ${shipment.invoiceNumber}`}
      onPress={() => {
        setShipment(shipment);
        router.push({ pathname: '/(app)/shipment-detail', params:{tab: tab} });
      }}
    >
      <View>
        <View className="flex-row items-center mb-2">
          <Text className="text-xl mr-2">{shipment.assignedAWBNumbers}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-400 mr-4">{new Date(shipment.pickUpDetails.scheduledDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</Text>
          <Text className="text-gray-400">{shipment.d_Status[0].remarks}</Text>
        </View>
      </View>
      <Text className="text-4xl text-gray-300">›</Text>
    </TouchableOpacity>
  );
}

const Tabs: React.FC<{
  activeTab: FlightTab;
  onTabPress: (tab: FlightTab) => void;
}> = React.memo(({ activeTab, onTabPress }) => {
  return (
    <View className="w-full flex-row px-4 mt-2 border-b border-gray-200 mt-6" accessibilityRole="tablist">
      {(['inbound', 'outbound', 'history'] as FlightTab[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          className={`pb-2 ${activeTab === tab ? 'border-b-2 border-orange-500' : ''} flex-1`}
          onPress={() => onTabPress(tab)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab }}
        >
          <Text className={`${activeTab === tab ? 'text-orange-500' : 'text-gray-500'} text-lg text-center capitalize`}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const Parcels: React.FC = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FlightTab>('inbound');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [activeNav, setActiveNav] = useState<'flights' | 'parcels'>('parcels');
  const [error, setError] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  // Fetch flights based on user's location
  const fetchFlights = useCallback(async () => {
    if (!user?.location) return;

    try {
      setLoading(true);
      setError(null);

      const response: any = await flightService.getAllShipments();

      if (response?.status === 'success' && Array.isArray(response.data)) {
        setShipments(response.data);
      } else {
        throw new Error('Invalid response structure from flights API');
      }
    } catch (err: any) {
      console.error('Failed to fetch flights:', err);
      setError(err.message || 'Failed to fetch flights. Please try again.');

      if (err.response?.status === 401 || err.response?.status === 403) {
        Alert.alert('Session Expired', 'Please login again');
      } else if (err.response?.status >= 500) {
        Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.location]);

  useEffect(() => {
    fetchFlights();
  }, [activeTab]);

  const handleNavPress = useCallback((nav: 'flights' | 'parcels') => {
    setActiveNav(nav);
    if (nav === 'flights') {
      router.push('/(app)/dashboard');
    }
  }, [router]);

  const handleMenuClose = useCallback(() => setMenuVisible(false), []);

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

  // Filter flights based on active tab and search query
  const filteredFlights = useMemo(() => {
    const userLocation = user?.location?.toLowerCase();
    
    let tabFiltered = shipments.filter(shipment => {
      const isDone = shipment.deliveryDetails?.isDone;
      const receiverCity = shipment.receiverDetails?.address?.city?.toLowerCase();
      const senderCity = shipment.senderDetails?.address?.city?.toLowerCase();
  
      if (activeTab === 'inbound') {
        return receiverCity === userLocation && !isDone;
      }
      else if (activeTab === 'outbound') {
        return senderCity === userLocation && !isDone;
      }
      else { // history
        // Only show completed shipments that involved the user
        return isDone && (
          receiverCity === userLocation || 
          senderCity === userLocation
        );
      }
    });
  
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tabFiltered = tabFiltered.filter(shipment =>
        shipment.assignedAWBNumbers?.toLowerCase().includes(query)
      );
    }
  
    return tabFiltered.sort((a, b) =>
      new Date(b.TS_created).getTime() - new Date(a.TS_created).getTime()
    );
  }, [shipments, activeTab, searchQuery, user?.location]);



  const handleFlightPress = useCallback((flight: Flight) => {
    if (activeTab === 'inbound') {
      router.push({
        pathname: '/(app)/flight-detail',
        params: { flightId: flight._id, tab: 'scheduled' }
      });
    } else if (activeTab === 'outbound') {

      router.push({
        pathname: '/(app)/drone-tracking',
        params: {
          flightId: flight._id,
          localFlightId: flight.localFlightId,
          droneId: flight.drone_id,
          from: flight.start_location,
          to: flight.end_location,
          eta: flight.time_taken,
        }
      });
    } else {
      router.push({
        pathname: '/(app)/flight-detail',
        params: { flightId: flight._id, tab: 'history' }
      });
    }
  }, [activeTab, router]);

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <Loader fullscreen />
          <Text className="mt-4 text-gray-600">Loading flights...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-lg text-center mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-orange-500 px-6 py-3 rounded-lg"
            onPress={fetchFlights}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredFlights.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-600 text-lg text-center">
            {searchQuery
              ? 'No flights match your search'
              : `No ${activeTab} flights found`}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ 
          paddingBottom: layout.bottomNavHeight + 20 
        }}
        showsVerticalScrollIndicator={false}

      >
        {filteredFlights.map((shipment) => <ShipmentCard key={shipment.assignedAWBNumbers} shipment={shipment} router={router} tab={activeTab} />)}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
          position="top"
          duration={4000}
        />
      )}

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4" style={{ paddingTop: insets.top + 16 }}>
        <View>
          <Text className="text-3xl font-bold text-gray-800">Parcels</Text>

          <Text className="text-gray-600 mt-6">Manage Inbound and Outbound Parcels</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Bars3Icon size={30} color="black" />
        </TouchableOpacity>
      </View>




      {/* Tabs */}
      <Tabs activeTab={activeTab} onTabPress={setActiveTab} />

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-2 mb-4">
        <MagnifyingGlassIcon size={20} color="gray" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-700"
          placeholder="Search flights..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityRole="search"
        />
      </View>

      {/* Content */}
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
};

export default Parcels;