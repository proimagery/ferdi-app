import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Check if running in Expo Go (notifications don't work in Expo Go)
const isExpoGo = Constants.appOwnership === 'expo';

// Only import Notifications if not in Expo Go
let Notifications = null;
if (!isExpoGo) {
  Notifications = require('expo-notifications');
}

// External URLs
const PRIVACY_POLICY_URL = 'https://proimagery.github.io/ferdi-privacy/';
const SUPPORT_URL = 'https://proimagery.github.io/ferdi-support/';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'pt-br', name: 'Português (Brasil)' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文 (简体)' },
  { code: 'zh-tw', name: '中文 (繁體)' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ru', name: 'Русский' },
  { code: 'pl', name: 'Polski' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'th', name: 'ไทย' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'sv', name: 'Svenska' },
  { code: 'da', name: 'Dansk' },
  { code: 'no', name: 'Norsk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'cs', name: 'Čeština' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'he', name: 'עברית' },
  { code: 'uk', name: 'Українська' },
  { code: 'ro', name: 'Română' },
  { code: 'hu', name: 'Magyar' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'fil', name: 'Filipino' },
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso' },
  { code: 'COP', symbol: 'CO$', name: 'Colombian Peso' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
];

export default function SettingsScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { signOut, user, isGuest, exitGuestMode } = useAuth();

  // Check if user is a guest (not logged in but using the app)
  const isGuestUser = !user && isGuest;

  const handleCreateAccount = () => {
    exitGuestMode();
  };
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('checking');

  // Check notification permissions on mount (only in standalone app, not Expo Go)
  useEffect(() => {
    if (!isExpoGo && Notifications) {
      checkNotificationPermissions();
    }
  }, []);

  const checkNotificationPermissions = async () => {
    // Skip if in Expo Go
    if (isExpoGo || !Notifications) {
      setNotificationStatus('unavailable');
      return;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
      setPushNotifications(status === 'granted');
    } catch (error) {
      console.log('Error checking notification permissions:', error);
      setNotificationStatus('undetermined');
    }
  };

  const handlePushNotificationToggle = async () => {
    // Show message if in Expo Go
    if (isExpoGo || !Notifications) {
      Alert.alert(
        'Not Available in Expo Go',
        'Push notifications are only available in the standalone app (APK/IPA). Please build the app to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      if (pushNotifications) {
        // User wants to turn off - direct them to settings
        Alert.alert(
          'Disable Notifications',
          'To disable push notifications, please go to your device settings and turn off notifications for Ferdi.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      } else {
        // User wants to turn on - request permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        if (existingStatus === 'granted') {
          setPushNotifications(true);
          setNotificationStatus('granted');
          Alert.alert('Notifications Enabled', 'You will receive notifications for travel buddy requests, upcoming trips, and more.');
        } else if (existingStatus === 'denied') {
          // Permission was previously denied, need to go to settings
          Alert.alert(
            'Enable Notifications',
            'Notifications were previously disabled. Please enable them in your device settings to receive alerts for travel buddy requests and upcoming trips.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ]
          );
        } else {
          // Request permission for the first time
          const { status } = await Notifications.requestPermissionsAsync();
          setNotificationStatus(status);

          if (status === 'granted') {
            setPushNotifications(true);
            Alert.alert('Notifications Enabled', 'You will receive notifications for travel buddy requests, upcoming trips, and more.');
          } else {
            Alert.alert(
              'Notifications Disabled',
              'You won\'t receive notifications for travel buddy requests or upcoming trips. You can enable them later in settings.'
            );
          }
        }
      }
    } catch (error) {
      console.log('Error handling notification toggle:', error);
      Alert.alert('Error', 'Unable to change notification settings. Please try again.');
    }
  };

  const getLanguageName = (code) => {
    const lang = languages.find((l) => l.code === code);
    return lang ? lang.name : 'English';
  };

  const getCurrencyDisplay = (code) => {
    const currency = currencies.find((c) => c.code === code);
    return currency ? `${currency.symbol} ${currency.code}` : 'USD';
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'I Understand',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement actual account deletion
                    Alert.alert('Account Deleted', 'Your account has been deleted.');
                    signOut();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
      Alert.alert('Error', 'Unable to open Privacy Policy. Please try again later.');
    });
  };

  const handleSupport = () => {
    Linking.openURL(SUPPORT_URL).catch(() => {
      Alert.alert('Error', 'Unable to open Support page. Please try again later.');
    });
  };

  const SettingItem = ({ icon, title, value, onPress, showArrow = true, danger = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: theme.border }]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? theme.danger : theme.primary}
          style={styles.settingIcon}
        />
        <Text style={[styles.settingTitle, { color: danger ? theme.danger : theme.text }]}>
          {title}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{value}</Text>}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPickerModal = (visible, setVisible, data, selected, setSelected, title) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground || theme.surface }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.cardBackground || theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.code}
            style={{ backgroundColor: theme.cardBackground || theme.surface }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  {
                    borderBottomColor: theme.border,
                    backgroundColor: selected === item.code ? (theme.primary + '20') : (theme.cardBackground || theme.surface),
                  },
                ]}
                onPress={() => {
                  setSelected(item.code);
                  setVisible(false);
                }}
              >
                <Text style={[styles.pickerItemText, { color: theme.text }]}>
                  {item.name} {item.symbol ? `(${item.symbol})` : ''}
                </Text>
                {selected === item.code && (
                  <Ionicons name="checkmark" size={22} color={theme.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PREFERENCES</Text>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
          <SettingItem
            icon="language"
            title="Language"
            value={getLanguageName(selectedLanguage)}
            onPress={() => setLanguageModalVisible(true)}
          />
          <SettingItem
            icon="cash-outline"
            title="Currency"
            value={getCurrencyDisplay(selectedCurrency)}
            onPress={() => setCurrencyModalVisible(true)}
          />
          <SettingItem
            icon={isDarkMode ? 'moon' : 'sunny'}
            title="Dark Mode"
            value={isDarkMode ? 'On' : 'Off'}
            onPress={toggleTheme}
            showArrow={false}
          />
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTIFICATIONS</Text>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
          <SettingItem
            icon={pushNotifications ? 'notifications' : 'notifications-off-outline'}
            title="Push Notifications"
            value={pushNotifications ? 'On' : 'Off'}
            onPress={handlePushNotificationToggle}
            showArrow={false}
          />
        </View>
      </View>

      {/* Legal & Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>LEGAL & SUPPORT</Text>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <SettingItem
            icon="help-circle-outline"
            title="Support"
            onPress={handleSupport}
          />
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ACCOUNT</Text>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
          {isGuestUser ? (
            <>
              {/* Guest User - Show Create Account option */}
              <View style={[styles.guestBanner, { backgroundColor: theme.primary + '15', borderBottomColor: theme.border }]}>
                <Ionicons name="information-circle" size={20} color={theme.primary} />
                <Text style={[styles.guestBannerText, { color: theme.text }]}>
                  You're browsing as a guest. Create an account to save trips, budgets, and photos.
                </Text>
              </View>
              <SettingItem
                icon="person-add-outline"
                title="Create Account"
                onPress={handleCreateAccount}
              />
              <SettingItem
                icon="log-in-outline"
                title="Sign In"
                onPress={handleCreateAccount}
              />
            </>
          ) : (
            <>
              {/* Authenticated User - Show Sign Out and Delete options */}
              <SettingItem
                icon="log-out-outline"
                title="Sign Out"
                onPress={() => {
                  Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign Out', onPress: signOut },
                  ]);
                }}
                showArrow={false}
              />
              <SettingItem
                icon="trash-outline"
                title="Delete Account"
                onPress={handleDeleteAccount}
                showArrow={false}
                danger
              />
            </>
          )}
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appVersion, { color: theme.textSecondary }]}>Ferdi v1.0.0</Text>
        <Text style={[styles.appCopyright, { color: theme.textSecondary }]}>
          © 2024 Ferdi. All rights reserved.
        </Text>
      </View>

      {/* Language Picker Modal */}
      {renderPickerModal(
        languageModalVisible,
        setLanguageModalVisible,
        languages,
        selectedLanguage,
        setSelectedLanguage,
        'Select Language'
      )}

      {/* Currency Picker Modal */}
      {renderPickerModal(
        currencyModalVisible,
        setCurrencyModalVisible,
        currencies,
        selectedCurrency,
        setSelectedCurrency,
        'Select Currency'
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 15,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 16,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
  },
  guestBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
