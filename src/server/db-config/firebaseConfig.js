// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDafGqt5T6bssaWT7IKPu4EYeXEo1L2eRg",
  authDomain: "jobtracker-16309.firebaseapp.com",
  projectId: "jobtracker-16309",
  storageBucket: "jobtracker-16309.firebasestorage.app",
  messagingSenderId: "646734498813",
  appId: "1:646734498813:web:c49546733dc81184646794"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth(app);