import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Meeting</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          // onPress=
          // {
                  //join-meet/google-meet
                  // () => router.push('/')
              // }
              >
          <Image source={require('../../assets/images/google-meet.png')} style={styles.icon} />
          <Text style={styles.text}>Google Meet</Text>
        </TouchableOpacity>
                {/* //join-meet/zoom */}
        <TouchableOpacity
          // onPress={() => router.push('/')}
        >
          <Image source={require('../../assets/images/zoom.png')} style={styles.icon} />
          <Text style={styles.text}>Zoom</Text>
        </TouchableOpacity>
      </View>
      {/* //add-recording */}
      <Text style = {styles.orWord}>------OR-------</Text>
      <TouchableOpacity style={styles.recordingButton}
        // onPress={() => router.push('/')}
      >
        <Text style={styles.buttonText}>Upload Zoom Recording</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {  justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f7fa' },
  title: { fontSize: 25, fontWeight: 'bold', margin: 20 },
  iconContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '80%' },
  icon: { width: 80, height: 80, marginBottom: 10 },
  text: { textAlign: 'center', fontWeight: '500' },
  recordingButton: { marginTop: 20, padding: 15, borderRadius: 8, backgroundColor: '#007AFF' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  orWord: {
    margin: 20,
    fontSize: 15,
  }
});
