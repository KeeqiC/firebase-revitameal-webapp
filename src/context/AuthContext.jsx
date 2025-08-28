// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Impor doc dan setDoc
import { auth, db } from "../firebase"; // Pastikan db diimpor

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mendaftar
  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Simpan data pengguna ke Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: "",
      currentWeight: "",
      targetWeight: "",
      dietGoal: "",
      foodAllergies: "",
    });
    return userCredential;
  };

  // Fungsi untuk login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Fungsi untuk logout
  const logout = () => {
    return signOut(auth);
  };

  // Memeriksa status otentikasi saat aplikasi dimuat
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
