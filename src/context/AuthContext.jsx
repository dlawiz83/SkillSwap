import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase"; 
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Sign Up Function
  async function signup(email, password, name) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Create the user document in Firestore immediately
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      name: name,
      email: email,
      karma: 5, // Start with 5 Karma points
      skillsTeaching: [],
      skillsLearning: [],
      joined: new Date().toISOString(),
    });
    return result;
  }

  // 2. Login Function
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // 3. Logout
  function logout() {
    return signOut(auth);
  }

  // 4. Listen to User State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch extra profile data (Skills, Karma)
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
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
