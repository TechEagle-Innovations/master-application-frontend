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
import { DroneImagesAI } from '@/utils/api/services/MaintainanceService';
import Header from '@/components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

export type DefectClassName =
  | "crack"
  | "dent"
  | "paint-off"
  | "scratch"
  | "missing-head";

interface ImagePart {
  url: string;
  defectClassName: DefectClassName;
}

interface SurveyItem {
  id: string;
  issueType: string;
  issue: string;
  bodyPartName: string;
  bodyPart: string;
  image: ImagePart | null;
}

const issueTypes = ["Structural", "Cosmetic", "Functional"];
const issues: Record<string, string[]> = {
  "Structural": ["Crack", "Dent", "Missing Part"],
  "Cosmetic": ["Paint Off", "Scratch", "Discoloration"],
  "Functional": ["Loose Part", "Non-functional", "Misaligned"]
};
const bodyParts = ["Head", "Arm", "Leg", "Body", "Tail"];

const MaintenanceSurvey: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [surveyItems, setSurveyItems] = useState<SurveyItem[]>([
    {
      id: Date.now().toString(),
      issueType: "",
      issue: "",
      bodyPartName: "",
      bodyPart: "",
      image: null
    }
  ]);

  const addNewItem = () => {
    setSurveyItems([
      ...surveyItems,
      {
        id: Date.now().toString(),
        issueType: "",
        issue: "",
        bodyPartName: "",
        bodyPart: "",
        image: null
      }
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
    setSurveyItems(
      surveyItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const pickImage = async (id: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const currentItem = surveyItems.find(item => item.id === id);
      const defectClass = currentItem?.issue
        ? getDefectClassFromIssue(currentItem.issue)
        : "scratch";

      updateItem(id, 'image', {
        url: result.assets[0].uri,
        defectClassName: defectClass
      });
    }
  };

  const getDefectClassFromIssue = (issue: string): DefectClassName => {
    const issueMap: Record<string, DefectClassName> = {
      "Crack": "crack",
      "Dent": "dent",
      "Paint Off": "paint-off",
      "Scratch": "scratch",
      "Missing Part": "missing-head",
      "Discoloration": "paint-off",
      "Loose Part": "missing-head",
      "Non-functional": "missing-head",
      "Misaligned": "missing-head"
    };

    return issueMap[issue] || "scratch";
  };

  const handleSubmit = () => {
    const isValid = surveyItems.every(item =>
      item.issueType && item.issue && item.bodyPart && item.image
    );

    if (!isValid) {
      Alert.alert("Validation Error", "Please fill all fields for all items");
      return;
    }

    const droneImagesAI: DroneImagesAI = {
      droneId: "DRONE123",
      imageParts: surveyItems.reduce((acc, item) => {
        if (item.image) {
          acc[item.bodyPart] = {
            url: item.image.url,
            defectClassName: getDefectClassFromIssue(item.issue) || "scratch"
          };
        }
        return acc;
      }, {} as Record<string, ImagePart>),
      createdAt: new Date().toISOString()
    };

    console.log("Submitting:", droneImagesAI);
    Alert.alert("Success", "Survey submitted successfully");
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: insets.bottom + 40 }}
      keyboardShouldPersistTaps="handled"
      className="bg-white"
    >
      <Header text="Maintenance Survey" insets={insets} />
      <Text className="text-xl text-gray-600 mb-6 pl-3 mt-3">
        Please fill in the details below
      </Text>

      {surveyItems.map((item, index) => (
        <View key={item.id} className="bg-white rounded-xl p-4 mb-5 shadow-md shadow-black/10 border border-gray-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Item {index + 1}
            </Text>
            {surveyItems.length > 1 && (
              <TouchableOpacity onPress={() => removeItem(item.id)} className="p-1">
                <MaterialIcons name="delete" size={24} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Select Issue Type
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={item.issueType}
                onValueChange={(value) => {
                  updateItem(item.id, 'issueType', value);
                  updateItem(item.id, 'issue', "");
                }}
              >
                <Picker.Item label="Select Issue Type" value="" />
                {issueTypes.map(type => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {item.issueType && (
            <View className="mb-5">
              <Text className="text-base font-medium text-gray-700 mb-2">
                Select an Issue
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {issues[item.issueType]?.map(issue => (
                  <TouchableOpacity
                    key={issue}
                    className={`py-2 px-3 rounded-lg ${item.issue === issue ? 'bg-blue-500' : 'bg-gray-100'}`}
                    onPress={() => updateItem(item.id, 'issue', issue)}
                  >
                    <Text className={`text-sm ${item.issue === issue ? 'text-white' : 'text-gray-800'}`}>
                      {issue}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Body Part Name
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={item.bodyPart}
                onValueChange={(value) => updateItem(item.id, 'bodyPart', value)}
              >
                <Picker.Item label="Select Body Part" value="" />
                {bodyParts.map(part => (
                  <Picker.Item key={part} label={part} value={part} />
                ))}
              </Picker>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Add Image
            </Text>
            <TouchableOpacity
              className="h-36 border border-gray-300 rounded-lg justify-center items-center overflow-hidden"
              onPress={() => pickImage(item.id)}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center justify-center">
                  <MaterialIcons name="add-a-photo" size={32} color="#555" />
                  <Text className="mt-2 text-gray-500">
                    Click to upload image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        className="flex-row items-center justify-center rounded-lg mb-5 mt-6 py-3 border border-gray-100 bg-orange-50"
        onPress={addNewItem}
      >
        <Text className='text-primary text-2xl font-medium'>+</Text>
        <Text className="text-primary text-lg font-medium ml-2">
          Add Another Item
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-primary py-4 rounded-lg items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white text-lg font-bold">
          Submit Survey
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MaintenanceSurvey;