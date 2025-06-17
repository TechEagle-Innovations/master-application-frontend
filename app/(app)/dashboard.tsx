import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { useAuth } from '../../utils/auth/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { HomeIcon as HomeOutline, ClockIcon as ClockOutline } from 'react-native-heroicons/outline';
import { HomeIcon as HomeSolid, ClockIcon as ClockSolid } from 'react-native-heroicons/solid';
import HamburgerMenu from '../../components/HamburgerMenu';
import DroneCard from '../../components/DroneCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [activeNav, setActiveNav] = useState('drones');

  const drones = [
    { id: 'DRN-2023-001', location: 'New York City, NY', lastUsed: 'Oct 15, 2023', status: 'Assigned' as 'Assigned' | 'Stand-By' },
    { id: 'DRN-2023-002', location: 'Los Angeles, CA', lastUsed: 'Oct 16, 2023', status: 'Stand-By' as 'Assigned' | 'Stand-By' },
    { id: 'DRN-2023-003', location: 'San Francisco, CA', lastUsed: 'Oct 15, 2023', status: 'Stand-By' as 'Assigned' | 'Stand-By' },
    { id: 'DRN-2023-004', location: 'New York, NY', lastUsed: 'Oct 14, 2023', status: 'Stand-By' as 'Assigned' | 'Stand-By' },
    { id: 'DRN-2023-005', location: 'Chicago, IL', lastUsed: 'Oct 13, 2023', status: 'Stand-By' as 'Assigned' | 'Stand-By' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-10 px-4 py-4">
        <Text className="text-3xl font-bold text-gray-800">Drones</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Bars3Icon size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Select a drone text */}
      <View className="px-4 py-2">
        <Text className="text-gray-600 text-lg">Select a drone to view details</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mt-2">
        <TouchableOpacity 
          className={`pb-2 ${activeTab === 'available' ? 'border-b-2 border-orange-500' : ''} mr-6`}
          onPress={() => setActiveTab('available')}
        >
          <Text className={`${activeTab === 'available' ? 'text-orange-500' : 'text-gray-500'} text-lg font-semibold`}>Available</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`pb-2 ${activeTab === 'inFlight' ? 'border-b-2 border-orange-500' : ''}`}
          onPress={() => setActiveTab('inFlight')}
        >
          <Text className={`${activeTab === 'inFlight' ? 'text-orange-500' : 'text-gray-500'} text-lg font-semibold`}>In Flight</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-2">
        <MagnifyingGlassIcon size={20} color="gray" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-700"
          placeholder="Search drones..."
          placeholderTextColor="gray"
        />
      </View>

      {/* Drone List */}
      <ScrollView className="flex-1 mt-4 px-4 pb-20">
        {drones.map((drone) => (
          <DroneCard key={drone.id} {...drone} />
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex-row justify-around py-2">
        <TouchableOpacity 
          className="items-center"
          onPress={() => setActiveNav('drones')}
        >
          {activeNav === 'drones' ? <HomeSolid size={24} color="#ea580c" /> : <HomeOutline size={24} color="gray" />}
          <Text className={`${activeNav === 'drones' ? 'text-orange-600' : 'text-gray-500'} text-xs`}>Drones</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => setActiveNav('history')}
        >
          {activeNav === 'history' ? <ClockSolid size={24} color="#ea580c" /> : <ClockOutline size={24} color="gray" />}
          <Text className={`${activeNav === 'history' ? 'text-orange-600' : 'text-gray-500'} text-xs`}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Hamburger Menu */}
      <HamburgerMenu isVisible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
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