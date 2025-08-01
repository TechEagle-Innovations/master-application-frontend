// import React, { useState, useMemo, useCallback, useEffect } from 'react';
// import { ScrollView, Text, View, TouchableOpacity, TextInput, Platform, StatusBar, Dimensions, ViewStyle, ActivityIndicator, Alert } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useAuth } from '../../utils/auth/AuthContext';
// import { Bars3Icon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
// import HamburgerMenu from '../../components/HamburgerMenu';
// import DroneCard from '../../components/DroneCard';
// import Drone from "@/assets/images/drone.svg";
// import History from "@/assets/images/history.svg";
// import DroneActive from "@/assets/images/drone-active.svg";
// import HistoryActive from "@/assets/images/history-active.svg";
// import InFlightDroneCard from '../../components/InFlightDroneCard';
// import { droneService } from '../../utils/api/services/DroneService';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { flightService } from '@/utils/api/services/FlightService';
// import Notification, { NotificationType } from '@/components/Notification';
// import Loader from '@/components/Loader';

// // Layout interface remains the same
// interface Layout {
//   headerHeight: number;
//   bottomNavHeight: number;
//   contentHeight: number;
// }

// // Separate interfaces for different drone states
// interface AvailableDrone {
//   id: string;
//   location: string;
//   lastMaintenance: string;
//   status: 'Assigned' | 'Stand-By';
//   currentFlightId?: string;
// }

// interface InFlightDrone {
//   id: string;
//   flightId: string;
//   localFlightId: string;
//   from: string;
//   to: string;
//   eta: string;
//   battery: number;
//   status: 'In Transit' | 'Arrived';
//   startTime: string;
// }

// // Separate state interfaces for better type safety
// interface AvailableDronesState {
//   isLoading: boolean;
//   error: string | null;
//   drones: AvailableDrone[];
// }

// interface InFlightDronesState {
//   isLoading: boolean;
//   error: string | null;
//   drones: InFlightDrone[];
// }

// // Dashboard state combines both
// interface DashboardState {
//   available: AvailableDronesState;
//   inFlight: InFlightDronesState;
// }
// // Memoized components
// const Header = React.memo(({
//   headerHeight,
//   paddingTop,
//   onMenuPress
// }: {
//   headerHeight: number;
//   paddingTop: number;
//   onMenuPress: () => void;
// }) => (
//   <View
//     className="flex-row items-center justify-between px-4 bg-white"
//     style={{ height: headerHeight, paddingTop }}
//     accessibilityRole="header"
//   >
//     <Text
//       className="text-3xl font-bold text-gray-800"
//       accessibilityRole="header"
//       accessibilityLabel="Drones"
//     >
//       Drones
//     </Text>
//     <TouchableOpacity
//       onPress={onMenuPress}
//       accessibilityRole="button"
//       accessibilityLabel="Open menu"
//       accessibilityHint="Opens the navigation menu"
//     >
//       <Bars3Icon size={30} color="black" />
//     </TouchableOpacity>
//   </View>
// ));

// const Tabs = React.memo(({
//   activeTab,
//   onTabPress
// }: {
//   activeTab: 'available' | 'inFlight';
//   onTabPress: (tab: 'available' | 'inFlight') => void;
// }) => (
//   <View
//     className="w-full flex-row px-4 mt-2 border-b border-gray-200"
//     accessibilityRole="tablist"
//   >
//     <TouchableOpacity
//       className={`pb-2 ${activeTab === 'available' ? 'border-b-2 border-orange-500' : ''} mr-6 flex-1`}
//       onPress={() => onTabPress('available')}
//       accessibilityRole="tab"
//       accessibilityState={{ selected: activeTab === 'available' }}
//       accessibilityLabel="Available drones"
//       accessibilityHint="Shows list of available drones"
//     >
//       <Text className={`${activeTab === 'available' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>
//         Available
//       </Text>
//     </TouchableOpacity>
//     <TouchableOpacity
//       className={`pb-2 ${activeTab === 'inFlight' ? 'border-b-2 border-orange-500' : ''} flex-1`}
//       onPress={() => onTabPress('inFlight')}
//       accessibilityRole="tab"
//       accessibilityState={{ selected: activeTab === 'inFlight' }}
//       accessibilityLabel="In flight drones"
//       accessibilityHint="Shows list of drones currently in flight"
//     >
//       <Text className={`${activeTab === 'inFlight' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>
//         In Flight
//       </Text>
//     </TouchableOpacity>
//   </View>
// ));

// const BottomNav = React.memo(({
//   activeNav,
//   onNavPress,
//   style
// }: {
//   activeNav: 'drones' | 'history';
//   onNavPress: (nav: 'drones' | 'history') => void;
//   style: ViewStyle;
// }) => (
//   <View
//     className="w-full bg-white border-t border-gray-200 flex-row justify-around"
//     style={[
//       style,
//       {
//         shadowColor: '#000',
//         shadowOffset: {
//           width: 0,
//           height: -2,
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//         elevation: 5,
//       }
//     ]}
//     accessibilityRole="tablist"
//   >
//     <TouchableOpacity
//       className="items-center justify-center flex-1 py-2"
//       onPress={() => onNavPress('drones')}
//       accessibilityRole="tab"
//       accessibilityState={{ selected: activeNav === 'drones' }}
//       accessibilityLabel="Drones tab"
//       accessibilityHint="Navigate to drones list"
//     >
//       {activeNav === 'drones' ?
//         <DroneActive size={25} className="text-primary" /> :
//         <Drone size={24} className="text-gray-500" />
//       }
//       <Text className={`${activeNav === 'drones' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>
//         Drones
//       </Text>
//     </TouchableOpacity>
//     <TouchableOpacity
//       className="items-center justify-center flex-1 py-2"
//       onPress={() => onNavPress('history')}
//       accessibilityRole="tab"
//       accessibilityState={{ selected: activeNav === 'history' }}
//       accessibilityLabel="History tab"
//       accessibilityHint="Navigate to history view"
//     >
//       {activeNav === 'history' ?
//         <HistoryActive size={24} className="text-primary" /> :
//         <History size={24} className="text-gray-500" />
//       }
//       <Text className={`${activeNav === 'history' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>
//         History
//       </Text>
//     </TouchableOpacity>
//   </View>
// ));

