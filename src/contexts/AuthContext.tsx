
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth, firestore } from '@/lib/firebase/clientApp'; // Ensure this path is correct
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '@/types'; // Import UserProfile

// A wrapper to avoid directly exposing Firebase's UserCredential if not needed everywhere
interface UserCredentialWrapper {
  user: FirebaseUser | null;
  error?: { code?: string; message: string };
}

interface AuthContextType {
  currentUser: FirebaseUser | null; // Firebase Auth user
  userProfile: UserProfile | null; // User profile from Firestore
  loading: boolean;
  // signup is now an admin task, so we remove it from client-facing auth context.
  // The /signup page handles email request.
  login: (email: string, password: string) => Promise<UserCredentialWrapper>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        // Fetch user profile from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // User exists in Auth, but no profile in Firestore (admin needs to create it)
            // Or this could be a new user who just signed up via admin process
            // For now, this means they are effectively not fully onboarded/approved
            console.warn(`No Firestore profile found for user ${user.uid}. Awaiting admin setup.`);
            setUserProfile(null); // Or a default unapproved profile if that's the logic
          }
        } catch (error) {
            console.error("Error fetching user profile from Firestore:", error);
            setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  // Signup via email/password is now an admin function.
  // Client side /signup page sends an email request.

  const login = async (email: string, password: string): Promise<UserCredentialWrapper> => {
    // setLoading(true) is handled by onAuthStateChanged listener's setLoading
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      // user profile fetching will happen in onAuthStateChanged
      return { user: userCredential.user };
    } catch (error: any) {
      console.error("Login error:", error);
      // setLoading(false) // Not needed here as onAuthStateChanged handles final loading state
      return { user: null, error: { code: error.code, message: error.message } };
    }
  };

  const logout = async (): Promise<void> => {
    // setLoading(true); // Handled by onAuthStateChanged
    try {
      await signOut(firebaseAuth);
      // currentUser and userProfile will be set to null by onAuthStateChanged
    } catch (error: any) {
      console.error("Logout error:", error);
    } finally {
      // setLoading(false); // Handled by onAuthStateChanged
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
