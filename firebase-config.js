// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8rqugGN164U8xaG0h6eoryKETBLxampk",
  authDomain: "bhookmukt.firebaseapp.com",
  projectId: "bhookmukt",
  storageBucket: "bhookmukt.firebasestorage.app",
  messagingSenderId: "772635537013",
  appId: "1:772635537013:web:26143adc17c5e49dfe123c",
  measurementId: "G-YNEQ07JSRG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db }; 