// export default function Dashboard() {
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();
//   const params = useLocalSearchParams<{ message: string, type: NotificationType }>();
//   const [isMenuVisible, setMenuVisible] = useState(false);
//   const [activeTab, setActiveTab] = useState<'available' | 'inFlight'>('available');
//   const [activeNav, setActiveNav] = useState<'drones' | 'history'>('drones');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [notification, setNotification] = useState<{ message: string, type: NotificationType } | null>(null);
//   const router = useRouter();

//   // Separate states for available and in-flight drones
//   const [state, setState] = useState<DashboardState>({
//     available: {
//       isLoading: true,
//       error: null,
//       drones: [],
//     },
//     inFlight: {
//       isLoading: true,
//       error: null,
//       drones: [],
//     },
//   });

//   // Notification effect remains the same
//   useEffect(() => {
//     console.log("Notification params:", params.message, params.type);
//     if (params.message && params.type) {
//       setNotification({ message: params.message, type: params.type });

//       // Clear both the state and URL params after showing
//       const timer = setTimeout(() => {
//         setNotification(null);
//         // Optionally clear the params from URL
//         router.setParams({ message: undefined, type: undefined });
//       }, 4000);

//       return () => clearTimeout(timer);
//     }
//   }, [params.message, params.type]);

//   // Layout calculation remains the same
//   const layout = useMemo<Layout>(() => {
//     const windowHeight = Dimensions.get('window').height;
//     const bottomNavHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 56 + insets.bottom;
//     const headerHeight = Platform.OS === 'ios' ? 44 + insets.top : 56 + insets.top;

//     return {
//       headerHeight,
//       bottomNavHeight,
//       contentHeight: windowHeight - headerHeight - bottomNavHeight,
//     };
//   }, [insets.top, insets.bottom]);

//   // Fetch available drones
//   const fetchAvailableDrones = useCallback(async () => {
//     try {
//       setState(prev => ({
//         ...prev,
//         available: {
//           ...prev.available,
//           isLoading: true,
//           error: null,
//         },
//       }));

//       const response: any = await droneService.getAllDronesAtHub();

//       if (!response || response?.status !== 'success' || !Array.isArray(response?.data)) {
//         throw new Error('Invalid response structure from drones API');
//       }

//       const drones: AvailableDrone[] = response.data.map((item: any) => ({
//         id: item.internal_id || item._id,
//         location: item.hub_location || 'Unknown',
//         lastMaintenance: item.last_maintenance_date
//           ? new Date(item.last_maintenance_date).toLocaleDateString()
//           : new Date(item.manufacturing_date).toLocaleDateString(),
//         status: item.current_flight_id ? 'Assigned' : 'Stand-By',
//         currentFlightId: item.current_flight_id,
//       }));

//       setState(prev => ({
//         ...prev,
//         available: {
//           ...prev.available,
//           isLoading: false,
//           drones,
//         },
//       }));
//     } catch (error: any) {
//       console.error('Failed to fetch available drones:', error);

//       const errorMessage = error.response?.data?.message ||
//         error.message ||
//         'Failed to fetch available drones. Please try again.';

//       setState(prev => ({
//         ...prev,
//         available: {
//           ...prev.available,
//           isLoading: false,
//           error: errorMessage,
//           drones: [],
//         },
//       }));

//       // Show alert for serious errors
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         Alert.alert('Session Expired', 'Please login again');
//       } else if (error.response?.status >= 500) {
//         Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
//       }
//     }
//   }, []);

//   // Fetch in-flight drones
//   const fetchInFlightDrones = useCallback(async () => {
//     try {
//       setState(prev => ({
//         ...prev,
//         inFlight: {
//           ...prev.inFlight,
//           isLoading: true,
//           error: null,
//         },
//       }));

//       const response: any = await flightService.getFlightHistory("T008VEE0003VERPL1003012024");

//       if (!response || response.status !== 'success' || !Array.isArray(response.data)) {
//         throw new Error('Invalid response structure from flights API');
//       }

//       // Filter for active flights (pre-flight completed but not post-flight)
//       const activeFlights = response.data.filter(
//         (flight: any) =>
//           flight.isPreFlightChecklistCompleted &&
//           !flight.isPostFlightChecklistCompleted &&
//           !flight.isCompleted &&
//           new Date().getDay() === new Date(flight.createdAt).getDay()
//       );

//       const drones: InFlightDrone[] = activeFlights.map((flight: any) => ({
//         id: flight.drone_id || 'Unknown',
//         flightId: flight._id,
//         localFlightId: flight.localFlightId,
//         from: flight.start_location || 'Unknown',
//         to: flight.end_location || 'Unknown',
//         eta: flight.time_taken ? `${flight.time_taken} mins` : 'Calculating...',
//         battery: 100, // Replace with actual data if available
//         status: 'In Transit', // You might have actual status from API
//         startTime: flight.date_created || new Date().toISOString(),
//       }));

//       setState(prev => ({
//         ...prev,
//         inFlight: {
//           ...prev.inFlight,
//           isLoading: false,
//           drones,
//         },
//       }));
//     } catch (error: any) {
//       console.error('Failed to fetch in-flight drones:', error);

//       const errorMessage = error.response?.data?.message ||
//         error.message ||
//         'Failed to fetch in-flight drones. Please try again.';

//       setState(prev => ({
//         ...prev,
//         inFlight: {
//           ...prev.inFlight,
//           isLoading: false,
//           error: errorMessage,
//           drones: [],
//         },
//       }));

//       // Show alert for serious errors
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         Alert.alert('Session Expired', 'Please login again');
//       } else if (error.response?.status >= 500) {
//         Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
//       }
//     }
//   }, []);

//   // Fetch data when tab changes or component mounts
//   useEffect(() => {
//     if (activeTab === 'available') {
//       fetchAvailableDrones();
//     } else {
//       fetchInFlightDrones();
//     }
//   }, [activeTab, fetchAvailableDrones, fetchInFlightDrones]);

//   // Filter drones based on search query
//   const filteredDrones = useMemo(() => {
//     const currentState = activeTab === 'available' ? state.available : state.inFlight;
//     const drones = currentState.drones;

//     if (!searchQuery.trim()) {
//       return drones;
//     }

