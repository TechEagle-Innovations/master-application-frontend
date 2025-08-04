// // import React, { useEffect, useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   ActivityIndicator,
// //   TouchableOpacity,
// //   Alert,
// // } from 'react-native';
// // import { useLocalSearchParams, useRouter } from 'expo-router';
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import Header from '@/components/Header';
// // import { batteryService } from '@/utils/api/services/BatteryService';
// // import VoltagePopup from '@/components/VoltagePopup';
// // import { useShipment } from '@/utils/ShipmentContext';

// // interface Battery {
// //   _id: string;
// //   battery_id?: string;
// //   serialNumber?: string;
// //   model?: string;
// //   battery_type?: string; 
// //   num_of_cells?: number;
// //   voltage?: number;
// //   mah?: number;
// //   chargingPercentage?: number;
// //   charged_status?: 'charged' | 'discharged' | 'charging';
// //   locationId?: string;
// //   created_by?: string;
// // }

// // export default function BatteryInfo() {
// //   const { id } = useLocalSearchParams<{ id: string }>();
// //   const router = useRouter();
// //   const insets = useSafeAreaInsets();

// //   const [battery, setBattery] = useState<Battery | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [popupVisible, setPopupVisible] = useState(false);
// //   const { startVoltage, setStartVoltage, setStartTime, startTime } = useShipment();

// //   useEffect(() => {
// //     if (!id) {
// //       setError('Invalid battery ID.');
// //       setLoading(false);
// //       return;
// //     }

// //     (async () => {
// //       try {
// //         setLoading(true);
// //         setError(null);
// //         const list = await batteryService.getBatteries();
// //         const found = (list as Battery[]).find((b) => b._id === id);
// //         if (!found) {
// //           setError('Battery not found.');
// //         }
// //         setBattery(found ?? null);
// //       } catch {
// //         setError('Failed to load battery info.');
// //       } finally {
// //         setLoading(false);
// //       }
// //     })();
// //   }, [id, popupVisible]);

// //   if (loading) {
// //     return (
// //       <View className="flex-1 items-center justify-center bg-white">
// //         <ActivityIndicator size="large" color="#f97316" />
// //         <Text className="mt-2 text-gray-500">Loading battery info...</Text>
// //       </View>
// //     );
// //   }

// //   if (error || !battery) {
// //     return (
// //       <View className="flex-1 items-center justify-center bg-white px-4">
// //         <Text className="text-red-500 text-center font-medium">{error}</Text>
// //       </View>
// //     );
// //   }

// //   const statusMap = {
// //     charged: ['Fully Charged', '#22c55e'],
// //     discharged: ['Discharged', '#ef4444'],
// //     charging: ['Charging', '#f59e42'],
// //   } as const;
// //   const [statusLabel, statusColor] = statusMap[battery.charged_status ?? 'charging'];

// //   const showStart = battery.charged_status === 'discharged';
// //   const showEnd = battery.charged_status === 'charging';

// //   const onPopupConfirm = async(voltage: number, timestamp: string) => {
// //     setStartVoltage(voltage);
// //     setStartTime(timestamp);
// //     // TODO: call API to start charging, pass voltage and time
// //     try {
// //       if (battery.battery_id) {
// //        const startCharging= await batteryService.startCharging(battery.battery_id);
// //         console.log('Charging started:', startCharging);
        
// //       } else {
// //         throw new Error('Battery ID is missing.');
// //       }
// //     } catch (error) {
// //       console.error('Error starting charging:', error);
// //       // Handle error (e.g., show alert)
// //     }finally {
// //     setPopupVisible(false);

// //     }
// //   };

// //   return (
// //     <View className="flex-1 bg-white">
// //       <Header
// //         insets={insets}
// //         text={battery.battery_id || battery.serialNumber || '-'}
// //       />
// //       <ScrollView
// //         contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         {/* Charge Percentage */}
// //         <View className="items-center mt-2 mb-6">
// //           <View className="border-4 border-gray-300 rounded-xl p-2">
// //             <View className="border-4 border-gray-300 rounded-lg p-4 min-w-[120px] items-center">
// //               <Text className="text-4xl font-semibold text-black">
// //                 {battery.chargingPercentage ?? 0}%
// //               </Text>
// //             </View>
// //           </View>
// //         </View>

