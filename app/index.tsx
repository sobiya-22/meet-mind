import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useFonts } from "expo-font";

export default function Index() {
  const [fontsLoaded] = useFonts({
    MeetMindFont: require("../assets/fonts/Nunito-Bold.ttf"), // Replace with your actual path
  });

  if (!fontsLoaded) {
    return <View><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.meetmind}>MeetMind!</Text>
        
        <Image
          source={require("../assets/images/meetmind-logo.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.subtitle}>Your AI-powered meeting assistant</Text>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  welcome: {
    fontSize: 40,
    fontFamily: "MeetMindFont",
    // fontWeight: "bold",
    color: "#023c8a",
    textAlign: "center",
  },
  meetmind: {
    fontSize: 37,
    fontFamily: "MeetMindFont", // Use the custom font
    color: "#023c8a",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#023c8a",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