//     const query = searchQuery.toLowerCase();

//     return drones.filter(drone => {
//       if (activeTab === 'available') {
//         const availableDrone = drone as AvailableDrone;
//         return (
//           availableDrone.id.toLowerCase().includes(query) ||
//           availableDrone.location.toLowerCase().includes(query)
//         );
//       } else {
//         const inFlightDrone = drone as InFlightDrone;
//         return (
//           inFlightDrone.id.toLowerCase().includes(query) ||
//           inFlightDrone.from.toLowerCase().includes(query) ||
//           inFlightDrone.to.toLowerCase().includes(query)
//         );
//       }
//     });
//   }, [activeTab, state.available.drones, state.inFlight.drones, searchQuery]);

//   // Memoized callbacks
//   const handleMenuPress = useCallback(() => setMenuVisible(true), []);
//   const handleTabPress = useCallback((tab: 'available' | 'inFlight') => setActiveTab(tab), []);
//   const handleNavPress = useCallback((nav: 'drones' | 'history') => {
//     setActiveNav(nav);
//     if (nav === 'history') {
//       router.push('/(app)/history');
//     }
//   }, [router]);
//   const handleMenuClose = useCallback(() => setMenuVisible(false), []);
//   const handleSearchChange = useCallback((text: string) => setSearchQuery(text), []);

//   const handleDronePress = useCallback((drone: AvailableDrone | InFlightDrone) => {
//     if (activeTab === 'available') {
//       const availableDrone = drone as AvailableDrone;
//       router.push({
//         pathname: '/(app)/drone-detail',
//         params: {
//           id: availableDrone.id,
//           assigned: availableDrone.status === 'Assigned' ? '1' : '0',
//           currentFlightId: availableDrone.currentFlightId || '',

//         }
//       });
//     } else {
//       const inFlightDrone = drone as InFlightDrone;
//       router.push({
//         pathname: '/(app)/drone-tracking',
//         params: {
//           flightId: inFlightDrone.flightId,
//           localFlightId: inFlightDrone.localFlightId,
//           droneId: inFlightDrone.id,
//           from: inFlightDrone.from,
//           to: inFlightDrone.to,
//           eta: inFlightDrone.eta,
//         }
//       });
//     }
//   }, [activeTab, router]);

//   // Render loading state
//   const renderLoading = () => (
//     <View className="flex-1 items-center justify-center">
//       <Loader fullscreen />
//       <Text className="mt-4 text-gray-600">
//         {activeTab === 'available'
//           ? 'Loading available drones...'
//           : 'Loading in-flight drones...'}
//       </Text>
//     </View>
//   );

//   // Render error state
//   const renderError = () => {
//     const error = activeTab === 'available' ? state.available.error : state.inFlight.error;

//     return (
//       <View className="flex-1 items-center justify-center px-4">
//         <Text className="text-red-500 text-lg text-center mb-4">
//           {error}
//         </Text>
//         <TouchableOpacity
//           className="bg-orange-500 px-6 py-3 rounded-lg"
//           onPress={activeTab === 'available' ? fetchAvailableDrones : fetchInFlightDrones}
//         >
//           <Text className="text-white font-semibold">Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // Render empty state
//   const renderEmpty = () => (
//     <View className="flex-1 items-center justify-center px-4">
//       <Text className="text-gray-600 text-lg text-center">
//         {searchQuery
//           ? 'No results found matching your search'
//           : activeTab === 'available'
//             ? 'No drones currently available'
//             : 'No drones currently in flight'}
//       </Text>
//     </View>
//   );

//   // Render drone list
//   const renderDroneList = () => {
//     if (activeTab === 'available') {
//       return (
//         <ScrollView
//           className="flex-1 mt-4 px-4"
//           contentContainerStyle={{ paddingBottom: layout.bottomNavHeight + 20 }}
//           showsVerticalScrollIndicator={false}
//         >
//           {(filteredDrones as AvailableDrone[]).map((drone) => (
//             <DroneCard
//               key={drone.id}
//               id={drone.id}
//               location={drone.location}
//               lastMaintainance={drone.lastMaintenance}
//               status={drone.status}
//               onPress={() => handleDronePress(drone)}
//             />
//           ))}
//         </ScrollView>
//       );
//     } else {
//       return (
//         <ScrollView
//           className="flex-1 mt-4 px-4"
//           contentContainerStyle={{ paddingBottom: layout.bottomNavHeight + 20 }}
//           showsVerticalScrollIndicator={false}
//         >
//           {(filteredDrones as InFlightDrone[]).map((drone) => (
//             <InFlightDroneCard
//               key={drone.flightId}
//               id={drone.localFlightId}
//               droneId={drone.id}
//               from={drone.from}
//               to={drone.to}
//               eta={drone.eta}
//               battery={drone.battery}
//               // status={drone.status}
//               onPress={() => handleDronePress(drone)}
//             />
//           ))}
//         </ScrollView>
//       );
//     }
//   };

//   // Main render function
//   const renderContent = () => {
//     const currentState = activeTab === 'available' ? state.available : state.inFlight;

//     if (currentState.isLoading) {
//       return renderLoading();
//     }

//     if (currentState.error) {
//       return renderError();
//     }

//     if (filteredDrones.length === 0) {
//       return renderEmpty();
//     }

//     return renderDroneList();
//   };

//   // Keep your existing JSX return statement
//   return (
//     <View className="flex-1 bg-white">
//       {/* Notification Snackbar */}
//       {notification && (
//         <Notification
//           key={`${notification.message}-${Date.now()}`} // Unique key to force re-render
//           message={notification.message}
//           type={notification.type}
//           onDismiss={() => setNotification(null)}
//           position="top"
//           duration={4000}
//         />
//       )}
//       <Header
//         headerHeight={layout.headerHeight}
//         paddingTop={insets.top}
//         onMenuPress={handleMenuPress}
//       />
//       <View className="px-4 py-2">
//         <Text className="text-gray-600 text-lg">Select a drone to view details</Text>
//       </View>
//       <Tabs activeTab={activeTab} onTabPress={handleTabPress} />
//       <View className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-2">
//         <MagnifyingGlassIcon size={20} color="gray" />
//         <TextInput
//           className="flex-1 ml-2 text-base text-gray-700"
//           placeholder="Search drones..."
//           placeholderTextColor="gray"
//           value={searchQuery}
//           onChangeText={handleSearchChange}
//         />
//       </View>
//       {renderContent()}
//       <BottomNav
//         activeNav={activeNav}
//         onNavPress={handleNavPress}
//         style={{
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           right: 0,
//           height: layout.bottomNavHeight,
//           paddingBottom: insets.bottom,
//         }}
//       />
//       <HamburgerMenu
//         isVisible={isMenuVisible}
//         onClose={handleMenuClose}
//       />
//     </View>
//   );
// }

