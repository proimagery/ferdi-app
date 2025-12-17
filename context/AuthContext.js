import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Start with loading false - show UI immediately, auth state updates async
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const initializationComplete = useRef(false);

  // Check if user has set up a username (non-blocking)
  const checkUsernameSetup = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (error) {
        return false;
      }

      return !data?.username;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // Immediately try to get session - this should be fast from cache
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (isMounted) {
          if (session?.user) {
            setSession(session);
            setUser(session.user);
            // Check username in background - don't block UI
            checkUsernameSetup(session.user.id).then(needsSetup => {
              if (isMounted) {
                setNeedsUsername(needsSetup);
              }
            });
          }
          initializationComplete.current = true;
          setInitializing(false);
        }
      } catch (err) {
        // On any error, just proceed - user can log in manually
        if (isMounted) {
          initializationComplete.current = true;
          setInitializing(false);
        }
      }
    };

    // Start auth check immediately
    initializeAuth();

    // Also set a very short fallback - if nothing happens in 1.5s, proceed anyway
    const fallbackTimeout = setTimeout(() => {
      if (isMounted && !initializationComplete.current) {
        initializationComplete.current = true;
        setInitializing(false);
      }
    }, 1500);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check username in background
          checkUsernameSetup(session.user.id).then(needsSetup => {
            if (isMounted) {
              setNeedsUsername(needsSetup);
            }
          });
        } else {
          setNeedsUsername(false);
        }

        // Mark initialization complete on first auth event
        if (!initializationComplete.current) {
          initializationComplete.current = true;
          setInitializing(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
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

  // Test login - creates or signs in with a test account using username
  const testSignIn = async (username, password) => {
    try {
      setLoading(true);
      // Convert username to a test email format
      const testEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@ferdi-test.app`;

      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password,
      });

      if (!signInError) {
        return { data: signInData, error: null };
      }

      // If sign in failed (user doesn't exist), create the account
      if (signInError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password,
          options: {
            data: {
              is_test_account: true,
              test_username: username,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Create initial profile for the test user
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: signUpData.user.id,
                email: testEmail,
                username: username,
                name: username,
                location: '',
                bio: 'Test account',
                avatar_type: 'default',
              },
            ]);

          if (profileError) {
            console.log('Profile creation error:', profileError);
          }
        }

        return { data: signUpData, error: null };
      }

      throw signInError;
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
    initializing,
    needsUsername,
    signUp,
    signIn,
    testSignIn,
    signOut,
    resetPassword,
    completeUsernameSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
