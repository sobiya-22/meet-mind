
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence } from "firebase/auth"
// import { initializeAuth, browserLocalPersistence } from 'firebase/auth';        
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
const firebaseConfig = {
  apiKey: "AIzaSyDMoAOoFz_FaFIdG-w2PQesgqrTiIZmT04",
  authDomain: "meetmind-ec3d2.firebaseapp.com",
  projectId: "meetmind-ec3d2",
  storageBucket: "meetmind-ec3d2.firebasestorage.app",
  messagingSenderId: "970895800274",
  appId: "1:970895800274:web:3e2efbdf6c2e03024d3a0b",
  measurementId: "G-JV2YENLS8Z"
};

// Initialize Firebase
export const FIREBASE_APP = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
