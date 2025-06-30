// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCH7tV3krh9PYyv3A3SNzuUTJfwyQj3MuU",
  authDomain: "skillswap-c7148.firebaseapp.com",
  projectId: "skillswap-c7148",
  storageBucket: "skillswap-c7148.firebasestorage.app",
  messagingSenderId: "819019051927",
  appId: "1:819019051927:web:f5d61b97f8f05d95fa8ad2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };