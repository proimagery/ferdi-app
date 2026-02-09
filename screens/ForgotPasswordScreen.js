import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const { theme } = useTheme();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t('forgotPassword.errorTitle'), t('forgotPassword.promptEmail'));
      return;
    }
    if (!validateEmail(email.trim())) {
      Alert.alert(t('forgotPassword.errorTitle'), t('forgotPassword.invalidEmail'));
      return;
    }

    setIsLoading(true);
    const { data, error } = await resetPassword(email.trim().toLowerCase());
    setIsLoading(false);

    if (error) {
      Alert.alert(t('forgotPassword.errorTitle'), error.message);
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="mail" size={50} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{t('forgotPassword.successTitle')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: 'center' }]}>
            {t('forgotPassword.successMessage')}{'\n'}
            <Text style={{ color: theme.primary }}>{email}</Text>
          </Text>
          <Text style={[styles.note, { color: theme.textSecondary }]}>
            {t('forgotPassword.didntReceive')}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => {
              setEmailSent(false);
              setEmail('');
            }}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              {t('forgotPassword.tryAnotherEmail')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.border }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              {t('forgotPassword.backToSignIn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="key-outline" size={50} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{t('forgotPassword.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('forgotPassword.instructions')}
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
              placeholder={t('forgotPassword.emailPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.background }]}>
                {t('forgotPassword.sendResetLink')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {t('forgotPassword.rememberPassword')}{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginText, { color: theme.primary }]}>{t('login.signInButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
