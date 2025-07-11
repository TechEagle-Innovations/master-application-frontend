// import { useState } from 'react';
// import * as FileSystem from 'expo-file-system';
// import { USER_TOKEN } from '@/utils/api/config';

// export function useImageUpload() {
//     const [url, setUrl] = useState<string | null>(null);
//     const [uploading, setUploading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const uploadImage = async (uri: string, name: string, type: string): Promise<string | null> => {
//         setUploading(true);
//         setError(null);
//         setUrl(null);
//         try {
//             // Check if the file exists and is accessible
//             const fileInfo = await FileSystem.getInfoAsync(uri);
//             if (!fileInfo.exists) {
//                 throw new Error('File does not exist');
//             }

//             // Create FormData
//             console.log("uri: string, name: string, type: string", uri, name, type);
//             const formData = new FormData();
//             formData.append('file', {
//                 uri,
//                 name: name || 'upload.jpg',
//                 type: type || 'image/jpeg',
//             } as any);
//          console.log("FORM DATA", JSON.stringify(formData));

//             // Use fetch instead of axios for file upload in React Native/Expo
//             const response = await fetch("https://cdn.techeagle.in/images/new-add", {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': USER_TOKEN,
//                     // Do NOT set 'Content-Type' here! Let fetch set it automatically.
//                 },
//                 body: formData,
//             });

//             const data = await response.json();
//             console.log("UPDAED RESPONSE", data);
//             if (data.status === 'success' && data.data?.image_link) {
//                 setUrl(data.data.image_link);
//                 return data.data.image_link;
//             } else {
//                 throw new Error(data.message || 'Upload failed');
//             }
//         } catch (err: any) {
//             console.log("ERROR IN UPLOADING THE IMAGE", JSON.stringify(err));
//             let errorMessage = 'Upload failed';
//             if (err.response) {
//                 errorMessage = err.response.data?.message ||
//                     err.response.data?.error ||
//                     'Server error';
//             } else if (err.message) {
//                 errorMessage = err.message;
//             } else if (err.code === 'ERR_NETWORK') {
//                 errorMessage = 'Network error - please check your connection';
//             }
//             setError(errorMessage);
//             return null;
//         } finally {
//             setUploading(false);
//         }
//     };

//     const reset = () => {
//         setUrl(null);
//         setError(null);
//         setUploading(false);
//     };

//     return { url, uploading, error, uploadImage, reset };
// }
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { UPLOAD_URL, USER_TOKEN } from '@/utils/api/config';

export function useImageUpload() {
    const [url, setUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (uri: string, name: string, type: string): Promise<string | null> => {
        setUploading(true);
        setError(null);
        setUrl(null);
        try {
            // Check if the file exists and is accessible
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            // Fix the type if it's not a valid MIME type
            let mimeType = type;
            if (!mimeType || !mimeType.startsWith('image/')) {
                // Try to guess from extension
                if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mimeType = 'image/jpeg';
                else if (name.endsWith('.png')) mimeType = 'image/png';
                else mimeType = 'image/jpeg'; // fallback
            }
            console.log("FORM DATA",mimeType);
            // Create FormData
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: name || 'upload.jpg',
                type: mimeType,
            } as any);
            console.log("FORM DATA", JSON.stringify(formData));
            // Use fetch for file upload in React Native/Expo
            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                headers: {
                    'Authorization': USER_TOKEN,
                    // Do NOT set 'Content-Type' here! Let fetch set it automatically.
                },
                body: formData,
            });

            const data = await response.json();
            console.log("IMAGE UPLOAD DATA", data);
            if (data.status === 'success' && data.data?.image_link) {
                setUrl(data.data.image_link);
                return data.data.image_link;
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err: any) {
            console.log("ERROR IN UPLOADING THE IMAGE", JSON.stringify(err));
            let errorMessage = 'Upload failed';
            if (err.response) {
                errorMessage = err.response.data?.message ||
                    err.response.data?.error ||
                    'Server error';
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Network error - please check your connection';
            }
            setError(errorMessage);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setUrl(null);
        setError(null);
        setUploading(false);
    };

    return { url, uploading, error, uploadImage, reset };
}