import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

// Key for storing guest state - we explicitly do NOT persist guest state
// Guests should always start fresh when reopening the app
const GUEST_STATE_KEY = '@ferdi_is_guest';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Start with loading false - show UI immediately, auth state updates async
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
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
      // Clear any persisted guest state on app start
      // Guests should ALWAYS start fresh - no data persistence
      try {
        await AsyncStorage.removeItem(GUEST_STATE_KEY);
      } catch (e) {
        // Ignore errors clearing guest state
      }

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
          // Guest state is always false on fresh app start
          setIsGuest(false);
          initializationComplete.current = true;
          setInitializing(false);
        }
      } catch (err) {
        // On any error, just proceed - user can log in manually
        if (isMounted) {
          setIsGuest(false);
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
      // Convert username to a test email format using gmail plus addressing
      // This uses a real-looking email format that Supabase accepts
      const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      const testEmail = `ferditester+${sanitizedUsername}@gmail.com`;

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
            // Skip email confirmation for test accounts
            emailRedirectTo: undefined,
            data: {
              is_test_account: true,
              test_username: username,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Check if email confirmation is required
        if (signUpData.user && !signUpData.session) {
          // Email confirmation is enabled in Supabase
          // We need to inform the user
          return {
            data: null,
            error: {
              message: 'Account created! Please ask the app administrator to disable email confirmation in Supabase, or use the regular Sign Up with a real email.'
            }
          };
        }

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

  // Continue as guest - allows browsing without account
  // Note: Guest state is intentionally NOT persisted
  // When app restarts, guests must choose "Continue as Guest" again
  const continueAsGuest = async () => {
    // Ensure any previous session data is cleared for clean guest experience
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore sign out errors
    }
    setUser(null);
    setSession(null);
    setIsGuest(true);
  };

  // Exit guest mode (when user wants to sign up/in)
  const exitGuestMode = () => {
    setIsGuest(false);
  };

  // Check if action requires authentication
  const requireAuth = () => {
    return !user && isGuest;
  };

  const value = {
    user,
    session,
    loading,
    initializing,
    needsUsername,
    isGuest,
    signUp,
    signIn,
    testSignIn,
    signOut,
    resetPassword,
    completeUsernameSetup,
    continueAsGuest,
    exitGuestMode,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
