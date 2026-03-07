import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "dummy",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "dummy",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "dummy"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'dummy.apps.googleusercontent.com',
    });
} catch (e) {
    console.log("Native GoogleSignin module not found. Are you running in Expo Go without a custom dev client?");
}

export { app, auth };