// //         {/* Battery Info */}
// //         {[
// //           ['Model', battery.model],
// //           ['Battery ID', battery.battery_id],
// //           ['Type', battery.battery_type],
// //         ].map(([label, value]) => (
// //           <React.Fragment key={label}>
// //             <Text className="text-gray-500 text-base mb-1">{label}</Text>
// //             <Text className="mb-4 text-lg text-black">{value ?? '-'}</Text>
// //           </React.Fragment>
// //         ))}

// //         {/* Technical Specs */}
// //         <Text className="text-gray-500 text-base mb-1">Technical Specs</Text>
// //         <View className="flex-row justify-between bg-gray-100 rounded-lg px-4 py-3 mb-4">
// //           <View>
// //             <Text className="text-gray-500 text-xs">No. of Cells</Text>
// //             <Text className="text-base">
// //               {battery.num_of_cells ? `${battery.num_of_cells} cells` : '-'}
// //             </Text>
// //           </View>
// //           <View>
// //             <Text className="text-gray-500 text-xs">Voltage</Text>
// //             <Text className="text-base">
// //               {battery.voltage ? `${battery.voltage}V` : '-'}
// //             </Text>
// //           </View>
// //           <View>
// //             <Text className="text-gray-500 text-xs">Capacity</Text>
// //             <Text className="text-base">
// //               {battery.mah ? `${battery.mah} mAh` : '-'}
// //             </Text>
// //           </View>
// //         </View>

// //         {/* Status & Location */}
// //         <Text className="text-gray-500 text-base mb-1">Charge Status</Text>
// //         <View className="flex-row items-center mb-4">
// //           <View
// //             style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: statusColor, marginRight: 8 }}
// //           />
// //           <Text className="text-base" style={{ color: statusColor }}>
// //             {statusLabel}
// //           </Text>
// //         </View>

// //         {[['Location ID', battery?.locationId], ['Added by', battery.created_by]].map(([lbl, val]) => (
// //           <React.Fragment key={lbl}>
// //             <Text className="text-gray-500 text-base mb-1">{lbl}</Text>
// //             <Text className="mb-4 text-lg text-black">{val ?? '-'}</Text>
// //           </React.Fragment>
// //         ))}
// //       </ScrollView>

// //       {/* Bottom Actions */}
// //       <View
// //         className="absolute left-0 right-0 bottom-0 bg-white px-5 pb-5"
// //         style={{ paddingBottom: insets.bottom + 20 }}
// //       >
// //         <View className="flex flex-col space-y-3">
// //           <TouchableOpacity
// //             className="w-full rounded-xl py-4 bg-gray-100 items-center"
// //             onPress={() => {
// //               // TODO: discard logic
// //               Alert.alert(
// //         "Discard Confirmation",
// //         "Are you sure you want to discard?",
// //         [
// //           {
// //             text: "Cancel",
// //             style: "cancel",
// //           },
// //           {
// //             text: "Discard",
// //             style: "destructive",
// //             onPress: async() => {
// //               // Handle discard logic here
// //               console.log("User confirmed discard");
// //              try {
// //                setLoading(true);
// //                if (battery.battery_id) {
// //                  const discardBattery = await batteryService.discardBattery(battery.battery_id);
// //                  // For example: router.back(); or reset state
// //                } else {
// //                  console.error('Error', 'Battery ID is missing. Cannot discard.');
// //                }
// //              } catch (error) {
// //                console.error('Error discarding battery:', error);
// //                Alert.alert('Error', 'Failed to discard battery. Please try again.');
// //              }finally{
// //                 setLoading(false);
// //                 router.back(); // Navigate back after discarding
// //              }
// //             },
// //           },
// //         ]
// //       );
    


              
// //             }}
// //           >
// //             <Text className="text-lg text-black">Discard</Text>
// //           </TouchableOpacity>

// //           {showStart && (
// //             <TouchableOpacity
// //               className="w-full rounded-xl py-4 bg-orange-500 items-center"
// //               onPress={() => setPopupVisible(true)}
// //             >
// //               <Text className="text-lg text-white">Start Charging</Text>
// //             </TouchableOpacity>
// //           )}

// //           {showEnd && battery.num_of_cells && (
// //             <TouchableOpacity
// //               className="w-full rounded-xl py-4 bg-orange-500 items-center"
// //               onPress={() =>
// //                 router.push({
// //                   pathname: '/(app)/after-charging',
// //                   params: { noOfCells: battery?.num_of_cells?.toString(), voltage: startVoltage?.toString(), startTime: startTime?.toString(), batteryId: battery.battery_id },
// //                 })
// //               }
// //             >
// //               <Text className="text-lg text-white">End Charging</Text>
// //             </TouchableOpacity>
// //           )}
// //         </View>
// //       </View>

