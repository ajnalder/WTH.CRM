import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validatePassword } from '@/utils/validation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  sessionTimeoutWarning: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extended session timeout duration (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const WARNING_TIME = 30 * 60 * 1000; // Show warning 30 minutes before timeout

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity - more comprehensive activity tracking
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      setSessionTimeoutWarning(false);
    };

    // More comprehensive list of user activity events
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 
      'click', 'focus', 'blur', 'resize', 'beforeunload'
    ];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Also track page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Session timeout management with longer intervals
  useEffect(() => {
    if (!session) return;

    const checkSessionTimeout = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      // Only log out after 24 hours of inactivity
      if (timeSinceActivity >= SESSION_TIMEOUT) {
        console.log('Session timeout after 24 hours - signing out user');
        signOut();
        return;
      }
      
      // Show warning 30 minutes before timeout (23.5 hours of inactivity)
      if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME) {
        setSessionTimeoutWarning(true);
      }
    };

    // Check every 5 minutes instead of every minute
    const interval = setInterval(checkSessionTimeout, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session, lastActivity]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session) {
          setLastActivity(Date.now());
          setSessionTimeoutWarning(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        setLastActivity(Date.now());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Input validation
      if (!email || !email.trim()) {
        return { error: { message: 'Email is required' } };
      }

      if (!fullName || !fullName.trim()) {
        return { error: { message: 'Full name is required' } };
      }

      if (fullName.length > 100) {
        return { error: { message: 'Full name must be less than 100 characters' } };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { error: { message: passwordValidation.errors.join(', ') } };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
          },
        },
      });
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: { message: 'An unexpected error occurred during sign up' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email || !email.trim()) {
        return { error: { message: 'Email is required' } };
      }

      if (!password) {
        return { error: { message: 'Password is required' } };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (!error) {
        setLastActivity(Date.now());
        setSessionTimeoutWarning(false);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: { message: 'An unexpected error occurred during sign in' } };
    }
  };

  const signOut = async () => {
    try {
      setSessionTimeoutWarning(false);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    sessionTimeoutWarning,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
