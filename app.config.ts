import 'dotenv/config';

console.log("Loaded IP_ADDRESS:", process.env.IP_ADDRESS);
console.log("Loaded PORT:", process.env.PORT);

export default {
  expo: {
    name: "meetmind",
    slug: "meetmind",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/meetmind-logo.jpg",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
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
      IP_ADDRESS: process.env.IP_ADDRESS,
      PORT: process.env.PORT
    }
  }
};
