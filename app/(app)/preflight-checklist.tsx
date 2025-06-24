import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMultiPhotoChecklist } from '../../hooks/useMultiPhotoChecklist';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import Header from '@/components/Header';

const CHECKLIST_ITEMS = [
  'Fuel Consumption',
  'Power Output',
  'Torque',
  'Engine Capacity',
  'Horsepower',
  'Top Speed',
  'Acceleration',
  'CO2 Emissions',
];

type ChecklistItem = string;


export default function PreFlightChecklist() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const droneId = params.id;
  const {
    photos,
    errors,
    loadingIndex,
    takePhotoForIndex,
    resetPhotoForIndex,
  } = useMultiPhotoChecklist(CHECKLIST_ITEMS.length);

  const allDone = photos.every((uri: string | null) => !!uri);

  const handleDone = () => {
    if (!allDone) {
      Alert.alert('Incomplete', 'Please capture all required photos before proceeding.');
      return;
    }
    // TODO: Submit checklist data/photos to backend if needed
    router.back();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
      <Header text='Preflight-Checklist' insets={insets}/>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {CHECKLIST_ITEMS.map((item: ChecklistItem, idx: number) => (
          <View key={item} className="flex-row items-center justify-between bg-white py-4 px-2 rounded-lg border-b border-gray-100">
            <Text className="text-lg text-gray-900 flex-1">{item}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Take photo for ${item}`}
              onPress={() => takePhotoForIndex(idx)}
              disabled={!!photos[idx] || loadingIndex === idx}
              style={{ opacity: !!photos[idx] ? 0.5 : 1 }}
            >
              {loadingIndex === idx ? (
                <ActivityIndicator size="small" color="#ea580c" />
              ) : (
                <View className="justify-center items-center bg-gray-100 w-14 h-14 rounded-full">
                <CameraIcon />
                </View>
              )}
            </TouchableOpacity>
            {!!photos[idx] && (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Retake photo for ${item}`} onPress={() => resetPhotoForIndex(idx)}>
                <Image source={{ uri: photos[idx] as string }} style={{ width: 40, height: 40, borderRadius: 8, marginLeft: 8 }} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {errors.map((err: string | null, idx: number) => err && (
          <Text key={idx} className="text-red-500 text-xs mt-1">{err}</Text>
        ))}
      </ScrollView>
      <View style={{ padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#f3f4f6' }}>
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          accessibilityRole="button"
          accessibilityLabel="Done"
          onPress={handleDone}
          disabled={!allDone}
          style={{ opacity: allDone ? 1 : 0.5 }}
        >
          <Text className="text-white text-lg font-semibold">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 