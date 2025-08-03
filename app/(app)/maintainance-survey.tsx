import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useImageUpload } from '@/hooks/useImageUpload';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import * as FileSystem from 'expo-file-system';
import { maintainanceService } from '@/utils/api/services/MaintainanceService';

type DefectClassName = 'crack' | 'dent' | 'paint-off' | 'scratch' | 'missing-head';

interface SurveyItem {
  id: string;
  bodyPart: string;
  defectClassName: DefectClassName;
  imageUrl: string | null;
}

const bodyParts = ["attached_part", "body_fuselage", "left_wing", "right_wing", "propeller", "tail", "VTOL_arm"];
const defectClasses: DefectClassName[] = ['crack', 'dent', 'paint-off', 'scratch', 'missing-head'];

const MaintenanceSurvey: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { uploadImage } = useImageUpload();
  const params = useLocalSearchParams();

  const [surveyItems, setSurveyItems] = useState<SurveyItem[]>([
    {
      id: Date.now().toString(),
      bodyPart: '',
      defectClassName: 'scratch',
      imageUrl: null,
    },
  ]);

  const addNewItem = () => {
    if (surveyItems.length >= bodyParts.length) {
      Alert.alert('Limit reached', `You can only add up to ${bodyParts.length} items (one per body part)`);
      return;
    }

    setSurveyItems([
      ...surveyItems,
      {
        id: Date.now().toString(),
        bodyPart: '',
        defectClassName: 'scratch',
        imageUrl: null,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (surveyItems.length > 1) {
      setSurveyItems(surveyItems.filter(item => item.id !== id));
    } else {
      Alert.alert("Cannot remove", "At least one item must be present");
    }
  };

  const updateItem = (id: string, field: keyof SurveyItem, value: any) => {
    setSurveyItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const pickImage = async (id: string) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.back,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      if (!fileInfo.exists) {
        Alert.alert('Error', 'The selected image file does not exist.');
        return;
      }

      const fileName = `drone_${params.id}_${Date.now()}.jpg`;
      const imageUrl = await uploadImage(asset.uri, fileName, 'image/jpeg');

      if (!imageUrl) {
        Alert.alert('Upload Failed', 'Could not upload the image.');
        return;
      }

      updateItem(id, 'imageUrl', imageUrl);
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick or upload image.');
    }
  };

  const handleSubmit = async() => {
    // Validate all fields are filled
    const incompleteItem = surveyItems.find(item =>
      !item.bodyPart || !item.defectClassName || !item.imageUrl
    );

    if (incompleteItem) {
      Alert.alert('Incomplete Form', 'Please fill all fields for all items.');
      return;
    }

    // Validate no duplicate body parts
    const bodyPartsSet = new Set(surveyItems.map(item => item.bodyPart));
    if (bodyPartsSet.size !== surveyItems.length) {
      Alert.alert('Duplicate Body Parts', 'Each body part can only be selected once.');
      return;
    }

    // Prepare data for submission
    const imageParts: Record<string, { url: string; defectClassName: DefectClassName }> = {};
    surveyItems.forEach(item => {
      if (item.bodyPart && item.imageUrl) {
        imageParts[item.bodyPart] = {
          url: item.imageUrl,
          defectClassName: item.defectClassName,
        };
      }
    });

    const submissionData = {
      droneId: params.id as string,
      imageParts,
    };
     const data:any= await maintainanceService.droneMaintenanceSurvey(submissionData);
    console.log('Submitting:', data);
    Alert.alert('Success', 'Maintenance survey submitted successfully!');
    router.back();
    // Here you would typically call your API to submit the data
  };

  const availableBodyParts = bodyParts.filter(
    part => !surveyItems.some(item => item.bodyPart === part)
  );

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 10,
        paddingBottom: insets.bottom + 40,
      }}
      keyboardShouldPersistTaps="handled"
      className="bg-white"
    >
      <Header text="Maintenance Survey" insets={insets} />
      <Text className="text-xl text-gray-600 mb-6 pl-3 mt-3">
        Please document each damaged body part
      </Text>

      {surveyItems.map((item, index) => (
        <View
          key={item.id}
          className="bg-white rounded-xl p-4 mb-5 shadow-md shadow-black/10 border border-gray-200"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Item {index + 1}
            </Text>
            {surveyItems.length > 1 && (
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                className="p-1"
              >
                <MaterialIcons name="delete" size={24} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Body Part
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={item.bodyPart}
                onValueChange={value => updateItem(item.id, 'bodyPart', value)}
              >
                <Picker.Item label="Select Body Part" value="" />
                {availableBodyParts.concat(item.bodyPart).filter(Boolean).map(part => (
                  <Picker.Item
                    key={part}
                    label={part.replace(/_/g, ' ')}
                    value={part}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Defect Type
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={item.defectClassName}
                onValueChange={value => updateItem(item.id, 'defectClassName', value)}
              >
                {defectClasses.map(defect => (
                  <Picker.Item
                    key={defect}
                    label={defect.replace(/-/g, ' ')}
                    value={defect}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Upload Image
            </Text>
            <TouchableOpacity
              className="h-36 border border-gray-300 rounded-lg justify-center items-center overflow-hidden"
              onPress={() => pickImage(item.id)}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center justify-center">
                  <MaterialIcons name="add-a-photo" size={32} color="#555" />
                  <Text className="mt-2 text-gray-500">
                    Click to take photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {surveyItems.length < bodyParts.length && (
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-lg mb-5 mt-6 py-3 border border-gray-100 bg-orange-50"
          onPress={addNewItem}
        >
          <Text className="text-primary text-2xl font-medium">+</Text>
          <Text className="text-primary text-lg font-medium ml-2">
            Add Another Body Part
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className="bg-primary py-4 rounded-lg items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white text-lg font-bold">Submit Survey</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MaintenanceSurvey;