import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD7lPgVO4NgVi6mmV_GG5AzMxbCDXJsW5U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "greenlens-500117.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "greenlens-500117",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "greenlens-500117.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "345160555700",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:345160555700:web:c7e89122f6e0735ab3cbe1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