// //       {/* Popup */}
// //       <VoltagePopup
// //         visible={popupVisible}
// //         onCancel={() => setPopupVisible(false)}
// //         onConfirm={onPopupConfirm}
// //       />
// //     </View>
// //   );
// // }
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Header from '@/components/Header';
// import { batteryService } from '@/utils/api/services/BatteryService';
// import VoltagePopup from '@/components/VoltagePopup';
// import { useShipment } from '@/utils/ShipmentContext';
// import { Ionicons } from '@expo/vector-icons';

// interface Battery {
//   _id: string;
//   battery_id?: string;
//   serialNumber?: string;
//   model?: string;
//   battery_type?: string; 
//   num_of_cells?: number;
//   voltage?: number;
//   mah?: number;
//   chargingPercentage?: number;
//   charged_status?: 'charged' | 'discharged' | 'charging';
//   locationId?: string;
//   created_by?: string;
// }

// export default function BatteryInfo() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const insets = useSafeAreaInsets();

//   const [battery, setBattery] = useState<Battery | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [popupVisible, setPopupVisible] = useState(false);
//   const { startVoltage, setStartVoltage, setStartTime, startTime } = useShipment();

//   useEffect(() => {
//     if (!id) {
//       setError('Invalid battery ID.');
//       setLoading(false);
//       return;
//     }

//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const list = await batteryService.getBatteries();
//         const found = (list as Battery[]).find((b) => b._id === id);
//         if (!found) {
//           setError('Battery not found.');
//         }
//         setBattery(found ?? null);
//       } catch {
//         setError('Failed to load battery info.');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [id, popupVisible]);

//   if (loading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-white">
//         <ActivityIndicator size="large" color="#f97316" />
//         <Text className="mt-2 text-gray-500">Loading battery info...</Text>
//       </View>
//     );
//   }

//   if (error || !battery) {
//     return (
//       <View className="flex-1 items-center justify-center bg-white px-4">
//         <Text className="text-red-500 text-center font-medium">{error}</Text>
//       </View>
//     );
//   }

//   const statusMap = {
//     charged: ['Fully Charged', '#22c55e'],
//     discharged: ['Discharged', '#ef4444'],
//     charging: ['Charging', '#f59e42'],
//   } as const;
//   const [statusLabel, statusColor] = statusMap[battery.charged_status ?? 'charging'];

//   const showStart = battery.charged_status === 'discharged';
//   const showEnd = battery.charged_status === 'charging';

//   const onPopupConfirm = async(voltage: number, timestamp: string) => {
//     setStartVoltage(voltage);
//     setStartTime(timestamp);
//     try {
//       if (battery.battery_id) {
//        const startCharging= await batteryService.startCharging(battery.battery_id);
//         console.log('Charging started:', startCharging);
//       } else {
//         throw new Error('Battery ID is missing.');
//       }
//     } catch (error) {
//       console.error('Error starting charging:', error);
//     } finally {
//       setPopupVisible(false);
//     }
//   };

//   return (
//     <View className="flex-1 bg-white">
//       <Header
//         insets={insets}
//         text={battery.battery_id || battery.serialNumber || '-'}
//       />
//       <ScrollView
//         contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Charge Percentage */}
//         <View className="items-center mt-2 mb-6">
//           <View className="border-4 border-gray-300 rounded-xl p-2">
//             <View className="border-4 border-gray-300 rounded-lg p-4 min-w-[120px] items-center">
//               <Text className="text-4xl font-semibold text-black">
//                 {battery.chargingPercentage ?? 0}%
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* History Buttons */}
//         <View className="flex-row justify-around mb-6">
//           <TouchableOpacity
//             className="flex-1 mr-2 bg-gray-100 rounded-xl py-4 items-center"
//             onPress={() => router.push({pathname:`/(app)/charging-history`})}
//           >
//             <Ionicons name="battery-charging-outline" size={24} color="#f97316" />
//             <Text className="mt-1 text-base text-gray-800">Charge History</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className="flex-1 ml-2 bg-gray-100 rounded-xl py-4 items-center"
//             onPress={() => router.push({pathname:`/(app)/battery-flight-history`})}
//           >
//             <Ionicons name="airplane-outline" size={24} color="#f97316" />
//             <Text className="mt-1 text-base text-gray-800">Flights History</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Battery Info */}
//         {[
//           ['Model', battery.model],
//           ['Battery ID', battery.battery_id],
//           ['Type', battery.battery_type],
//         ].map(([label, value]) => (
//           <React.Fragment key={label}>
//             <Text className="text-gray-500 text-base mb-1">{label}</Text>
//             <Text className="mb-4 text-lg text-black">{value ?? '-'}</Text>
//           </React.Fragment>
//         ))}

