import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";

import { hasFirebaseConfig, runtimeConfig } from "@/config/env";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function createFirebaseApp() {
  if (!hasFirebaseConfig) {
    throw new Error(
      "Missing Firebase config. Set the EXPO_PUBLIC_FIREBASE_* variables or the app config extra.firebase values.",
    );
  }

  if (!firebaseApp) {
    firebaseApp =
      getApps().length > 0 ? getApp() : initializeApp(runtimeConfig.firebase);
  }

  return firebaseApp;
}

export function getFirebaseAuth() {
  if (!hasFirebaseConfig) {
    throw new Error(
      "Missing Firebase config. Set the EXPO_PUBLIC_FIREBASE_* variables or the app config extra.firebase values.",
    );
  }

  if (!firebaseAuth) {
    const app = createFirebaseApp();
    try {
      firebaseAuth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      firebaseAuth = getAuth(app);
    }
  }

  return firebaseAuth;
}

export async function getIdToken(forceRefresh = false) {
  const currentUser = getFirebaseAuth().currentUser;
  if (!currentUser) {
    return null;
  }

  return currentUser.getIdToken(forceRefresh);
}

export {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
};