// function InfoItem({ label, value }: { label: string; value?: string }) {
//   return (
//     <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
//       <Text className="text-gray-600 font-medium">{label}</Text>
//       <Text className="text-gray-800">{value || 'N/A'}</Text>
//     </View>
//   );
// } 

// // import React, { useState, useMemo, useCallback, useEffect } from 'react';
// // import { ScrollView, Text, View, TouchableOpacity, TextInput, Platform, Dimensions, ViewStyle, Alert } from 'react-native';
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import { useAuth } from '../../utils/auth/AuthContext';
// // import { Bars3Icon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
// // import HamburgerMenu from '../../components/HamburgerMenu';
// // import DroneCard from '../../components/DroneCard';
// // import Drone from "@/assets/images/drone.svg";
// // import History from "@/assets/images/history.svg";
// // import DroneActive from "@/assets/images/drone-active.svg";
// // import HistoryActive from "@/assets/images/history-active.svg";
// // import InFlightDroneCard from '../../components/InFlightDroneCard';
// // import { droneService } from '../../utils/api/services/DroneService';
// // import { useRouter, useLocalSearchParams } from 'expo-router';
// // import { flightService } from '@/utils/api/services/FlightService';
// // import Notification, { NotificationType } from '@/components/Notification';
// // import Loader from '@/components/Loader';

// // // Layout interface remains the same
// // interface Layout {
// //   headerHeight: number;
// //   bottomNavHeight: number;
// //   contentHeight: number;
// // }

// // // Separate interfaces for different drone states
// // interface AvailableDrone {
// //   id: string;
// //   location: string;
// //   lastMaintenance: string;
// //   status: 'Assigned' | 'Stand-By';
// //   currentFlightId?: string;
// // }

// // interface InFlightDrone {
// //   id: string;
// //   flightId: string;
// //   localFlightId: string;
// //   from: string;
// //   to: string;
// //   eta: string;
// //   battery: number;
// //   status: 'In Transit' | 'Arrived';
// //   startTime: string;
// // }
// // interface InFlightDrone {
// //   id: string;
// //   flightId: string;
// //   localFlightId: string;
// //   from: string;
// //   to: string;
// //   eta: string;
// //   battery: number;
// //   status: 'In Transit' | 'Arrived';
// //   startTime: string;
// // }

// // // Separate state interfaces for better type safety
// // interface AvailableDronesState {
// //   isLoading: boolean;
// //   error: string | null;
// //   drones: AvailableDrone[];
// // }
// // interface ScheduledFlightsState {
// //   isLoading: boolean;
// //   error: string | null;
// //   drones: AvailableDrone[];
// // }

// //  interface FlightsHistoryState{
// //   isLoading: boolean;
// //   error: string | null;
// //   flghts: InFlightDrone[];
// //  }

// // interface InFlightDronesState {
// //   isLoading: boolean;
// //   error: string | null;
// //   drones: InFlightDrone[];
// // }

// // // Dashboard state combines both
// // interface DashboardState {
// //   scheduled: ScheduledFlightsState;
// //   ongoing: InFlightDronesState;
// //   history: FlightsHistoryState;
// // }
// // // Memoized components
// // const Header = React.memo(({
// //   headerHeight,
// //   paddingTop,
// //   onMenuPress
// // }: {
// //   headerHeight: number;
// //   paddingTop: number;
// //   onMenuPress: () => void;
// // }) => (
// //   <View
// //     className="flex-row items-center justify-between px-4 bg-white"
// //     style={{ height: headerHeight, paddingTop }}
// //     accessibilityRole="header"
// //   >
// //     <Text
// //       className="text-3xl font-bold text-gray-800"
// //       accessibilityRole="header"
// //       accessibilityLabel="Drones"
// //     >
// //       Flights
// //     </Text>
// //     <TouchableOpacity
// //       onPress={onMenuPress}
// //       accessibilityRole="button"
// //       accessibilityLabel="Open menu"
// //       accessibilityHint="Opens the navigation menu"
// //     >
// //       <Bars3Icon size={30} color="black" />
// //     </TouchableOpacity>
// //   </View>
// // ));

// // const Tabs = React.memo(({
// //   activeTab,
// //   onTabPress
// // }: {
// //   activeTab: 'ongoing' | 'scheduled' | 'history';
// //   onTabPress: (tab: 'ongoing' | 'scheduled' | 'history') => void;
// // }) => (
// //   <View
// //     className="w-full flex-row px-4 mt-2 border-b border-gray-200"
// //     accessibilityRole="tablist"
// //   >
// //     <TouchableOpacity
// //       className={`pb-2 ${activeTab === 'ongoing' ? 'border-b-2 border-orange-500' : ''} mr-6 flex-1`}
// //       onPress={() => onTabPress('ongoing')}
// //       accessibilityRole="tab"
// //       accessibilityState={{ selected: activeTab === 'ongoing' }}
// //       accessibilityLabel="Ongoing drones"
// //       accessibilityHint="Shows list of ongoing drones"
// //     >
// //       <Text className={`${activeTab === 'ongoing' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>
// //         Ongoing
// //       </Text>
// //     </TouchableOpacity>
// //     <TouchableOpacity
// //       className={`pb-2 ${activeTab === 'scheduled' ? 'border-b-2 border-orange-500' : ''} flex-1`}
// //       onPress={() => onTabPress('scheduled')}
// //       accessibilityRole="tab"
// //       accessibilityState={{ selected: activeTab === 'scheduled' }}
// //       accessibilityLabel="In flight drones"
// //       accessibilityHint="Shows list of drones currently in flight"
// //     >
// //       <Text className={`${activeTab === 'scheduled' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>
// //         Scheduled
// //       </Text>
// //     </TouchableOpacity>
// //     <TouchableOpacity
// //       className={`pb-2 ${activeTab === 'history' ? 'border-b-2 border-orange-500' : ''} flex-1`}
// //       onPress={() => onTabPress('history')}
// //       accessibilityRole="tab"
// //       accessibilityState={{ selected: activeTab === 'history' }}
// //       accessibilityLabel="In flight drones"
// //       accessibilityHint="Shows list of drones currently in flight"
// //     >
// //       <Text className={`${activeTab === 'history' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>
// //         History
// //       </Text>
// //     </TouchableOpacity>
// //   </View>
// // ));