//         {/* Technical Specs */}
//         <Text className="text-gray-500 text-base mb-1">Technical Specs</Text>
//         <View className="flex-row justify-between bg-gray-100 rounded-lg px-4 py-3 mb-4">
//           <View>
//             <Text className="text-gray-500 text-xs">No. of Cells</Text>
//             <Text className="text-base">
//               {battery.num_of_cells ? `${battery.num_of_cells} cells` : '-'}
//             </Text>
//           </View>
//           <View>
//             <Text className="text-gray-500 text-xs">Voltage</Text>
//             <Text className="text-base">
//               {battery.voltage ? `${battery.voltage}V` : '-'}
//             </Text>
//           </View>
//           <View>
//             <Text className="text-gray-500 text-xs">Capacity</Text>
//             <Text className="text-base">
//               {battery.mah ? `${battery.mah} mAh` : '-'}
//             </Text>
//           </View>
//         </View>

//         {/* Status & Location */}
//         <Text className="text-gray-500 text-base mb-1">Charge Status</Text>
//         <View className="flex-row items-center mb-4">
//           <View
//             style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: statusColor, marginRight: 8 }}
//           />
//           <Text className="text-base" style={{ color: statusColor }}>
//             {statusLabel}
//           </Text>
//         </View>

//         {[['Location ID', battery?.locationId], ['Added by', battery.created_by]].map(([lbl, val]) => (
//           <React.Fragment key={lbl}>
//             <Text className="text-gray-500 text-base mb-1">{lbl}</Text>
//             <Text className="mb-4 text-lg text-black">{val ?? '-'}</Text>
//           </React.Fragment>
//         ))}
//       </ScrollView>

//       {/* Bottom Actions */}
//       <View
//         className="absolute left-0 right-0 bottom-0 bg-white px-5 pb-5"
//         style={{ paddingBottom: insets.bottom + 20 }}
//       >
//         <View className="flex flex-col space-y-3">
//           <TouchableOpacity
//             className="w-full rounded-xl py-4 bg-gray-100 items-center"
//             onPress={() => {
//               Alert.alert(
//         "Discard Confirmation",
//         "Are you sure you want to discard?",
//         [
//           {
//             text: "Cancel",
//             style: "cancel",
//           },
//           {
//             text: "Discard",
//             style: "destructive",
//             onPress: async() => {
//               console.log("User confirmed discard");
//              try {
//                setLoading(true);
//                if (battery.battery_id) {
//                  const discardBattery = await batteryService.discardBattery(battery.battery_id);
//                } else {
//                  console.error('Error', 'Battery ID is missing. Cannot discard.');
//                }
//              } catch (error) {
//                console.error('Error discarding battery:', error);
//                Alert.alert('Error', 'Failed to discard battery. Please try again.');
//              }finally{
//                 setLoading(false);
//                 router.back();
//              }
//             },
//           },
//         ]
//       );
//             }}
//           >
//             <Text className="text-lg text-black">Discard</Text>
//           </TouchableOpacity>

//           {showStart && (
//             <TouchableOpacity
//               className="w-full rounded-xl py-4 bg-orange-500 items-center"
//               onPress={() => setPopupVisible(true)}
//             >
//               <Text className="text-lg text-white">Start Charging</Text>
//             </TouchableOpacity>
//           )}

