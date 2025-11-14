// js/firebase-config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBU2LiL3T6g-uHDoB_FglAzCVxTLIRORME",
  authDomain: "fir-demo-d6e73.firebaseapp.com",
  projectId: "fir-demo-d6e73",
  storageBucket: "fir-demo-d6e73.appspot.com",
  messagingSenderId: "482815483220",
  appId: "1:482815483220:web:5529ee40a2afc87daebcc1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services for use in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
