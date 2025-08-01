# Google Maps API Key Setup

## Error Description
The error "Exception thrown when executing UIFrameGuarded" with the message "API key not found" occurs because the Google Maps API key is not properly configured in your Expo app.

## Solution

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
4. Go to "Credentials" and create an API key
5. Copy the API key

### 2. Configure in app.json

Replace the placeholder values in `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_ACTUAL_IOS_API_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_ANDROID_API_KEY_HERE"
        }
      }
    }
  }
}
```

### 3. Restart Development Server

After updating the API keys:

```bash
# Stop the current server (Ctrl+C)
# Clear cache
npx expo start --clear

# Or for a clean rebuild
npx expo run:android --clear
npx expo run:ios --clear
```

### 4. API Key Restrictions (Recommended)

For security, restrict your API key:

1. In Google Cloud Console, go to your API key
2. Click "Edit" (pencil icon)
3. Under "Application restrictions":
   - For Android: Add your package name: `com.dnyaneshwarsuryawanshi.masterapplicationfrontend`
   - For iOS: Add your bundle identifier: `com.dnyaneshwarsuryawanshi.masterapplicationfrontend`
4. Under "API restrictions": Select "Restrict key" and choose:
   - Maps SDK for Android
   - Maps SDK for iOS

### 5. Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file in your project root:
```
GOOGLE_MAPS_ANDROID_API_KEY=your_android_api_key_here
GOOGLE_MAPS_IOS_API_KEY=your_ios_api_key_here
```

2. Update `app.json`:
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "${GOOGLE_MAPS_IOS_API_KEY}"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${GOOGLE_MAPS_ANDROID_API_KEY}"
        }
      }
    }
  }
}
```

## Troubleshooting

### If the error persists:

1. **Clear all caches:**
   ```bash
   npx expo start --clear
   ```

2. **Rebuild the app:**
   ```bash
   npx expo run:android --clear
   npx expo run:ios --clear
   ```

3. **Check API key format:**
   - Ensure no extra spaces or characters
   - API key should be ~39 characters long

4. **Verify API is enabled:**
   - Check Google Cloud Console that Maps SDK is enabled
   - Ensure billing is set up (required for Google Maps)

5. **Check package name:**
   - Ensure package name in `app.json` matches your Google Cloud Console restrictions

## Notes

- The app will show a user-friendly error message if the API key is missing
- You can retry loading the map using the "Retry" button
- The error handling is now robust and won't crash the app 