//           {showEnd && battery.num_of_cells && (
//             <TouchableOpacity
//               className="w-full rounded-xl py-4 bg-orange-500 items-center"
//               onPress={() =>
//                 router.push({
//                   pathname: '/(app)/after-charging',
//                   params: { noOfCells: battery?.num_of_cells?.toString(), voltage: startVoltage?.toString(), startTime: startTime?.toString(), batteryId: battery.battery_id },
//                 })
//               }
//             >
//               <Text className="text-lg text-white">End Charging</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Popup */}
//       <VoltagePopup
//         visible={popupVisible}
//         onCancel={() => setPopupVisible(false)}
//         onConfirm={onPopupConfirm}
//       />
//     </View>
//   );
// }
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { batteryService } from '@/utils/api/services/BatteryService';
import VoltagePopup from '@/components/VoltagePopup';
import { useShipment } from '@/utils/ShipmentContext';
import { Ionicons } from '@expo/vector-icons';

interface Battery {
  _id: string;
  battery_id?: string;
  serialNumber?: string;
  model?: string;
  battery_type?: string; 
  num_of_cells?: number;
  voltage?: number;
  mah?: number;
  chargingPercentage?: number;
  charged_status?: 'charged' | 'discharged' | 'charging' | 'discarded';
  locationId?: string;
  created_by?: string;
  isDiscarded?: boolean;
}

