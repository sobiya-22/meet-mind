import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Session management
const USER_SESSION_KEY = '@user_session';

export const saveUserSession = async (user: any) => {
  try {
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user session:', error);
  }
};

export const getUserSession = async () => {
  try {
    const userSession = await AsyncStorage.getItem(USER_SESSION_KEY);
    return userSession ? JSON.parse(userSession) : null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
};

export const clearUserSession = async () => {
  try {
    await AsyncStorage.removeItem(USER_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};

// Authentication functions
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update user profile with name
    await updateProfile(userCredential.user, {
      displayName: name,
    });

    await saveUserSession(userCredential.user);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await saveUserSession(userCredential.user);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    await clearUserSession();
  } catch (error) {
    throw error;
  }
};

// Auth state listener
export const setupAuthStateListener = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await saveUserSession(user);
    } else {
      await clearUserSession();
    }
    callback(user);
  });
};

// Firestore saveMeetingAnalysis function
export const saveMeetingAnalysis = async (data: any): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'meeting_analysis'), data);
    return docRef.id;
  } catch (error) {
    console.error('Error saving meeting analysis:', error);
    throw error;
  }
};

export default app;
