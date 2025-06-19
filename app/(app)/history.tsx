import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bars3Icon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import HamburgerMenu from '../../components/HamburgerMenu';
import { useRouter } from 'expo-router';
import Drone from "@/assets/images/drone.svg";
import History from "@/assets/images/history.svg";
import DroneActive from "@/assets/images/drone-active.svg";
import HistoryActive from "@/assets/images/history-active.svg";
import { useShipment } from '../../utils/ShipmentContext';
import type { Shipment } from '../../types/shipment';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 3 Months', value: '3m' },
];

function HistoryHeader({ onMenuPress, topInset }: { onMenuPress: () => void; topInset: number }) {
  return (
    <View className="flex-row items-center justify-between px-4 bg-white" style={{ paddingTop: topInset, minHeight: 56 + topInset }}>
      <Text className="text-3xl font-bold text-gray-800">History</Text>
      <TouchableOpacity onPress={onMenuPress} accessibilityRole="button" accessibilityLabel="Open menu" accessibilityHint="Opens the navigation menu">
        <Bars3Icon size={30} color="black" />
      </TouchableOpacity>
    </View>
  );
}

function HistoryTabs({ activeTab, onTabPress }: { activeTab: 'shipments' | 'maintenance'; onTabPress: (tab: 'shipments' | 'maintenance') => void }) {
  return (
    <View className="w-full flex-row px-4 mt-2 border-b border-gray-200">
      <TouchableOpacity
        className={`p-4 ${activeTab === 'shipments' ? 'border-b-2 border-orange-500' : ''} mr-6 flex-1`}
        onPress={() => onTabPress('shipments')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'shipments' }}
        accessibilityLabel="Shipments tab"
        accessibilityHint="Shows shipment history"
      >
        <Text className={`${activeTab === 'shipments' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>Shipments</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`p-4 ${activeTab === 'maintenance' ? 'border-b-2 border-orange-500' : ''} flex-1`}
        onPress={() => onTabPress('maintenance')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'maintenance' }}
        accessibilityLabel="Maintenance tab"
        accessibilityHint="Shows maintenance history"
      >
        <Text className={`${activeTab === 'maintenance' ? 'text-orange-500' : 'text-gray-500'} text-lg text-center`}>Maintenance</Text>
      </TouchableOpacity>
    </View>
  );
}

function FilterChips({ activeFilter, onFilterPress }: { activeFilter: string; onFilterPress: (filter: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16, // Adjust as needed
        paddingVertical: 12,    // mb-0
        alignItems: 'center',  // Vertically center items
      }}
      style={{
        flexGrow: 0,          // Prevents taking extra vertical space
      }}
    >
      {FILTERS.map((filter, idx) => (
        <TouchableOpacity
          key={filter.value}
          className={`h-10 px-5 flex-row items-center justify-center rounded-full mr-3 ${activeFilter === filter.value ? 'bg-orange-500' : 'bg-gray-100'} ${idx === 0 ? 'shadow-md' : ''}`}
          style={{ minWidth: 48, borderWidth: activeFilter === filter.value ? 0 : 1, borderColor: activeFilter === filter.value ? 'transparent' : '#e5e7eb' }}
          onPress={() => onFilterPress(filter.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: activeFilter === filter.value }}
        >
          <Text className={`${activeFilter === filter.value ? 'text-white' : 'text-gray-700'} font-semibold text-base`}>{filter.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const router = useRouter();
  const { setShipment } = useShipment();
  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm  flex-row items-center justify-between"
      accessibilityRole="button"
      accessibilityLabel={`View details for shipment ${shipment.invoiceNumber}`}
      onPress={() => {
        setShipment(shipment);
        router.push({ pathname: '/(app)/shipment-detail' });
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

const BottomNav = React.memo(({ activeNav, onNavPress, style }: { activeNav: 'drones' | 'history'; onNavPress: (nav: 'drones' | 'history') => void; style: ViewStyle }) => (
  <View
    className="w-full bg-white border-t border-gray-200 flex-row justify-around"
    style={[
      style,
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
      },
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
      {activeNav === 'drones' ? <DroneActive size={25} className="text-primary" /> : <Drone size={24} className="text-gray-500" />}
      <Text className={`${activeNav === 'drones' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>Drones</Text>
    </TouchableOpacity>
    <TouchableOpacity
      className="items-center justify-center flex-1 py-2"
      onPress={() => onNavPress('history')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeNav === 'history' }}
      accessibilityLabel="History tab"
      accessibilityHint="Navigate to history view"
    >
      {activeNav === 'history' ? <HistoryActive size={24} className="text-primary" /> : <History size={24} className="text-gray-500" />}
      <Text className={`${activeNav === 'history' ? 'text-orange-600' : 'text-gray-500'} text-xs mt-1`}>History</Text>
    </TouchableOpacity>
  </View>
));

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'shipments' | 'maintenance'>('shipments');
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [activeNav, setActiveNav] = useState<'drones' | 'history'>('history');
  const { shipments, setShipment } = useShipment();
  // Filtered data (mock logic)
  const filteredShipments = shipments.filter((shipment) => {
    if (activeFilter === 'all') return true;
    // Use pickup scheduled date for filtering
    const shipmentDate = new Date(shipment.pickUpDetails.scheduledDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    shipmentDate.setHours(0, 0, 0, 0);
    if (activeFilter === '7d') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return shipmentDate >= sevenDaysAgo;
    }
    if (activeFilter === '30d') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return shipmentDate >= thirtyDaysAgo;
    }
    if (activeFilter === '3m') {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return shipmentDate >= threeMonthsAgo;
    }
    return true;
  }).filter((shipment) =>
    shipment.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    shipment.senderDetails.address.addressLine.toLowerCase().includes(search.toLowerCase()) ||
    shipment.receiverDetails.address.addressLine.toLowerCase().includes(search.toLowerCase())
  );

  const bottomNavHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 56 + insets.bottom;

  const handleNavPress = useCallback((nav: 'drones' | 'history') => {
    setActiveNav(nav);
    if (nav === 'drones') {
      router.push('/(app)/dashboard');
    }
  }, [router]);

  const handleMenuClose = useCallback(() => setMenuVisible(false), []);

  return (
    <View className="flex-1 bg-white">
      <HistoryHeader onMenuPress={() => setMenuVisible(true)} topInset={insets.top} />
      <View className="px-4">
        <Text className="text-gray-500 text-lg">Track Previous Shipments and Maintenance</Text>
      </View>
      <View className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-1">
        <MagnifyingGlassIcon size={20} color="gray" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-700"
          placeholder="Search Shipment ID or Drone ID"
          placeholderTextColor="gray"
          value={search}
          onChangeText={setSearch}
          accessibilityRole="search"
          accessibilityLabel="Search shipments or drones"
        />
      </View>
      <HistoryTabs activeTab={activeTab} onTabPress={setActiveTab} />
      <FilterChips activeFilter={activeFilter} onFilterPress={setActiveFilter} />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: bottomNavHeight + 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'shipments' && (
          shipments.length > 0 ? (
            filteredShipments.map((shipment) => (
              <ShipmentCard key={shipment.assignedAWBNumbers} shipment={shipment} />
            ))
          ) : (
            <View className="flex-1 items-center justify-center mt-8">
              <Text className="text-gray-400 text-center">No shipments found for the selected filter.</Text>
            </View>
          )
        )}
        {activeTab === 'maintenance' && (
          <Text className="text-gray-400 text-center mt-8">No maintenance records found.</Text>
        )}
      </ScrollView>
      <BottomNav activeNav={activeNav} onNavPress={handleNavPress} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: bottomNavHeight, paddingBottom: insets.bottom }} />
      <HamburgerMenu isVisible={isMenuVisible} onClose={handleMenuClose} />
    </View>
  );
}

