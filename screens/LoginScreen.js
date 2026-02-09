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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemedAlert from '../components/ThemedAlert';
import LanguageSelector from '../components/LanguageSelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTestLogin, setShowTestLogin] = useState(false);
  const [testUsername, setTestUsername] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [showTestPassword, setShowTestPassword] = useState(false);
  const { signIn, testSignIn, continueAsGuest } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Themed alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const showAlert = (title, message) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      showAlert(t('common.oops'), t('login.promptEmail'));
      return;
    }
    if (!password) {
      showAlert(t('common.oops'), t('login.promptPassword'));
      return;
    }

    setIsLoading(true);
    const { data, error } = await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);

    if (error) {
      showAlert(t('login.loginFailed'), error.message);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleTestLogin = async () => {
    if (!testUsername.trim()) {
      showAlert(t('common.oops'), t('login.testerModal.usernamePrompt'));
      return;
    }
    if (testUsername.trim().length < 3) {
      showAlert(t('common.oops'), t('login.testerModal.usernameMinLength'));
      return;
    }
    if (!testPassword || testPassword.length < 6) {
      showAlert(t('common.oops'), t('login.testerModal.passwordMinLength'));
      return;
    }

    setIsLoading(true);
    const { data, error } = await testSignIn(testUsername.trim(), testPassword);
    setIsLoading(false);

    if (error) {
      showAlert(t('login.loginFailed'), error.message);
    } else {
      setShowTestLogin(false);
      setTestUsername('');
      setTestPassword('');
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
      <View style={styles.content}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="airplane" size={50} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{t('login.welcomeTitle')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('login.welcomeSubtitle')}
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
              placeholder={t('login.emailPlaceholder')}
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
              placeholder={t('login.passwordPlaceholder')}
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

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
              {t('login.forgotPassword')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text style={[styles.loginButtonText, { color: theme.background }]}>
                {t('login.signInButton')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Continue as Guest Button */}
        <TouchableOpacity
          style={[styles.guestButton, { borderColor: theme.primary }]}
          onPress={continueAsGuest}
        >
          <Ionicons name="eye-outline" size={20} color={theme.primary} />
          <Text style={[styles.guestButtonText, { color: theme.primary }]}>
            {t('login.continueAsGuest')}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {t('login.noAccountPrompt')}{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.signupText, { color: theme.primary }]}>{t('login.signUpLink')}</Text>
          </TouchableOpacity>
        </View>

        {/* Tester Login Button */}
        <TouchableOpacity
          style={styles.testerButton}
          onPress={() => setShowTestLogin(true)}
        >
          <Ionicons name="flask-outline" size={18} color={theme.textSecondary} />
          <Text style={[styles.testerButtonText, { color: theme.textSecondary }]}>
            {t('login.testerLogin')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Login Modal */}
      <Modal visible={showTestLogin} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground || theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('login.testerModal.title')}</Text>
              <TouchableOpacity onPress={() => setShowTestLogin(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              {t('login.testerModal.description')}
            </Text>

            <View style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.text
                  }]}
                  placeholder={t('login.testerModal.usernamePlaceholder')}
                  placeholderTextColor={theme.textSecondary}
                  value={testUsername}
                  onChangeText={setTestUsername}
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
                  placeholder={t('login.testerModal.passwordPlaceholder')}
                  placeholderTextColor={theme.textSecondary}
                  value={testPassword}
                  onChangeText={setTestPassword}
                  secureTextEntry={!showTestPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowTestPassword(!showTestPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showTestPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: theme.primary }]}
                onPress={handleTestLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={[styles.loginButtonText, { color: theme.background }]}>
                    {t('login.testerModal.continueButton')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Themed Alert */}
      <ThemedAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  guestButtonText: {
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
  signupText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingVertical: 10,
    gap: 6,
  },
  testerButtonText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalForm: {
    gap: 15,
  },
});
