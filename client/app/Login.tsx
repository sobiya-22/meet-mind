import { View, TextInput, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';  // ✅ Use useRouter for navigation
import { FIREBASE_AUTH } from '.././utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const router = useRouter();  // ✅ Initialize router

  const handleSignIn = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      if (response) {
        const userToken = await response.user.getIdToken();
        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
      }
      console.log('User signed in:', response.user);
      alert('Login successful');
      console.log("Navigating to home...");
      router.replace('/(tabs)');  

    } catch (error: any) {
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseError = (error: any) => {
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          alert('Invalid email format');
          break;
        case 'auth/email-already-in-use':
          alert('Email is already in use');
          break;
        case 'auth/weak-password':
          alert('Password should be at least 6 characters');
          break;
        case 'auth/user-not-found':
          alert('No user found with this email');
          break;
        case 'auth/wrong-password':
          alert('Incorrect password');
          break;
        default:
          alert('Error: ' + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('.././assets/images/LoginLogo.png')} style={styles.loginLogo} />
      <Text style={styles.title}>Login Now!!</Text>
      <View style={styles.textInput}>
        <Text>Enter Email: </Text>
        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <Text>Enter Password: </Text>
        <TextInput
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          style={styles.input}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ Use correct navigation path */}
      <Link href="/Signup" style={styles.link}>
        Don't have an account? Create One!
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  loginLogo: {
    width: 150,
    height: 150,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  textInput: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderRadius: 18,
    borderColor: '#bdc3c7',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  button: {
    display: 'flex',
    padding: 13,
    borderRadius: 25,
    width: 150,
    backgroundColor: 'green',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  link: {
    padding: 14,
    color: '#34495e',
  },
});
