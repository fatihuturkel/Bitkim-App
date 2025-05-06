import useUserStore from '@/zustand/userStore'; // Import the zustand store hook
import { signOut as firebaseSignOut, onAuthStateChanged, signInWithEmailAndPassword, type User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { auth } from '../firebaseConfig';
import { retrieveCurrentUserData } from '../services/userDataService'; // Import the fetch function

// Define the shape of the context value
interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>; // Update signIn signature
  signOut: () => Promise<void>; // Make signOut async
  user: User | null; // Store the Firebase User object
  isLoading: boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  signIn: async (_email, _password) => { throw new Error('signIn function not implemented'); }, // Update default signIn
  signOut: async () => { throw new Error('signOut function not implemented'); },
  user: null,
  isLoading: true, // Start with loading true until auth state is checked
});

// Custom hook to use the session context
export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}

// Provider component
export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading
  const clearUserData = useUserStore((state) => state.clearUserData); // Get clear action from Zustand

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // Make callback async
      setUser(currentUser);
      if (currentUser) {
        // User is signed in, fetch their data using the service
        console.log("Auth state changed: User signed in", currentUser.uid);
        try {
          await retrieveCurrentUserData();
        } catch (error) {
          // Handle potential errors from fetchUserData if it re-throws them
          console.error("Error during post-auth data fetch:", error);
          // Optionally clear user data or show an error message
          clearUserData(); // Clear data if fetch fails after login
        } finally {
          setIsLoading(false); // Set loading false after fetch attempt
        }
      } else {
        // User is signed out
        console.log("Auth state changed: User signed out");
        clearUserData(); // Clear user data from Zustand store on sign out
        setIsLoading(false); // Set loading false after sign out
      }
      // Note: Moved setIsLoading(false) inside the if/else blocks
      // to ensure it runs after async operations complete.
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
    // clearUserData is stable from Zustand, no need to add as dependency usually
  }, [clearUserData]); // Include clearUserData if your linter requires it

  const signIn = async (email: string, password: string) => { // Accept email and password
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user, fetching data, and setting isLoading to false
    } catch (error) {
      console.error("Firebase sign-in error:", error);
      setIsLoading(false); // Ensure loading is false if sign-in fails immediately
      clearUserData(); // Clear any potentially stale data if sign-in fails
      throw error;
    }
  };

  const signOut = async () => {
    setIsLoading(true); // Set loading true when sign-out starts
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user to null, clearing data, and setting isLoading to false
    } catch (error) {
      console.error("Firebase sign-out error:", error);
      setIsLoading(false); // Ensure loading is false if sign-out fails
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
