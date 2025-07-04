import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMultiPhotoChecklist } from '../../hooks/useMultiPhotoChecklist';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import Header from '@/components/Header';
import { useAuth } from '@/utils/auth/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ApiError, ChecklistItem, ERROR_MESSAGES } from './preflight-checklist';
import { flightService } from '@/utils/api/services/FlightService';


const POST_FLIGHT_CHECKLIST_ITEMS = [
  'Battery Removed',
  'Propellers Checked',
  'Camera Lens Cleaned',
  'Landing Gear Inspected',
  'Firmware Updated',
  'Flight Log Saved',
  'Body Cleaned',
  'Storage Secured',
];

// type ChecklistItem = string;

export default function PostFlightChecklist() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const { clearskyToken } = useAuth();

  const {
    photos,
    errors,
    loadingIndex,
    takePhotoForIndex,
    resetPhotoForIndex,
  } = useMultiPhotoChecklist(checklistItems.length);

  const allDone = photos.every((uri: string | null) => !!uri);
  const allPhotosTaken = photos.every((uri: string | null) => !!uri);
  const allItemsConfirmed = checklistItems.every(item => item.confirm);
  const handleError = useCallback((error: ApiError | any, context: string) => {
    console.error(`Error in ${context}:`, error);

    let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;

    if (error.message?.includes('Network Error')) {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.response?.status === 401) {
      errorMessage = ERROR_MESSAGES.AUTH_ERROR;
    } else if (error.response?.status >= 500) {
      errorMessage = ERROR_MESSAGES.SERVER_ERROR;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    Alert.alert('Error', errorMessage);
    return errorMessage;
  }, []);
  const fetchChecklistItems = useCallback(async () => {
    if (!clearskyToken) {
      handleError({ message: 'No authentication token' }, 'fetchChecklistItems');
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await flightService.getPostFlight({
        headers: { "x-auth-clearsky": clearskyToken }
      });

      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error(ERROR_MESSAGES.DATA_ERROR);
      }
      // Validate each checklist item structure
      const validItems = response.data.filter((item: any) => item && item._id && item.label);
      if (validItems.length !== response.data.length) {
        throw new Error('Invalid checklist item(s) received from server.');
      }
      setChecklistItems(validItems.map((item: ChecklistItem) => ({
        ...item,
        confirm: item.confirm || false,
      })));
    } catch (error) {
      handleError(error, 'fetchChecklistItems');
    } finally {
      setIsLoading(false);
    }
  }, [clearskyToken, handleError]);

  useEffect(() => {
    fetchChecklistItems();
  }, [fetchChecklistItems]);

  // const handleDone = () => {
  //   if (!allDone) {
  //     Alert.alert('Incomplete', 'Please capture all required photos before proceeding.');
  //     return;
  //   }
  //   router.replace('/(app)/dashboard');
  // };
  const updateChecklistItem = useCallback((index: number, updates: Partial<ChecklistItem>) => {
    setChecklistItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  }, []);

  const handleItemPhotoCapture = useCallback(async (index: number) => {
    try {
      // First request permission and verify
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        if (permission.canAskAgain === false) {
          Alert.alert(
            'Permission required',
            'Camera access is permanently denied. Please enable it in your device settings.'
          );
        } else {
          Alert.alert('Permission required', 'Camera access is needed to take photos');
        }
        return;
      }

      // Then take the photo
      const result = await takePhotoForIndex(index);

      // Only confirm if photo was successfully taken
      if (result) {
        updateChecklistItem(index, { confirm: true });
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
      updateChecklistItem(index, { confirm: false });
    }
  }, [takePhotoForIndex, updateChecklistItem]);

  const submitChecklist = useCallback(async () => {
    try {
      if (!allPhotosTaken || !allItemsConfirmed) {
        Alert.alert('Incomplete', 'Please complete all items and take all photos');
        return;
      }
      setSubmitLoading(true);
      // Prepare data with proper types
      let updates = checklistItems.map((item, idx) => ({
       ...item,
        // image: photos[item.serial_no - 1] // Assuming serial_no matches photo index
        image: "dfhgaejhgajdfghdjfghdjkfghdfj"// Use actual photo URI or null
      }));
      // Defensive: ensure updates is an array of objects with required fields
      updates={...updates};
      console.log("POST FLIGHT UPDATES", updates)
      console.log("UPDATES", updates);
      // return;

      const response: any = await flightService.completePostFlight(
        { "updates": updates },
        { headers: { "x-auth-clearsky": clearskyToken } }
      );

      console.log("POSTFLIGHT CHECKLIST RESPONSE", response);
      router.replace({
        pathname: '/(app)/dashboard',
        params: {
          message: 'Checklist submitted successfully',
          type: "success"
        }
      });
    } catch (error: any) {
      console.log("POSTFLIGHT CHECKLIST ERROR", error);
      if (error.message && error.message.includes('already completed')) {
        router.replace({
          pathname: '/(app)/dashboard',
          params: {
            message: 'Checklist Already Completed',
            type: "error"
          }
        });
      } else {
        // Always show an alert for any error
        handleError(error, 'submitChecklist');
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [allPhotosTaken, allItemsConfirmed, checklistItems, clearskyToken, photos, router, handleError]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="mt-4 text-gray-600">Loading checklist...</Text>
      </View>
    );
  }
  if (checklistItems.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">No checklist items available</Text>
        <TouchableOpacity
          className="mt-4 bg-primary rounded-xl py-2 px-4"
          onPress={fetchChecklistItems}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
        {/* Fallback UI for persistent errors */}
        <Text className="text-red-500 mt-2 text-center">If this issue persists, please check your network connection or contact support.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
      <Header text="Post-Flight Checklist" insets={insets} />
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
                <Image
                  source={{ uri: photos[index] as string }}
                  style={{ width: 40, height: 40, borderRadius: 8, marginLeft: 8 }}
                />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* {photoErrors.map((err, index) => err && (
          <Text key={`error-${index}`} className="text-red-500 text-xs mt-1">{err}</Text>
        ))} */}
        {errors.map((err: string | null, idx: number) => err && (
          <Text key={idx} className="text-red-500 text-xs mt-1">{err}</Text>
        ))}
      </ScrollView>
      <View style={{ padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#f3f4f6' }}>
        <TouchableOpacity
          testID="submit-button"
          className="bg-primary rounded-xl py-4 items-center"
          accessibilityRole="button"
          accessibilityLabel="Submit checklist"
          onPress={submitChecklist}
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