// // const BottomNav = React.memo(({
// //   activeNav,
// //   onNavPress,
// //   style
// // }: {
// //   activeNav: 'flights' | 'parcels';
// //   onNavPress: (nav: 'flights' | 'parcels') => void;
// //   style: ViewStyle;
// // }) => (
// //   <View
// //     className="w-full bg-white border-t border-gray-200 flex-row justify-around"
// //     style={[
// //       style,
// //       {
// //         shadowColor: '#000',
// //         shadowOffset: {
// //           width: 0,
// //           height: -2,
// //         },
// //         shadowOpacity: 0.1,
// //         shadowRadius: 3,
// //         elevation: 5,
// //       }
// //     ]}
// //     accessibilityRole="tablist"
// //   >
// //     <TouchableOpacity
// //       className="items-center justify-center flex-1 py-2"
// //       onPress={() => onNavPress('flights')}
// //       accessibilityRole="tab"
// //       accessibilityState={{ selected: activeNav === 'flights' }}
// //       accessibilityLabel="Flights tab"
// //       accessibilityHint="Navigate to flights list"
// //     >
// //       {activeNav === 'flights' ?
// //         <DroneActive size={25} className="text-primary" /> :
// //         <Drone size={24} className="text-gray-500" />
// //       }
// //       <Text className={`${activeNav === 'flights' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>
// //         Flights
// //       </Text>
// //     </TouchableOpacity>
// //     <TouchableOpacity
// //       className="items-center justify-center flex-1 py-2"
// //       onPress={() => onNavPress('parcels')}
// //       accessibilityRole="tab"
// //       accessibilityState={{ selected: activeNav === 'parcels' }}
// //       accessibilityLabel="Parcels tab"
// //       accessibilityHint="Navigate to parcels view"
// //     >
// //       {activeNav === 'parcels' ?
// //         <HistoryActive size={24} className="text-primary" /> :
// //         <History size={24} className="text-gray-500" />
// //       }
// //       <Text className={`${activeNav === 'parcels' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>
// //         Parcels
// //       </Text>
// //     </TouchableOpacity>
// //   </View>
// // ));

// // export default function Dashboard() {
// //   const { user } = useAuth();
// //   const insets = useSafeAreaInsets();
// //   const params = useLocalSearchParams<{ message: string, type: NotificationType }>();
// //   const [isMenuVisible, setMenuVisible] = useState(false);
// //   const [activeTab, setActiveTab] = useState<'ongoing' | 'scheduled' | 'history'>('ongoing');
// //   const [activeNav, setActiveNav] = useState<'flights' | 'parcels'>('flights');
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [notification, setNotification] = useState<{ message: string, type: NotificationType } | null>(null);
// //   const router = useRouter();

// //   // Separate states for available and in-flight drones
// //   const [state, setState] = useState<DashboardState>({
// //     ongoing: {
// //       isLoading: true,
// //       error: null,
// //       drones: [],
// //     },
// //     scheduled: {
// //       isLoading: true,
// //       error: null,
// //       drones: [],
// //     },
// //     history: {
// //       isLoading: true,
// //       error: null,
// //       flghts: [],
// //     }
// //   });

// //   // Notification effect remains the same
// //   useEffect(() => {
// //     console.log("Notification params:", params.message, params.type);
// //     if (params.message && params.type) {
// //       setNotification({ message: params.message, type: params.type });

// //       // Clear both the state and URL params after showing
// //       const timer = setTimeout(() => {
// //         setNotification(null);
// //         // Optionally clear the params from URL
// //         router.setParams({ message: undefined, type: undefined });
// //       }, 4000);

// //       return () => clearTimeout(timer);
// //     }
// //   }, [params.message, params.type]);

// //   // Layout calculation remains the same
// //   const layout = useMemo<Layout>(() => {
// //     const windowHeight = Dimensions.get('window').height;
// //     const bottomNavHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 56 + insets.bottom;
// //     const headerHeight = Platform.OS === 'ios' ? 44 + insets.top : 56 + insets.top;

// //     return {
// //       headerHeight,
// //       bottomNavHeight,
// //       contentHeight: windowHeight - headerHeight - bottomNavHeight,
// //     };
// //   }, [insets.top, insets.bottom]);

// //   // Fetch available drones
// //   const fetchAvailableDrones = useCallback(async () => {
// //     try {
// //       setState(prev => ({
// //         ...prev,
// //         available: {
// //           ...prev.available,
// //           isLoading: true,
// //           error: null,
// //         },
// //       }));

// //       const response: any = await droneService.getAllDronesAtHub();

// //       if (!response || response?.status !== 'success' || !Array.isArray(response?.data)) {
// //         throw new Error('Invalid response structure from drones API');
// //       }

// //       const drones: AvailableDrone[] = response.data.map((item: any) => ({
// //         id: item.internal_id || item._id,
// //         location: item.hub_location || 'Unknown',
// //         lastMaintenance: item.last_maintenance_date
// //           ? new Date(item.last_maintenance_date).toLocaleDateString()
// //           : new Date(item.manufacturing_date).toLocaleDateString(),
// //         status: item.current_flight_id ? 'Assigned' : 'Stand-By',
// //         currentFlightId: item.current_flight_id,
// //       }));

// //       setState(prev => ({
// //         ...prev,
// //         available: {
// //           ...prev.available,
// //           isLoading: false,
// //           drones,
// //         },
// //       }));
// //     } catch (error: any) {
// //       console.error('Failed to fetch available drones:', error);

// //       const errorMessage = error.response?.data?.message ||
// //         error.message ||
// //         'Failed to fetch available drones. Please try again.';

