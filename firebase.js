// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwISKbSTi0ioSnTJGgwEg6_2yUhZvhZ-E",
  authDomain: "smartllm.firebaseapp.com",
  projectId: "smartllm",
  storageBucket: "smartllm.firebasestorage.app",
  messagingSenderId: "114084994041",
  appId: "1:114084994041:web:917f6f97fc86f5fbfffb28",
  measurementId: "G-Z2N5QGQNZ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);