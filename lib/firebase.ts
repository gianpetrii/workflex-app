// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Import analytics only on client side
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTmsfpofgiskvvi18unr28uYEZB4NoZUo",
  authDomain: "workflex-app-a4f18.firebaseapp.com",
  projectId: "workflex-app-a4f18",
  storageBucket: "workflex-app-a4f18.firebasestorage.app",
  messagingSenderId: "534206500442",
  appId: "1:534206500442:web:56d5f7fec8e195e7305263",
  measurementId: "G-2CLM9XK7Y0"
};

// Initialize Firebase
let firebaseApp;
let analytics;

// Check if Firebase is already initialized
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  // Only initialize analytics on the client side
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(firebaseApp);
  }
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, auth, db, storage }; 