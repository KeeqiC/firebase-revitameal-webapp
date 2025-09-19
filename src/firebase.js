// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvJ0Tpp9uPFhjEAoFdGUoI1uJhBRPoMeo",
  authDomain: "revitameal-82d2e.firebaseapp.com",
  projectId: "revitameal-82d2e",
  storageBucket: "revitameal-82d2e.firebasestorage.app",
  messagingSenderId: "484725551878",
  appId: "1:484725551878:web:eca01077bdc171eef9e487",
  measurementId: "G-GYBJ3MX8FY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
