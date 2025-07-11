import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import Header from './Header';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import { useMultiPhotoChecklist } from '../hooks/useMultiPhotoChecklist';

export interface ChecklistItem {
  _id: string;
  active: boolean;
  confirm: boolean;
  label: string;
  notes: string;
  parameters: any[];
  serial_no: number;
  templateType_name: string;
  __v: number;
}

export interface PhotoChecklistProps {
  headerText: string;
  fetchChecklistItems: () => Promise<ChecklistItem[]>;
  submitChecklist: (items: ChecklistItem[], photos: (string | null)[]) => Promise<void>;
  token?: string;
}

export default function PhotoChecklist({
  headerText,
  fetchChecklistItems,
  submitChecklist,
}: PhotoChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    photos,
    errors: photoErrors,
    loadingIndex,
    takePhotoForIndex,
    resetPhotoForIndex,
  } = useMultiPhotoChecklist(checklistItems.length);

  const allPhotosTaken = photos.every((uri: string | null) => !!uri);
  const allItemsConfirmed = checklistItems.every(item => item.confirm);

  const loadChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await fetchChecklistItems();
      setChecklistItems(items.map(item => ({ ...item, confirm: item.confirm || false })));
    } catch (err: any) {
      setError(err?.message || 'Failed to load checklist');
    } finally {
      setIsLoading(false);
    }
  }, [fetchChecklistItems]);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  const updateChecklistItem = useCallback((index: number, updates: Partial<ChecklistItem>) => {
    setChecklistItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  }, []);

  const handleItemPhotoCapture = useCallback(async (index: number) => {
    try {
      const result = await takePhotoForIndex(index);
      if (result) {
        updateChecklistItem(index, { confirm: true });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
      updateChecklistItem(index, { confirm: false });
    }
  }, [takePhotoForIndex, updateChecklistItem]);

  const handleSubmit = useCallback(async () => {
    if (!allPhotosTaken || !allItemsConfirmed) {
      Alert.alert('Incomplete', 'Please complete all items and take all photos');
      return;
    }
    setSubmitLoading(true);
    try {
      await submitChecklist(checklistItems, photos);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit checklist');
    } finally {
      setSubmitLoading(false);
    }
  }, [allPhotosTaken, allItemsConfirmed, checklistItems, photos, submitChecklist]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="mt-4 text-gray-600">Loading checklist...</Text>
      </View>
    );
  }

  if (error || checklistItems.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">{error || 'No checklist items available'}</Text>
        <TouchableOpacity
          className="mt-4 bg-primary rounded-xl py-2 px-4"
          onPress={loadChecklist}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header text={headerText} insets={{ top: 0, bottom: 0, left: 0, right: 0 }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {checklistItems.map((item, index) => (
          <View
            key={`${item._id}-${index}`}
            className="flex-row items-center justify-between bg-white py-4 px-2 rounded-lg border-b border-gray-100"
          >
            <Text className="text-base text-gray-900 w-6/12">{item.label}</Text>
            <TouchableOpacity
              testID={`photo-button-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Take photo for ${item.label}`}
              onPress={() => handleItemPhotoCapture(index)}
              disabled={!!photos[index] || loadingIndex === index}
              style={{ opacity: !!photos[index] ? 0.5 : 1 }}
            >
              {loadingIndex === index ? (
                <ActivityIndicator size="small" color="#ea580c" />
              ) : (
                <View className="justify-center items-center bg-gray-100 w-10 h-10 rounded-full">
                  <CameraIcon width="18" height="18" />
                </View>
              )}
            </TouchableOpacity>
            {!!photos[index] && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Retake photo for ${item.label}`}
                onPress={() => {
                  resetPhotoForIndex(index);
                  updateChecklistItem(index, { confirm: false });
                }}
              >
                {/* Show uploaded image from URL */}
                <Image
                  source={{ uri: photos[index] as string }}
                  style={{ width: 40, height: 40, borderRadius: 8, marginLeft: 8 }}
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {photoErrors.map((err, index) => err && (
          <Text key={`error-${index}`} className="text-red-500 text-xs mt-1">{err}</Text>
        ))}
      </ScrollView>
      <View style={{ padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#f3f4f6' }}>
        <TouchableOpacity
          testID="submit-button"
          className="bg-primary rounded-xl py-4 items-center"
          accessibilityRole="button"
          accessibilityLabel="Submit checklist"
          onPress={handleSubmit}
          disabled={!allPhotosTaken || !allItemsConfirmed || submitLoading}
          style={{ opacity: allPhotosTaken && allItemsConfirmed ? 1 : 0.5 }}
        >
          {submitLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-semibold">Submit Checklist</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 