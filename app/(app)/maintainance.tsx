import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';
import { useShipment, Maintenance } from '../../utils/ShipmentContext';
import { maintainanceService } from '@/utils/api/services/MaintainanceService';
import Header from '@/components/Header';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 3 Months', value: '3m' },
];

function MaintenanceHeader({ topInset }: { topInset: number }) {
  return (
    <View className="flex-row items-center justify-between px-4 bg-white" style={{ paddingTop: topInset, minHeight: 56 + topInset }}>
      <Text className="text-3xl font-bold text-gray-800">Maintenance</Text>
    </View>
  );
}

function FilterChips({ activeFilter, onFilterPress }: { activeFilter: string; onFilterPress: (filter: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
      }}
      style={{
        flexGrow: 0,
      }}
    >
      {FILTERS.map((filter) => (
        <TouchableOpacity
          key={filter.value}
          className={`h-10 px-5 flex-row items-center justify-center rounded-full mr-3 ${activeFilter === filter.value ? 'bg-orange-500' : 'bg-gray-100'}`}
          style={{ 
            minWidth: 48, 
            borderWidth: activeFilter === filter.value ? 0 : 1, 
            borderColor: activeFilter === filter.value ? 'transparent' : '#e5e7eb' 
          }}
          onPress={() => onFilterPress(filter.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: activeFilter === filter.value }}
        >
          <Text className={`${activeFilter === filter.value ? 'text-white' : 'text-gray-700'} font-semibold text-base`}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function MaintenanceCard({ maintenance }: { maintenance: Maintenance }) {
  const router = useRouter();
  const { setMaintenance } = useShipment();
  
  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between"
      accessibilityRole="button"
      accessibilityLabel={`View details for maintenance ${maintenance._id}`}
      onPress={() => {
        setMaintenance(maintenance);
        router.push('/(app)/maintenance-detail' as any);
      }}
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-2">
          <Text className="text-lg font-medium mr-2">{maintenance.droneId}</Text>
          {!maintenance.isResolved && (
            <View className="w-2 h-2 rounded-full bg-orange-500 ml-1" />
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400">
            {new Date(maintenance.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <Text className={`${
            maintenance.status === 'Completed' ? 'text-green-500' : 
            maintenance.status === 'In Progress' ? 'text-orange-500' : 
            'text-gray-500'
          } font-medium`}>
            {maintenance.status}
          </Text>
        </View>
      </View>
      <Text className="text-4xl text-gray-300">›</Text>
    </TouchableOpacity>
  );
}

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { maintenanceRecords, setMaintenanceRecords } = useShipment();

  const fetchMaintenanceRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await maintainanceService.getMaintenanceRecords() as Maintenance[];
      setMaintenanceRecords(res);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch maintenance records',
      });
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMaintenanceRecords();
  }, [fetchMaintenanceRecords]);

  const filteredMaintenance = maintenanceRecords.filter((m) => {
    // Filter by time period
    if (activeFilter === 'all') return true;
    
    const mDate = new Date(m.createdAt);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    mDate.setHours(0, 0, 0, 0);
    
    if (activeFilter === '7d') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return mDate >= sevenDaysAgo;
    }
    if (activeFilter === '30d') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return mDate >= thirtyDaysAgo;
    }
    if (activeFilter === '3m') {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return mDate >= threeMonthsAgo;
    }
    return true;
  }).filter((m) =>
    // Filter by search term
    (m.droneId?.toLowerCase().includes(search.toLowerCase())) ||
    (m.description?.toLowerCase().includes(search.toLowerCase())) ||
    (m.status?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View className="flex-1 bg-white">
      <Header insets={insets} text='Maintainance'/>
      
     
      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-2">
        <MagnifyingGlassIcon size={20} color="gray" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-700"
          placeholder="Search by Drone ID or Description"
          placeholderTextColor="gray"
          value={search}
          onChangeText={setSearch}
          accessibilityRole="search"
          accessibilityLabel="Search maintenance records"
        />
      </View>

      {/* Filter Chips */}
      <FilterChips activeFilter={activeFilter} onFilterPress={setActiveFilter} />

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{
            paddingBottom: insets.bottom + 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          >
          {filteredMaintenance.length > 0 ? (
            filteredMaintenance.map((m) => (
              <MaintenanceCard key={m._id} maintenance={m} />
            ))
          ) : (
            <View className="flex-1 items-center justify-center mt-8">
              <Text className="text-gray-400 text-center">
                {search.trim() ? 
                  'No maintenance records match your search' : 
                  'No maintenance records found for the selected filter'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}