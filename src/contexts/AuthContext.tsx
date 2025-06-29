import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { TwoFactorVerification } from '../components/TwoFactorVerification';
import * as OTPAuth from 'otpauth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [show2FAVerification, setShow2FAVerification] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<{
    email: string;
    password: string;
    secret: string;
  } | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Clear any pending auth state on sign out
        if (event === 'SIGNED_OUT') {
          setPendingAuth(null);
          setShow2FAVerification(false);
          
          // Clear any cached data
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-auth-token');
          sessionStorage.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      // First, check if user has 2FA enabled
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('two_factor_enabled, two_factor_secret')
        .eq('email', email)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If 2FA is enabled, show verification modal
      if (profile?.two_factor_enabled && profile?.two_factor_secret) {
        setPendingAuth({
          email,
          password,
          secret: profile.two_factor_secret
        });
        setShow2FAVerification(true);
        return { data: null, error: null }; // Don't sign in yet
      }

      // Regular sign in without 2FA
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    if (!pendingAuth) return false;

    try {
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: 'Job Prep Heatmap',
        label: pendingAuth.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: pendingAuth.secret,
      });

      const isValid = totp.validate({ token: code, window: 1 });

      if (isValid === null) {
        return false;
      }

      // If valid, proceed with sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: pendingAuth.email,
        password: pendingAuth.password,
      });

      if (error) {
        throw error;
      }

      // Clear pending auth and close modal
      setPendingAuth(null);
      setShow2FAVerification(false);
      return true;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  };

  const cancel2FA = () => {
    setPendingAuth(null);
    setShow2FAVerification(false);
  };

  const signOut = async () => {
    try {
      // Clear local storage first
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-auth-token');
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        // Even if there's an error, we still want to clear local state
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      setPendingAuth(null);
      setShow2FAVerification(false);
      
    } catch (error) {
      console.error('SignOut error:', error);
      // Force clear local state even if there's an error
      setUser(null);
      setSession(null);
      setPendingAuth(null);
      setShow2FAVerification(false);
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {show2FAVerification && pendingAuth && (
        <TwoFactorVerification
          secret={pendingAuth.secret}
          onVerify={verify2FA}
          onCancel={cancel2FA}
          loading={loading}
        />
      )}
    </AuthContext.Provider>
  );
};