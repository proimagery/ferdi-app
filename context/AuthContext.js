import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const initializationComplete = useRef(false);

  // Check if user has set up a username
  const checkUsernameSetup = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Error checking username:', error);
        return false;
      }

      // If username is null or empty, user needs to set one up
      return !data?.username;
    } catch (err) {
      console.error('Error in checkUsernameSetup:', err);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted && !initializationComplete.current) {
            console.log('Auth initialization timeout - proceeding without session');
            initializationComplete.current = true;
            setLoading(false);
          }
        }, 5000); // 5 second timeout

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.log('Error getting session:', error);
        }

        if (isMounted && !initializationComplete.current) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            try {
              const needsSetup = await checkUsernameSetup(session.user.id);
              if (isMounted) {
                setNeedsUsername(needsSetup);
              }
            } catch (err) {
              console.log('Error checking username setup:', err);
            }
          }

          initializationComplete.current = true;
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted && !initializationComplete.current) {
          initializationComplete.current = true;
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const needsSetup = await checkUsernameSetup(session.user.id);
            if (isMounted) {
              setNeedsUsername(needsSetup);
            }
          } catch (err) {
            console.log('Error checking username on auth change:', err);
          }
        } else {
          setNeedsUsername(false);
        }

        if (!initializationComplete.current) {
          initializationComplete.current = true;
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Function to mark username as set up
  const completeUsernameSetup = () => {
    setNeedsUsername(false);
  };

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create initial profile for the user
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: '',
              location: '',
              bio: '',
              avatar_type: 'default',
            },
          ]);

        if (profileError) {
          console.log('Profile creation error:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    needsUsername,
    signUp,
    signIn,
    signOut,
    resetPassword,
    completeUsernameSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
