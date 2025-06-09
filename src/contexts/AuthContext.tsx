
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase/clientApp'; // Ensure this path is correct

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<UserCredentialWrapper>;
  login: (email: string, password: string) => Promise<UserCredentialWrapper>;
  logout: () => Promise<void>;
  // We can add more specific user profile data here later if needed
}

// A wrapper to avoid directly exposing Firebase's UserCredential if not needed everywhere
interface UserCredentialWrapper {
  user: User | null;
  error?: { code?: string; message: string };
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const signup = async (email: string, password: string): Promise<UserCredentialWrapper> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      // You might want to create a user document in Firestore here
      return { user: userCredential.user };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { user: null, error: { code: error.code, message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<UserCredentialWrapper> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return { user: userCredential.user };
    } catch (error: any) {
      console.error("Login error:", error);
      return { user: null, error: { code: error.code, message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(firebaseAuth);
    } catch (error: any) {
      console.error("Logout error:", error);
      // Depending on your app's needs, you might want to throw the error
      // or handle it by returning an error object.
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
