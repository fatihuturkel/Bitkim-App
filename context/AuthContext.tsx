import useUserStore, { defaultUserActivity, defaultUserPreferences } from '@/zustand/userStore';
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { auth, db } from '../firebaseConfig';
import { retrieveCurrentUserData } from '../services/userDataService';

// ----------------------------------
// 1. Context Arayüzü
// ----------------------------------
interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => { throw new Error('signIn not implemented'); },
  signUp: async () => { throw new Error('signUp not implemented'); },
  signOut: async () => { throw new Error('signOut not implemented'); },
  user: null,
  isLoading: true,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}

// ----------------------------------
// 2. Provider Component
// ----------------------------------
export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const clearUserData = useUserStore((state) => state.clearUserData);
  const setUserData = useUserStore((state) => state.setUserData);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log("Auth state changed: User signed in", currentUser.uid);
        try {
          await retrieveCurrentUserData();
        } catch (error) {
          console.error("Error during post-auth data fetch:", error);
          clearUserData();
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("Auth state changed: User signed out");
        clearUserData();
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [clearUserData]);

  // ----------------------------------
  // 3. signIn Fonksiyonu
  // ----------------------------------
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Firebase sign-in error:", error);
      setIsLoading(false);
      clearUserData();
      throw error;
    }
  };

  // ----------------------------------
  // 4. signUp Fonksiyonu (Eksik Olan Kısım)
  // ----------------------------------
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user) throw new Error('Kullanıcı oluşturulamadı');

      const userData = {
        email,
        firstName,
        lastName,
        isEmailVerified: user.emailVerified,
        createdAt: new Date().toISOString(),
        preferences: { ...defaultUserPreferences }, // Use imported default preferences
        activity: { ...defaultUserActivity, lastActive: new Date().toISOString() }, // Use imported default activity, ensure lastActive is current
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData({ ...userData, loggedIn: true });
    } catch (error) {
      console.error('Firebase sign-up error:', error);
      setIsLoading(false);
      clearUserData();
      throw error;
    }
  };

  // ----------------------------------
  // 5. signOut Fonksiyonu
  // ----------------------------------
  const signOut = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Firebase sign-out error:", error);
      setIsLoading(false);
    }
  };

  // ----------------------------------
  // 6. Context Sağlayıcı Dönüşü
  // ----------------------------------
  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        user,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
