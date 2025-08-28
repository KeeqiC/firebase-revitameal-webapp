import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvJ0Tpp9uPFhjEAoFdGUoI1uJhBRPoMeo",
  authDomain: "revitameal-82d2e.firebaseapp.com",
  projectId: "revitameal-82d2e",
  storageBucket: "revitameal-82d2e.firebasestorage.app",
  messagingSenderId: "484725551878",
  appId: "1:484725551878:web:eca01077bdc171eef9e487",
  measurementId: "G-GYBJ3MX8FY",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Provider untuk Google Sign-In
const googleProvider = new GoogleAuthProvider();

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  doc,
  getDoc,
  setDoc,
};
