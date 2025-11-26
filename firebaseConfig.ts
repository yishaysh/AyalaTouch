import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBxcuNL_3bwxK_g_tCVJ-C80N1Ty_LrR-M",
  authDomain: "ayalatouchdb.firebaseapp.com",
  databaseURL: "https://ayalatouchdb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ayalatouchdb",
  storageBucket: "ayalatouchdb.firebasestorage.app",
  messagingSenderId: "113017745410",
  appId: "1:113017745410:web:48568aecae3709db40f71b",
  measurementId: "G-PX98HNKW5K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);