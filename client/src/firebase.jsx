import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCi7OVX04VxHKwaEBUv3PuVEmZK76I8Wf0",
  authDomain: "chess-5ccef.firebaseapp.com",
  projectId: "chess-5ccef",
  storageBucket: "chess-5ccef.appspot.com",
  messagingSenderId: "374953741216",
  appId: "1:374953741216:web:192ce6033dc7f72fcdf2c5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();

export const storage = getStorage();

export const db = getFirestore();
