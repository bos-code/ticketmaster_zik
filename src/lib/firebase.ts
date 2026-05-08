import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDfqMToQD8CzckDlKfP2b2K-kSL4ZBBWZ4",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "privy-cbt.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "privy-cbt",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "privy-cbt.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "124654259531",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    "1:124654259531:web:84e5dc58cdc92ddb07acce",
};

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firestore = (() => {
  try {
    return initializeFirestore(firebaseApp, {
      ignoreUndefinedProperties: true,
    });
  } catch {
    return getFirestore(firebaseApp);
  }
})();

export const storage = getStorage(firebaseApp);

export { firebaseConfig };
