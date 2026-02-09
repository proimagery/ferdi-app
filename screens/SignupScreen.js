import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemedAlert from '../components/ThemedAlert';
import LanguageSelector from '../components/LanguageSelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Themed alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error', onConfirm: null });

  const showAlert = (title, message, type = 'error', onConfirm = null) => {
    setAlertConfig({ title, message, type, onConfirm });
    setAlertVisible(true);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // Validation
    if (!email.trim()) {
      showAlert(t('common.oops'), t('signup.promptEmail'));
      return;
    }
    if (!validateEmail(email.trim())) {
      showAlert(t('common.oops'), t('signup.invalidEmail'));
      return;
    }
    if (!password) {
      showAlert(t('common.oops'), t('signup.promptPassword'));
      return;
    }
    if (password.length < 6) {
      showAlert(t('common.oops'), t('signup.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      showAlert(t('common.oops'), t('signup.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email.trim().toLowerCase(), password);
    setIsLoading(false);

    if (error) {
      showAlert(t('signup.signUpFailed'), error.message);
    } else {
      showAlert(
        t('signup.successTitle'),
        t('signup.successMessage'),
        'success',
        () => navigation.navigate('Login')
      );
    }
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="globe-outline" size={50} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{t('signup.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('signup.subtitle')}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text
                }]}
                placeholder={t('signup.emailPlaceholder')}
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text
                }]}
                placeholder={t('signup.passwordPlaceholder')}
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text
                }]}
                placeholder={t('signup.confirmPasswordPlaceholder')}
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.passwordHint, { backgroundColor: theme.cardBackground }]}>
              <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.passwordHintText, { color: theme.textSecondary }]}>
                {t('signup.passwordHint')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.signupButton, { backgroundColor: theme.primary }]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.background} />
              ) : (
                <Text style={[styles.signupButtonText, { color: theme.background }]}>
                  {t('signup.createAccountButton')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {t('signup.hasAccountPrompt')}{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginText, { color: theme.primary }]}>{t('signup.signInLink')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Themed Alert */}
      <ThemedAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
        onConfirm={alertConfig.onConfirm}
        theme={theme}
      />
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 45,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  passwordHintText: {
    fontSize: 13,
  },
  signupButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  loginText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