// //       setState(prev => ({
// //         ...prev,
// //         available: {
// //           ...prev.available,
// //           isLoading: false,
// //           error: errorMessage,
// //           drones: [],
// //         },
// //       }));

// //       // Show alert for serious errors
// //       if (error.response?.status === 401 || error.response?.status === 403) {
// //         Alert.alert('Session Expired', 'Please login again');
// //       } else if (error.response?.status >= 500) {
// //         Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
// //       }
// //     }
// //   }, []);

// //   // Fetch in-flight drones
// //   const fetchInFlightDrones = useCallback(async () => {
// //     try {
// //       setState(prev => ({
// //         ...prev,
// //         inFlight: {
// //           ...prev.inFlight,
// //           isLoading: true,
// //           error: null,
// //         },
// //       }));

// //       const response: any = await flightService.getFlightHistory("T008VEE0003VERPL1003012024");

// //       if (!response || response.status !== 'success' || !Array.isArray(response.data)) {
// //         throw new Error('Invalid response structure from flights API');
// //       }

// //       // Filter for active flights (pre-flight completed but not post-flight)
// //       const activeFlights = response.data.filter(
// //         (flight: any) =>
// //           flight.isPreFlightChecklistCompleted &&
// //           !flight.isPostFlightChecklistCompleted &&
// //           !flight.isCompleted &&
// //           new Date().getDay() === new Date(flight.createdAt).getDay()
// //       );

// //       const drones: InFlightDrone[] = activeFlights.map((flight: any) => ({
// //         id: flight.drone_id || 'Unknown',
// //         flightId: flight._id,
// //         localFlightId: flight.localFlightId,
// //         from: flight.start_location || 'Unknown',
// //         to: flight.end_location || 'Unknown',
// //         eta: flight.time_taken ? `${flight.time_taken} mins` : 'Calculating...',
// //         battery: 100, // Replace with actual data if available
// //         status: 'In Transit', // You might have actual status from API
// //         startTime: flight.date_created || new Date().toISOString(),
// //       }));

// //       setState(prev => ({
// //         ...prev,
// //         inFlight: {
// //           ...prev.inFlight,
// //           isLoading: false,
// //           drones,
// //         },
// //       }));
// //     } catch (error: any) {
// //       console.error('Failed to fetch in-flight drones:', error);

// //       const errorMessage = error.response?.data?.message ||
// //         error.message ||
// //         'Failed to fetch in-flight drones. Please try again.';

// //       setState(prev => ({
// //         ...prev,
// //         inFlight: {
// //           ...prev.inFlight,
// //           isLoading: false,
// //           error: errorMessage,
// //           drones: [],
// //         },
// //       }));

// //       // Show alert for serious errors
// //       if (error.response?.status === 401 || error.response?.status === 403) {
// //         Alert.alert('Session Expired', 'Please login again');
// //       } else if (error.response?.status >= 500) {
// //         Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
// //       }
// //     }
// //   }, []);

// //   // Fetch data when tab changes or component mounts
// //   useEffect(() => {
// //     if (activeTab === 'ongoing') {
// //       fetchAvailableDrones();
// //     } else {
// //       fetchInFlightDrones();
// //     }
// //   }, [activeTab, fetchAvailableDrones, fetchInFlightDrones]);

// //   // Filter drones based on search query
// //   const filteredDrones = useMemo(() => {
// //     const currentState = activeTab === 'ongoing' ? state.available : state.inFlight;
// //     const drones = currentState.drones;

// //     if (!searchQuery.trim()) {
// //       return drones;
// //     }

// //     const query = searchQuery.toLowerCase();

// //     return drones.filter(drone => {
// //       if (activeTab === 'ongoing') {
// //         const availableDrone = drone as AvailableDrone;
// //         return (
// //           availableDrone.id.toLowerCase().includes(query) ||
// //           availableDrone.location.toLowerCase().includes(query)
// //         );
// //       } else {
// //         const inFlightDrone = drone as InFlightDrone;
// //         return (
// //           inFlightDrone.id.toLowerCase().includes(query) ||
// //           inFlightDrone.from.toLowerCase().includes(query) ||
// //           inFlightDrone.to.toLowerCase().includes(query)
// //         );
// //       }
// //     });
// //   }, [activeTab, state.available.drones, state.inFlight.drones, searchQuery]);

// //   // Memoized callbacks
// //   const handleMenuPress = useCallback(() => setMenuVisible(true), []);
// //   const handleTabPress = useCallback((tab: 'ongoing' | 'scheduled' | 'history') => setActiveTab(tab), []);
// //   const handleNavPress = useCallback((nav: 'flights' | 'parcels') => {
// //     setActiveNav(nav);
// //     if (nav === 'parcels') {
// //       router.push('/(app)/parcels');
// //     }
// //   }, [router]);
// //   const handleMenuClose = useCallback(() => setMenuVisible(false), []);
// //   const handleSearchChange = useCallback((text: string) => setSearchQuery(text), []);

// //   const handleDronePress = useCallback((drone: AvailableDrone | InFlightDrone) => {
// //     if (activeTab === 'history') {
// //       const availableDrone = drone as AvailableDrone;
// //       router.push({
// //         pathname: '/(app)/drone-detail',
// //         params: {
// //           id: availableDrone.id,
// //           assigned: availableDrone.status === 'Assigned' ? '1' : '0',
// //           currentFlightId: availableDrone.currentFlightId || '',

// //         }
// //       });
// //     } else if (activeTab === 'scheduled') {
// //       const inFlightDrone = drone as InFlightDrone;
// //       router.push({
// //         pathname: '/(app)/scheduled-flights',
// //         params: {
// //           flightId: inFlightDrone.flightId,
// //           localFlightId: inFlightDrone.localFlightId,
// //           droneId: inFlightDrone.id,
// //           from: inFlightDrone.from,
// //           to: inFlightDrone.to,
// //           eta: inFlightDrone.eta,
// //         }
// //       });
// //     }else{
// //       const inFlightDrone = drone as InFlightDrone;
// //       router.push({
// //         pathname: '/(app)/drone-tracking',
// //         params: {
// //           flightId: inFlightDrone.flightId,
// //           localFlightId: inFlightDrone.localFlightId,
// //           droneId: inFlightDrone.id,
// //           from: inFlightDrone.from,
// //           to: inFlightDrone.to,
// //           eta: inFlightDrone.eta,
// //         }
// //       });
// //     }
// //   }, [activeTab, router]);

