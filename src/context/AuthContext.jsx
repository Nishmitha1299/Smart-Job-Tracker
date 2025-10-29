// React and Firebase imports
import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../server/db-config/firebaseConfig";

// Create a context to share authentication state across the app
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Local state to hold the authenticated user and loading status
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // Update user state
      setAuthLoading(false); // Mark auth as resolved
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    // Provide user and loading state to all child components
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};