export default function BatteryInfo() {
  const params = useLocalSearchParams() || {};
  const id = params?.id 
    ? (Array.isArray(params.id) 
      ? params.id[0] 
      : params.id)
    : '';
  const router = useRouter();
  const insets = useSafeAreaInsets();
   
  const [battery, setBattery] = useState<Battery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const { startVoltage, setStartVoltage, setStartTime, startTime } = useShipment();

  const statusMap = {
    charged: ['Fully Charged', '#22c55e'],
    discharged: ['Discharged', '#ef4444'],
    charging: ['Charging', '#f59e42'],
    discarded: ['Discarded', '#888']
  } as const;
   
  useEffect(() => {
    if (!id) {
      setError('Invalid battery ID.');
      setLoading(false);
      return;
    }

    const loadBatteryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await batteryService.getBatteries();
        const found = (list as Battery[]).find((b) => b._id === id);
        
        if (!found) {
          setError('Battery not found.');
          setBattery(null);
          return;
        }

        setBattery(found);
      } catch (err) {
        console.error('Error loading battery:', err);
        setError('Failed to load battery info.');
      } finally {
        setLoading(false);
      }
    };

    loadBatteryData();
  }, [id, popupVisible]);

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-red-500 text-center font-medium">
          Battery ID is required
        </Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
          onPress={() => router.back()}
        >
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-2 text-gray-500">Loading battery info...</Text>
      </View>
    );
  }

  if (error || !battery) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-red-500 text-center font-medium">{error}</Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
          onPress={() => router.back()}
        >
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get status with fallback for unknown states
  const [statusLabel, statusColor] = battery.charged_status 
    ? (statusMap[battery.charged_status] || ['Unknown', '#888']) 
    : ['Unknown', '#888'];

  const isDiscarded = battery.isDiscarded || battery.charged_status === 'discarded';
  const showStart = !isDiscarded && battery.charged_status === 'discharged';
  const showEnd = !isDiscarded && battery.charged_status === 'charging';

  const onPopupConfirm = async(voltage: number, timestamp: string) => {
    setStartVoltage(voltage);
    setStartTime(timestamp);
    try {
      if (battery.battery_id) {
        const startCharging = await batteryService.startCharging(battery.battery_id);
        console.log('Charging started:', startCharging);
      } else {
        throw new Error('Battery ID is missing.');
      }
    } catch (error) {
      console.error('Error starting charging:', error);
      Alert.alert('Error', 'Failed to start charging. Please try again.');
    } finally {
      setPopupVisible(false);
    }
  };

  const handleDiscard = async () => {
    Alert.alert(
      "Discard Confirmation",
      "Are you sure you want to discard this battery?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: async() => {
            try {
              setLoading(true);
              if (battery.battery_id) {
                await batteryService.discardBattery(battery.battery_id);
                // Update local state to reflect discarded status
                setBattery({
                  ...battery,
                  charged_status: 'discarded',
                  isDiscarded: true
                });
              } else {
                throw new Error('Battery ID is missing. Cannot discard.');
              }
            } catch (error) {
              console.error('Error discarding battery:', error);
              Alert.alert('Error', 'Failed to discard battery. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white" style={{ opacity: isDiscarded ? 0.7 : 1 }}>
      <Header
        insets={insets}
        text={battery.battery_id || battery.serialNumber || '-'}
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {isDiscarded && (
          <View className="bg-gray-200 p-3 rounded-lg mb-4">
            <Text className="text-center font-medium text-gray-700">
              This battery has been discarded
            </Text>
          </View>
        )}

        {/* Charge Percentage */}
        <View className="items-center mt-2 mb-6">
          <View className="border-4 border-gray-300 rounded-xl p-2">
            <View className="border-4 border-gray-300 rounded-lg p-4 min-w-[120px] items-center">
              <Text className="text-4xl font-semibold text-black">
                {battery.chargingPercentage ?? 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* History Buttons */}
        {!isDiscarded && (
          <View className="flex-row justify-around mb-6">
            <TouchableOpacity
              className="flex-1 mr-2 bg-gray-100 rounded-xl py-4 items-center"
              onPress={() => router.push({ pathname: '/(app)/charging-history' })}
            >
              <Ionicons name="battery-charging-outline" size={24} color="#f97316" />
              <Text className="mt-1 text-base text-gray-800">Charge History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 ml-2 bg-gray-100 rounded-xl py-4 items-center"
              onPress={() => router.push({ pathname: '/(app)/battery-flight-history' })}
            >
              <Ionicons name="airplane-outline" size={24} color="#f97316" />
              <Text className="mt-1 text-base text-gray-800">Flights History</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Battery Info */}
        {[
          ['Model', battery.model],
          ['Battery ID', battery.battery_id],
          ['Type', battery.battery_type],
        ].map(([label, value]) => (
          <React.Fragment key={label}>
            <Text className="text-gray-500 text-base mb-1">{label}</Text>
            <Text className="mb-4 text-lg text-black">{value ?? '-'}</Text>
          </React.Fragment>
        ))}

        {/* Technical Specs */}
        <Text className="text-gray-500 text-base mb-1">Technical Specs</Text>
        <View className="flex-row justify-between bg-gray-100 rounded-lg px-4 py-3 mb-4">
          <View>
            <Text className="text-gray-500 text-xs">No. of Cells</Text>
            <Text className="text-base">
              {battery.num_of_cells ? `${battery.num_of_cells} cells` : '-'}
            </Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Voltage</Text>
            <Text className="text-base">
              {battery.voltage ? `${battery.voltage}V` : '-'}
            </Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Capacity</Text>
            <Text className="text-base">
              {battery.mah ? `${battery.mah} mAh` : '-'}
            </Text>
          </View>
        </View>

        {/* Status & Location */}
        <Text className="text-gray-500 text-base mb-1">Charge Status</Text>
        <View className="flex-row items-center mb-4">
          <View
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: statusColor, marginRight: 8 }}
          />
          <Text className="text-base" style={{ color: statusColor }}>
            {statusLabel}
          </Text>
        </View>

        {[['Location ID', battery?.locationId], ['Added by', battery.created_by]].map(([lbl, val]) => (
          <React.Fragment key={lbl}>
            <Text className="text-gray-500 text-base mb-1">{lbl}</Text>
            <Text className="mb-4 text-lg text-black">{val ?? '-'}</Text>
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Bottom Actions */}
      <View
        className="absolute left-0 right-0 bottom-0 bg-white px-5 pb-5"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <View className="flex flex-col space-y-3">
          {!isDiscarded && (
            <TouchableOpacity
              className="w-full rounded-xl py-4 bg-gray-100 items-center"
              onPress={handleDiscard}
            >
              <Text className="text-lg text-black">Discard</Text>
            </TouchableOpacity>
          )}

          {showStart && (
            <TouchableOpacity
              className="w-full rounded-xl py-4 bg-orange-500 items-center"
              onPress={() => setPopupVisible(true)}
            >
              <Text className="text-lg text-white">Start Charging</Text>
            </TouchableOpacity>
          )}

          {showEnd && battery.num_of_cells && (
            <TouchableOpacity
              className="w-full rounded-xl py-4 bg-orange-500 items-center"
              onPress={() =>
                router.push({
                  pathname: '/(app)/after-charging',
                  params: { 
                    noOfCells: battery?.num_of_cells?.toString(), 
                    voltage: startVoltage?.toString(), 
                    startTime: startTime?.toString(), 
                    batteryId: battery.battery_id 
                  },
                })
              }
            >
              <Text className="text-lg text-white">End Charging</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Popup */}
      <VoltagePopup
        visible={popupVisible}
        onCancel={() => setPopupVisible(false)}
        onConfirm={onPopupConfirm}
      />
    </View>
  );
}