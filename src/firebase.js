import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJ66YlSs27QwdXva8sbMXeiW6i4Pio4JQ",
  authDomain: "sharebite-a0d74.firebaseapp.com",
  projectId: "sharebite-a0d74",
  storageBucket: "sharebite-a0d74.firebasestorage.app",
  messagingSenderId: "485699183707",
  appId: "1:485699183707:web:23d03d2a68d36c62584b7e",
  measurementId: "G-LZQSVL9S7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
