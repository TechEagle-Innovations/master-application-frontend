import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useImageUpload } from './useImageUpload';

export function useMultiPhotoChecklist(count: number) {
  const [photos, setPhotos] = useState<(string | null)[]>(Array(count).fill(null));
  const [errors, setErrors] = useState<(string | null)[]>(Array(count).fill(null));
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const { uploadImage } = useImageUpload();

  // Sync photos and errors arrays with count
  useEffect(() => {
    setPhotos(prev => {
      if (prev.length === count) return prev;
      if (prev.length < count) return [...prev, ...Array(count - prev.length).fill(null)];
      return prev.slice(0, count);
    });
    setErrors(prev => {
      if (prev.length === count) return prev;
      if (prev.length < count) return [...prev, ...Array(count - prev.length).fill(null)];
      return prev.slice(0, count);
    });
  }, [count]);

  // Helper to extract name/type from asset
  const getNameAndType = (asset: any) => {
    let name = asset.fileName || 'photo.jpg';
    let type = asset.type || 'image/jpeg';
    return { name, type };
  };

  // Take photo, upload, and store URL
  const takePhotoForIndex = async (idx: number): Promise<boolean> => {
    setLoadingIndex(idx);
    setErrors(prev => prev.map((e, i) => i === idx ? null : e));
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrors(prev => prev.map((e, i) => i === idx ? 'Camera permission denied' : e));
        return false;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.back,
      });
      console.log("IMAGE RESULT", JSON.stringify(result));
      if (result.canceled) {
        return false;
      }
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const { name, type } = getNameAndType(asset);
        // Upload the image and get the URL
        const url = await uploadImage(asset.uri, name, type);
        if (url) {
          setPhotos(prev => prev.map((p, i) => i === idx ? url : p));
          return true;
        } else {
          setErrors(prev => prev.map((e, i) => i === idx ? 'Failed to upload image' : e));
          return false;
        }
      }
      setErrors(prev => prev.map((e, i) => i === idx ? 'No photo was taken' : e));
      return false;
    } catch (e) {
      setErrors(prev => prev.map((e, i) => i === idx ? 'Failed to take photo' : e));
      return false;
    } finally {
      setLoadingIndex(null);
    }
  };

  const resetPhotoForIndex = (idx: number) => {
    setPhotos(prev => prev.map((p, i) => i === idx ? null : p));
    setErrors(prev => prev.map((e, i) => i === idx ? null : e));
  };

  return { photos, errors, loadingIndex, takePhotoForIndex, resetPhotoForIndex };
}