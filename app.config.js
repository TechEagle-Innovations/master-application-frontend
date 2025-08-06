import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "Master App",
  slug: "master-application-frontend",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/logo.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/loading-image.png",
    resizeMode: "cover", // “cover” should make it full screen
    backgroundColor: "#FF6A00"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.dnyaneshwarsuryawanshi.masterapplicationfrontend",
    config: {
      googleMapsApiKey: ""
    }
  },
  android: {
    package: "com.dnyaneshwarsuryawanshi.masterapplicationfrontend",
    adaptiveIcon: {
      foregroundImage: "./assets/images/logo.png",
      backgroundColor: "#ffffff"
    },
    config: {
      googleMaps: {
        apiKey: ""
      },
      cleartextTraffic: true
    },
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "INTERNET" // make sure this is here for network requests
    ]
  },
  web: {
    favicon: "./assets/images/logo.png"
  },
  scheme: "com.dnyaneshwarsuryawanshi.masterapplicationfrontend",
  extra: {
    eas: {
      projectId: "a5570ca0-95eb-4d9a-aa53-4acf0e899032"
    },
    API_URL: process.env.API_URL ?? "http://localhost:6000"
  },
  plugins: [
    [
      "expo-splash-screen",
      {
        image: "./assets/images/loading-image.png",
        resizeMode: "cover",
        backgroundColor: "#FF6A00",
        android: {
          imageWidth: 1080
        },
        ios: {
          imageWidth: 1080
        }
      }
    ],
    "expo-router"
  ]
});
