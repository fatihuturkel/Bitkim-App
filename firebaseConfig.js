import { initializeApp } from "firebase/app";
// Import web persistence types and Platform
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native'; // Import Platform

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc6537eZ5xGA3alrTaAfld4DOpuxMAdJs",
  authDomain: "bitkim-app.firebaseapp.com",
  projectId: "bitkim-app",
  storageBucket: "bitkim-app.firebasestorage.app",
  messagingSenderId: "2859171769",
  appId: "1:2859171769:web:83781614cb6bfc32c78068",
  measurementId: "G-0EMPVJ4ZS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Conditionally select persistence based on platform
const persistence = Platform.OS === 'web'
  ? browserLocalPersistence // Use browser persistence for web
  : getReactNativePersistence(ReactNativeAsyncStorage); // Use RN persistence for native

export const auth = initializeAuth(app, {
  persistence: persistence, // Use the selected persistence
});

export const db = getFirestore(app);

export default app