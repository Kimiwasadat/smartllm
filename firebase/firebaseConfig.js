// Import core and Firestore SDKs
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


// Firebase configuration (replace with env vars for production)
const firebaseConfig = {
  apiKey: "AIzaSyCNjV8rFOoCZgYynzFPlRU7ZwYoWhFHCms",
  authDomain: "smartllm-c3326.firebaseapp.com",
  projectId: "smartllm-c3326",
  storageBucket: "smartllm-c3326.firebasestorage.app",
  messagingSenderId: "910904829536",
  appId: "1:910904829536:web:0736b2914e12aa4df58505",
  measurementId: "G-BTDGNHXVRW"
};

// Initialize Firebase and Analytics
const app = initializeApp(firebaseConfig);


// ✅ Export Firestore DB
export const db = getFirestore(app);
