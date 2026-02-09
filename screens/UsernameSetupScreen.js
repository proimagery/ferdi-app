import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageSelector from '../components/LanguageSelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UsernameSetupScreen({ navigation, onComplete }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimer = useRef(null);

  // Handle username change without causing re-render loops
  const handleUsernameChange = useCallback((text) => {
    // Clean the input: remove spaces and convert to lowercase
    const cleanedText = text.replace(/\s/g, '').toLowerCase();
    setUsername(cleanedText);
  }, []);

  // Debounce username check - separate from input handling
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (username.length < 3) {
      setIsAvailable(null);
      setError('');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setIsAvailable(false);
      setError(t('usernameSetup.invalidFormat'));
      return;
    }

    // Set a new timer for checking availability
    debounceTimer.current = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 600);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [username]);

  const checkUsernameAvailability = async (usernameToCheck) => {
    setIsChecking(true);
    setError('');

    try {
      const { data, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', usernameToCheck)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // No rows returned - username is available
        setIsAvailable(true);
      } else if (data) {
        // Username exists
        setIsAvailable(false);
        setError(t('usernameSetup.alreadyTaken'));
      } else {
        setIsAvailable(true);
      }
    } catch (err) {
      console.error('Error checking username:', err);
      setIsAvailable(true); // Assume available on error
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!username || username.length < 3) {
      setError(t('usernameSetup.tooShort'));
      return;
    }

    if (!isAvailable) {
      setError(t('usernameSetup.unavailable'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(t('common.error'));
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: username.toLowerCase() })
        .eq('id', user.id);

      if (updateError) {
        if (updateError.code === '23505') {
          setError(t('usernameSetup.justTaken'));
          setIsAvailable(false);
        } else {
          throw updateError;
        }
        return;
      }

      // Call the onComplete callback to signal username setup is done
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error saving username:', err);
      setError(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <ActivityIndicator size="small" color={theme.primary} />;
    }
    if (isAvailable === true) {
      return <Ionicons name="checkmark-circle" size={24} color={theme.primary} />;
    }
    if (isAvailable === false) {
      return <Ionicons name="close-circle" size={24} color={theme.error} />;
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Language Selector */}
      <View style={[styles.languageBar, { paddingTop: insets.top + 10 }]}>
        <LanguageSelector />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="at" size={50} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{t('usernameSetup.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('usernameSetup.description')}
            </Text>
          </View>

          {/* Username Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('common.username')}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: isAvailable === false ? theme.error : isAvailable === true ? theme.primary : theme.inputBorder }]}>
              <Text style={[styles.atSymbol, { color: theme.primary }]}>@</Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('usernameSetup.placeholder')}
                placeholderTextColor={theme.textSecondary}
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                maxLength={20}
              />
              <View style={styles.statusIcon}>
                {getStatusIcon()}
              </View>
            </View>

            {/* Requirements */}
            <View style={styles.requirements}>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={username.length >= 3 ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={username.length >= 3 ? theme.primary : theme.textSecondary}
                />
                <Text style={[styles.requirementText, { color: username.length >= 3 ? theme.primary : theme.textSecondary }]}>
                  {t('usernameSetup.requirement1')}
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={username.length <= 20 && username.length > 0 ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={username.length <= 20 && username.length > 0 ? theme.primary : theme.textSecondary}
                />
                <Text style={[styles.requirementText, { color: username.length <= 20 && username.length > 0 ? theme.primary : theme.textSecondary }]}>
                  {t('usernameSetup.requirement2')}
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={/^[a-zA-Z0-9_]*$/.test(username) && username.length > 0 ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={/^[a-zA-Z0-9_]*$/.test(username) && username.length > 0 ? theme.primary : theme.textSecondary}
                />
                <Text style={[styles.requirementText, { color: /^[a-zA-Z0-9_]*$/.test(username) && username.length > 0 ? theme.primary : theme.textSecondary }]}>
                  {t('usernameSetup.requirement3')}
                </Text>
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: theme.error + '20' }]}>
                <Ionicons name="alert-circle" size={20} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            ) : null}

            {/* Availability Message */}
            {isAvailable === true && username.length >= 3 && (
              <View style={[styles.successContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                <Text style={[styles.successText, { color: theme.primary }]}>
                  @{username} {t('usernameSetup.available')}
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isAvailable && username.length >= 3 ? theme.primary : theme.border,
                opacity: isSubmitting ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={!isAvailable || username.length < 3 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <>
                <Ionicons name="checkmark" size={24} color={theme.background} />
                <Text style={[styles.submitButtonText, { color: theme.background }]}>
                  {t('usernameSetup.confirmButton')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoSection}>
            <Ionicons name="information-circle" size={20} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {t('usernameSetup.changeInfo')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 56,
  },
  atSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 18,
    height: '100%',
  },
  statusIcon: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirements: {
    marginTop: 15,
    gap: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
});
