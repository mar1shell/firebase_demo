// js/firebase-config.js
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBU2LiL3T6g-uHDoB_FglAzCVxTLIRORME",
  authDomain: "fir-demo-d6e73.firebaseapp.com",
  projectId: "fir-demo-d6e73",
  storageBucket: "fir-demo-d6e73.appspot.com",
  messagingSenderId: "482815483220",
  appId: "1:482815483220:web:5529ee40a2afc87daebcc1",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
