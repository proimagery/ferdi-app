import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to guard actions that require authentication
 * Returns a function to check auth and a modal state controller
 *
 * Usage:
 * const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();
 *
 * const handleSave = () => {
 *   if (checkAuth('save your trip')) return;
 *   // proceed with save
 * };
 */
export const useAuthGuard = () => {
  const { user, isGuest } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('use this feature');

  const checkAuth = useCallback((action = 'use this feature') => {
    if (!user && isGuest) {
      setFeatureMessage(action);
      setShowAuthModal(true);
      return true; // blocked - user needs to sign in
    }
    return false; // allowed - user is authenticated
  }, [user, isGuest]);

  return {
    checkAuth,
    showAuthModal,
    setShowAuthModal,
    featureMessage,
    isGuest: !user && isGuest,
  };
};

export default useAuthGuard;
