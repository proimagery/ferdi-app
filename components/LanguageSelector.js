import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGES, saveLanguage } from '../i18n';

export default function LanguageSelector({ style }) {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const handleSelectLanguage = async (code) => {
    await saveLanguage(code);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: theme.cardBackground, borderColor: theme.border }, style]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.flag}>{currentLang.flag}</Text>
        <Text style={[styles.code, { color: theme.text }]}>{currentLang.code.toUpperCase()}</Text>
        <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {LANGUAGES.find(l => l.code === 'en')?.code === i18n.language ? 'Select Language' : i18n.t('settings.selectLanguage')}
            </Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    { borderBottomColor: theme.border },
                    item.code === i18n.language && { backgroundColor: theme.primary + '15' },
                  ]}
                  onPress={() => handleSelectLanguage(item.code)}
                >
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <Text style={[styles.languageName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  {item.code === i18n.language && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  flag: {
    fontSize: 16,
  },
  code: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});
