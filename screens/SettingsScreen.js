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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, saveLanguage } from '../i18n';

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
  const { t, i18n } = useTranslation();

  // Check if user is a guest (not logged in but using the app)
  const isGuestUser = !user && isGuest;

  const handleCreateAccount = () => {
    exitGuestMode();
  };

  const handleReplayTour = async () => {
    try {
      await AsyncStorage.removeItem('@ferdi_walkthrough_complete');
      Alert.alert(t('settings.tourReset'), t('settings.tourResetDesc'));
    } catch (err) {
      // Silently ignore
    }
  };
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
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
        t('settings.notAvailableInExpoGo'),
        t('settings.notAvailableInExpoGoMessage'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    try {
      if (pushNotifications) {
        // User wants to turn off - direct them to settings
        Alert.alert(
          t('settings.disableNotifications'),
          t('settings.disableNotificationsMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('settings.openSettings'),
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
          Alert.alert(t('settings.notificationsEnabled'), t('settings.notificationsEnabledMessage'));
        } else if (existingStatus === 'denied') {
          // Permission was previously denied, need to go to settings
          Alert.alert(
            t('settings.enableNotifications'),
            t('settings.enableNotificationsMessage'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('settings.openSettings'),
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
            Alert.alert(t('settings.notificationsEnabled'), t('settings.notificationsEnabledMessage'));
          } else {
            Alert.alert(
              t('settings.notificationsDisabled'),
              t('settings.notificationsDisabledMessage')
            );
          }
        }
      }
    } catch (error) {
      console.log('Error handling notification toggle:', error);
      Alert.alert(t('common.error'), t('settings.unableToChange'));
    }
  };

  const getLanguageName = (code) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : 'English';
  };

  const handleLanguageSelect = async (code) => {
    setSelectedLanguage(code);
    setLanguageModalVisible(false);
    await saveLanguage(code);
  };

  const getCurrencyDisplay = (code) => {
    const currency = currencies.find((c) => c.code === code);
    return currency ? `${currency.symbol} ${currency.code}` : 'USD';
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('settings.confirmDeletion'),
              t('settings.confirmDeletionMessage'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('settings.iUnderstand'),
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement actual account deletion
                    Alert.alert(t('settings.accountDeleted'), t('settings.accountDeletedMessage'));
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
      Alert.alert(t('common.error'), t('settings.unableToOpenPrivacy'));
    });
  };

  const handleSupport = () => {
    Linking.openURL(SUPPORT_URL).catch(() => {
      Alert.alert(t('common.error'), t('settings.unableToOpenSupport'));
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
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.preferences')}</Text>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
          <SettingItem
            icon="language"
            title={t('settings.language')}
            value={getLanguageName(selectedLanguage)}
            onPress={() => setLanguageModalVisible(true)}
          />
          <SettingItem
            icon="cash-outline"
            title={t('settings.currency')}
            value={getCurrencyDisplay(selectedCurrency)}
            onPress={() => setCurrencyModalVisible(true)}
          />
          <SettingItem
            icon={isDarkMode ? 'moon' : 'sunny'}
            title={t('settings.darkMode')}
            value={isDarkMode ? t('settings.on') : t('settings.off')}
            onPress={toggleTheme}
            showArrow={false}
          />
          <SettingItem
            icon="map-outline"
            title={t('settings.replayTour')}
            onPress={handleReplayTour}
          />
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.notifications')}</Text>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
          <SettingItem
            icon={pushNotifications ? 'notifications' : 'notifications-off-outline'}
            title={t('settings.pushNotifications')}
            value={pushNotifications ? t('settings.on') : t('settings.off')}
            onPress={handlePushNotificationToggle}
            showArrow={false}
          />
        </View>
      </View>

      {/* Legal & Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.legalAndSupport')}</Text>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
          <SettingItem
            icon="shield-checkmark-outline"
            title={t('settings.privacyPolicy')}
            onPress={handlePrivacyPolicy}
          />
          <SettingItem
            icon="help-circle-outline"
            title={t('settings.support')}
            onPress={handleSupport}
          />
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.account')}</Text>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
          {isGuestUser ? (
            <>
              {/* Guest User - Show Create Account option */}
              <View style={[styles.guestBanner, { backgroundColor: theme.primary + '15', borderBottomColor: theme.border }]}>
                <Ionicons name="information-circle" size={20} color={theme.primary} />
                <Text style={[styles.guestBannerText, { color: theme.text }]}>
                  {t('settings.guestBanner')}
                </Text>
              </View>
              <SettingItem
                icon="person-add-outline"
                title={t('settings.createAccount')}
                onPress={handleCreateAccount}
              />
              <SettingItem
                icon="log-in-outline"
                title={t('settings.signIn')}
                onPress={handleCreateAccount}
              />
            </>
          ) : (
            <>
              {/* Authenticated User - Show Sign Out and Delete options */}
              <SettingItem
                icon="log-out-outline"
                title={t('settings.signOut')}
                onPress={() => {
                  Alert.alert(t('settings.signOut'), t('settings.signOutConfirm'), [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('settings.signOut'), onPress: signOut },
                  ]);
                }}
                showArrow={false}
              />
              <SettingItem
                icon="trash-outline"
                title={t('settings.deleteAccount')}
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
      <Modal visible={languageModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground || theme.surface }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.cardBackground || theme.surface, borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('settings.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              style={{ backgroundColor: theme.cardBackground || theme.surface }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    {
                      borderBottomColor: theme.border,
                      backgroundColor: selectedLanguage === item.code ? (theme.primary + '20') : (theme.cardBackground || theme.surface),
                    },
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <Text style={[styles.pickerItemText, { color: theme.text }]}>
                    {item.flag} {item.name}
                  </Text>
                  {selectedLanguage === item.code && (
                    <Ionicons name="checkmark" size={22} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Currency Picker Modal */}
      {renderPickerModal(
        currencyModalVisible,
        setCurrencyModalVisible,
        currencies,
        selectedCurrency,
        setSelectedCurrency,
        t('settings.selectCurrency')
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
