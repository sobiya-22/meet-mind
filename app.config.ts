import 'dotenv/config';
console.log("Loaded BACKEND_URL:", process.env.BACKEND_URL);

export default {
  expo: {
    name: "meetmind",
    slug: "meetmind",
    version: "1.0.0",
    owner: "sobiyashaikh",
    orientation: "portrait",
    icon: "./assets/images/meetmind-logo.jpg",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.sobiyashaikh.meetmind",
      supportsTablet: true
    },
    android: {
      package: "com.sobiyashaikh.meetmind",
      enableJetifier: true,
      adaptiveIcon: {
        foregroundImage: "./assets/images/meetmind-logo.jpg",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/meetmind-logo.jpg"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/meetmind-logo.jpg",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },

    extra: {
      eas: {
        projectId: "949a95df-ef79-47c3-bb95-d7a92ef3599d" // <- Paste your EAS projectId here
      },
      BACKEND_URL: process.env.BACKEND_URL,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
    }
  }
};