// //   // Render loading state
// //   const renderLoading = () => (
// //     <View className="flex-1 items-center justify-center">
// //       <Loader fullscreen />
// //       <Text className="mt-4 text-gray-600">
// //         {activeTab === 'ongoing'
// //           ? 'Loading available drones...'
// //           : 'Loading in-flight drones...'}
// //       </Text>
// //     </View>
// //   );

// //   // Render error state
// //   const renderError = () => {
// //     const error = activeTab === 'ongoing' ? state.available.error : state.inFlight.error;

// //     return (
// //       <View className="flex-1 items-center justify-center px-4">
// //         <Text className="text-red-500 text-lg text-center mb-4">
// //           {error}
// //         </Text>
// //         <TouchableOpacity
// //           className="bg-orange-500 px-6 py-3 rounded-lg"
// //           onPress={activeTab === 'ongoing' ? fetchAvailableDrones : fetchInFlightDrones}
// //         >
// //           <Text className="text-white font-semibold">Retry</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   };

// //   // Render empty state
// //   const renderEmpty = () => (
// //     <View className="flex-1 items-center justify-center px-4">
// //       <Text className="text-gray-600 text-lg text-center">
// //         {searchQuery
// //           ? 'No results found matching your search'
// //           : activeTab === 'ongoing'
// //             ? 'No drones currently available'
// //             : 'No drones currently in flight'}
// //       </Text>
// //     </View>
// //   );

// //   // Render drone list
// //   const renderDroneList = () => {
// //     if (activeTab === 'ongoing') {
// //       return (
// //         <ScrollView
// //           className="flex-1 mt-4 px-4"
// //           contentContainerStyle={{ paddingBottom: layout.bottomNavHeight + 20 }}
// //           showsVerticalScrollIndicator={false}
// //         >
// //           {(filteredDrones as AvailableDrone[]).map((drone) => (
// //             <DroneCard
// //               key={drone.id}
// //               id={drone.id}
// //               location={drone.location}
// //               lastMaintainance={drone.lastMaintenance}
// //               status={drone.status}
// //               onPress={() => handleDronePress(drone)}
// //             />
// //           ))}
// //         </ScrollView>
// //       );
// //     } else {
// //       return (
// //         <ScrollView
// //           className="flex-1 mt-4 px-4"
// //           contentContainerStyle={{ paddingBottom: layout.bottomNavHeight + 20 }}
// //           showsVerticalScrollIndicator={false}
// //         >
// //           {(filteredDrones as InFlightDrone[]).map((drone) => (
// //             <InFlightDroneCard
// //               key={drone.flightId}
// //               id={drone.localFlightId}
// //               droneId={drone.id}
// //               from={drone.from}
// //               to={drone.to}
// //               eta={drone.eta}
// //               battery={drone.battery}
// //               // status={drone.status}
// //               onPress={() => handleDronePress(drone)}
// //             />
// //           ))}
// //         </ScrollView>
// //       );
// //     }
// //   };

// //   // Main render function
// //   const renderContent = () => {
// //     const currentState = activeTab === 'ongoing' ? state.available : state.inFlight;

// //     if (currentState.isLoading) {
// //       return renderLoading();
// //     }

// //     if (currentState.error) {
// //       return renderError();
// //     }

// //     if (filteredDrones.length === 0) {
// //       return renderEmpty();
// //     }

// //     return renderDroneList();
// //   };

// //   // Keep your existing JSX return statement
// //   return (
// //     <View className="flex-1 bg-white">
// //       {/* Notification Snackbar */}
// //       {notification && (
// //         <Notification
// //           key={`${notification.message}-${Date.now()}`} // Unique key to force re-render
// //           message={notification.message}
// //           type={notification.type}
// //           onDismiss={() => setNotification(null)}
// //           position="top"
// //           duration={4000}
// //         />
// //       )}
// //       <Header
// //         headerHeight={layout.headerHeight}
// //         paddingTop={insets.top}
// //         onMenuPress={handleMenuPress}
// //       />
// //       <View className="px-4 py-2">
// //         <Text className="text-gray-600 text-lg">Select a drone to view details</Text>
// //       </View>
// //       <Tabs activeTab={activeTab} onTabPress={handleTabPress} />
// //       <View className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-2">
// //         <MagnifyingGlassIcon size={20} color="gray" />
// //         <TextInput
// //           className="flex-1 ml-2 text-base text-gray-700"
// //           placeholder="Search drones..."
// //           placeholderTextColor="gray"
// //           value={searchQuery}
// //           onChangeText={handleSearchChange}
// //         />
// //       </View>
// //       {renderContent()}
// //       <BottomNav
// //         activeNav={activeNav}
// //         onNavPress={handleNavPress}
// //         style={{
// //           position: 'absolute',
// //           bottom: 0,
// //           left: 0,
// //           right: 0,
// //           height: layout.bottomNavHeight,
// //           paddingBottom: insets.bottom,
// //         }}
// //       />
// //       <HamburgerMenu
// //         isVisible={isMenuVisible}
// //         onClose={handleMenuClose}
// //       />
// //     </View>
// //   );
// // }

// // function InfoItem({ label, value }: { label: string; value?: string }) {
// //   return (
// //     <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
// //       <Text className="text-gray-600 font-medium">{label}</Text>
// //       <Text className="text-gray-800">{value || 'N/A'}</Text>
// //     </View>
// //   );
// // } 
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ViewStyle, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../utils/auth/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';
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
import { useShipment } from '@/utils/ShipmentContext';


// Flight status types
type FlightTab = 'scheduled' | 'ongoing' | 'history';

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
interface FlightCardProps {
  flight: Flight;
  onPress: (flight: Flight) => void;
  userLocation: string | undefined
}

