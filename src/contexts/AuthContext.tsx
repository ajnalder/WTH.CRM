
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser, useSignIn, useClerk } from '@clerk/clerk-react';

interface AuthContextType {
  user: { id: string; email: string | null; fullName?: string | null } | null;
  session: { id: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  sessionTimeoutWarning: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: authLoaded, userId, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const clerk = useClerk();

  const [user, setUser] = useState<{ id: string; email: string | null; fullName?: string | null } | null>(null);
  const [session, setSession] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);

  useEffect(() => {
    if (!authLoaded) return;
    if (userId && clerkUser) {
      setUser({
        id: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
        fullName: clerkUser.fullName,
      });
      setSession({ id: userId });
    } else {
      setUser(null);
      setSession(null);
    }
    setLoading(!authLoaded);
  }, [authLoaded, userId, clerkUser]);

  const handleSignIn = async (email: string, password: string) => {
    if (!signInLoaded || !signIn) {
      return { error: { message: 'Auth not ready' } };
    }
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        setSessionTimeoutWarning(false);
        return { error: null };
      }
      return { error: { message: 'Additional steps required to complete sign in' } };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: { message: error?.errors?.[0]?.message || 'Sign in failed' } };
    }
  };

  const signOut = async () => {
    try {
      await clerk.signOut();
      setSessionTimeoutWarning(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn: handleSignIn,
    signOut,
    sessionTimeoutWarning,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
