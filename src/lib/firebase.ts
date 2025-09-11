// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-6747337646-626ab",
  "appId": "1:1067862749903:web:cd3f5dc61208080c147dba",
  "storageBucket": "studio-6747337646-626ab.firebasestorage.app",
  "apiKey": "AIzaSyA3sx101IQwkmNSsWTvB4jvmSyB181_xPk",
  "authDomain": "studio-6747337646-626ab.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1067862749903"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