const FlightCard: React.FC<FlightCardProps> = React.memo(({ flight, onPress, userLocation }) => {
  const flightDate = new Date(flight.scheduleDetails.date);
  const formattedDate = flightDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = flightDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  let startLocation: string = flight.start_location.toString();
  let endLocation: string = flight.end_location.toString();
  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-lg p-4 mb-3 shadow-sm"
      onPress={() => onPress(flight)}
      accessibilityRole="button"
      accessibilityLabel={`Flight ${flight.localFlightId} details`}
    >
      <View className="flex-row justify-between items-start w-full">
        <View className='w-full'>
          <View className='flex-row justify-between items-center'>
            <Text className="text-lg font-semibold text-gray-800">{flight.localFlightId}</Text>
            {userLocation == flight.start_location && <UpwardArrow />}
            {userLocation == flight.end_location && <DownwardArrow />}
          </View>
          <Text className="text-gray-500 mt-1">{locationIdToNameMap[startLocation]} → {locationIdToNameMap[endLocation]}</Text>
        </View>
      </View>
      <View className="mt-2 flex-row justify-between items-center">
        <Text className="text-gray-500">{formattedDate} at {formattedTime}</Text>
        <Text className="text-gray-500 text-base">{flight.drone_id}</Text>
      </View>
    </TouchableOpacity>
  );
});

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

const FlightHistoryCard: React.FC<FlightHistoryCardProps> = React.memo(({ flight, onPress }) => {

  const flightDate = new Date(flight.scheduleDetails.date);
  const formattedDate = flightDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-lg p-4 mb-3 shadow-sm"
      onPress={() => onPress(flight)}
      accessibilityRole="button"
      accessibilityLabel={`Flight ${flight.localFlightId} details`}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-lg text-gray-800">{flight.localFlightId}</Text>
          <Text className="text-gray-500">{formattedDate}</Text>
        </View>
        <View className="mt-2 flex-row justify-between items-center">

          <Text className="text-gray-300 text-3xl">›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
});

const Tabs: React.FC<{
  activeTab: FlightTab;
  onTabPress: (tab: FlightTab) => void;
}> = React.memo(({ activeTab, onTabPress }) => {
  return (
    <View className="w-full flex-row px-4 mt-2 border-b border-gray-200 mt-6" accessibilityRole="tablist">
      {(['scheduled', 'ongoing', 'history'] as FlightTab[]).map((tab) => (
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

const FlightDashboard: React.FC = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FlightTab>('scheduled');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [activeNav, setActiveNav] = useState<'flights' | 'parcels'>('flights');
  const [error, setError] = useState<string | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const { setSelectedFlight } = useShipment();

  // Fetch flights based on user's location
  const fetchFlights = useCallback(async () => {
    if (!user?.location) return;

    try {
      setLoading(true);
      setError(null);

      const response: any = await flightService.getAllLocationBasedFlights(user.location);

      if (response?.status === 'success' && Array.isArray(response.data)) {
        setFlights(response.data);
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
    if (nav === 'parcels') {
      router.push('/(app)/parcels');
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
    let tabFiltered = flights.filter(flight => {
      if (activeTab === 'scheduled') {
        const scheduledDate = new Date(flight.scheduleDetails.date);
      
        // Get current date in IST as a Date object
        const nowUTC = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // +5:30 offset in milliseconds
        const currentISTDate = new Date(nowUTC.getTime() + istOffset);
      
        const scheduledDateStr = scheduledDate.toISOString().split('T')[0];
        const currentDateStr = currentISTDate.toISOString().split('T')[0];
      
        console.log("SCHEDULE", scheduledDateStr, currentDateStr);
      
        return (
          !flight.isPreFlightChecklistCompleted &&
          !flight.isCompleted &&
          scheduledDateStr >= currentDateStr // excludes today
        );
      } else if (activeTab === 'ongoing') {
        const scheduledDate = new Date(flight.scheduleDetails.date);
      
        const nowUTC = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const currentISTDate = new Date(nowUTC.getTime() + istOffset);
      
        const scheduledDateStr = scheduledDate.toISOString().split('T')[0];
        const currentDateStr = currentISTDate.toISOString().split('T')[0];
      
        return (
          flight.isPreFlightChecklistCompleted &&
          !flight.isPostFlightChecklistCompleted &&
          scheduledDateStr === currentDateStr
        );
      }
      
      else { // history
        return flight.isCompleted && flight.isPostFlightChecklistCompleted && flight.isPreFlightChecklistCompleted;
      }
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tabFiltered = tabFiltered.filter(flight =>
        flight.localFlightId?.toLowerCase().includes(query) ||
        flight.start_location?.toLowerCase().includes(query) ||
        flight.end_location?.toLowerCase().includes(query)
      );
    }

    return tabFiltered.sort((a, b) =>
      new Date(b.scheduleDetails.date).getTime() - new Date(a.scheduleDetails.date).getTime()
    );
  }, [flights, activeTab, searchQuery]);

  const handleFlightPress = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
    if (activeTab === 'scheduled') {
      router.push({
        pathname: '/(app)/flight-detail',
        params: { flightId: flight._id, tab: 'scheduled' }
      });
    } else if (activeTab === 'ongoing') {

      router.push({
        pathname: '/(app)/flight-detail',
        params: {
          flightId: flight._id,
          // localFlightId: flight.localFlightId,
          // droneId: flight.drone_id,
          // from: flight.start_location,
          // to: flight.end_location,
          // eta: flight.time_taken,
          tab: 'ongoing'
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}

      >
        {activeTab == "scheduled" ? filteredFlights.map((flight) => (
          <FlightCard
            key={flight._id}
            flight={flight}
            onPress={handleFlightPress}
            userLocation={user?.location}

          />
        )) : activeTab == "ongoing" ? filteredFlights.map((flight) =>
          <InFlightDroneCard
            key={flight._id}
            id={flight.localFlightId}
            droneId={flight.drone_id}
            from={flight.start_location}
            to={flight.end_location}
            eta={0 || "Calculating"}
            battery={100}
            // status={flight.status}
            onPress={() => handleFlightPress(flight)}

          />
        ) : filteredFlights.map((flight) =>
          <FlightHistoryCard key={flight._id} flight={flight} onPress={() => handleFlightPress(flight)} />
        )}
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
          <Text className="text-3xl font-bold text-gray-800">Flights</Text>

          <Text className="text-gray-600 mt-6">Select a flight to view details</Text>
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

export default FlightDashboard;