/**
 * LanguagePicker - Shared Language Selection Component
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useI18n, SupportedLanguage } from '../hooks/useI18n';
import { useColors } from '../contexts/ThemeContext';

interface LanguagePickerProps {
  /**
   * Custom button renderer
   */
  renderButton?: (language: string, flag: string, onPress: () => void) => React.ReactNode;
  /**
   * Style for the default button
   */
  buttonStyle?: object;
  /**
   * Style for the button text
   */
  buttonTextStyle?: object;
  /**
   * Show flag emoji in button
   */
  showFlag?: boolean;
  /**
   * Show language name in button
   */
  showName?: boolean;
  /**
   * Callback when language changes
   */
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export function LanguagePicker({
  renderButton,
  buttonStyle,
  buttonTextStyle,
  showFlag = true,
  showName = true,
  onLanguageChange,
}: LanguagePickerProps) {
  const { language, languageOptions, changeLanguage, t } = useI18n();
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    buttonText: {
      fontSize: 16,
      color: colors.foreground,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      width: '80%',
      maxWidth: 320,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 16,
      color: colors.foreground,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    languageItemSelected: {
      backgroundColor: colors.successMuted,
    },
    languageFlag: {
      fontSize: 24,
      marginRight: 12,
    },
    languageName: {
      fontSize: 16,
      color: colors.foreground,
      flex: 1,
    },
    languageNameSelected: {
      fontWeight: '600',
      color: colors.success,
    },
    checkmark: {
      fontSize: 18,
      color: colors.success,
      fontWeight: '600',
    },
    closeButton: {
      marginTop: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      color: colors.mutedForeground,
    },
  }), [colors]);

  const currentLanguageInfo = languageOptions.find((l) => l.code === language);

  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    await changeLanguage(lang);
    setModalVisible(false);
    onLanguageChange?.(lang);
  };

  const defaultButton = (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={() => setModalVisible(true)}
    >
      <Text style={[styles.buttonText, buttonTextStyle]}>
        {showFlag && currentLanguageInfo?.flag}{' '}
        {showName && currentLanguageInfo?.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {renderButton
        ? renderButton(
            currentLanguageInfo?.name || '',
            currentLanguageInfo?.flag || '',
            () => setModalVisible(true),
          )
        : defaultButton}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>

            <FlatList
              data={languageOptions}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    item.code === language && styles.languageItemSelected,
                  ]}
                  onPress={() => handleSelectLanguage(item.code)}
                >
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      item.code === language && styles.languageNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.code === language && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default LanguagePicker;
