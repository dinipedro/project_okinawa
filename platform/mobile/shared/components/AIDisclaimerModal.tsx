/**
 * AIDisclaimerModal Component
 *
 * LGPD-compliant modal that informs users about the advisory nature
 * of AI-generated recommendations. Shows once per device; acceptance
 * is persisted in AsyncStorage.
 *
 * @module shared/components/AIDisclaimerModal
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { t } from '@okinawa/shared/i18n';
import Text from './Text';

const STORAGE_KEY = '@okinawa/ai_disclaimer_accepted';

interface AIDisclaimerModalProps {
  /** If true, the modal will be shown regardless of prior acceptance (e.g. for settings). */
  forceShow?: boolean;
  /** Called after the user accepts the disclaimer. */
  onAccept?: () => void;
  /** Called if the user closes without accepting. */
  onDismiss?: () => void;
}

export const AIDisclaimerModal: React.FC<AIDisclaimerModalProps> = ({
  forceShow = false,
  onAccept,
  onDismiss,
}) => {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPreviousAcceptance();
  }, []);

  const checkPreviousAcceptance = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'true' && !forceShow) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    } catch {
      // If storage fails, show the disclaimer to be safe
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Best effort -- the disclaimer will re-appear next time if storage fails
    }
    setVisible(false);
    onAccept?.();
  }, [onAccept]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  if (loading || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.muted }]}>
            <Text
              style={[styles.title, { color: colors.foreground }]}
              accessibilityRole="header"
            >
              {t('ai.disclaimer.title')}
            </Text>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              {t('ai.disclaimer.advisory')}
            </Text>

            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              {t('ai.disclaimer.notProfessional')}
            </Text>

            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              {t('ai.disclaimer.mayContainErrors')}
            </Text>

            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              {t('ai.disclaimer.verifyInfo')}
            </Text>
          </ScrollView>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setChecked(!checked)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={t('ai.disclaimer.iUnderstand')}
          >
            <Checkbox
              status={checked ? 'checked' : 'unchecked'}
              onPress={() => setChecked(!checked)}
              color={colors.primary}
              uncheckedColor={colors.muted}
            />
            <Text style={[styles.checkboxLabel, { color: colors.foreground }]}>
              {t('ai.disclaimer.iUnderstand')}
            </Text>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: checked ? colors.primary : colors.muted,
                },
              ]}
              onPress={handleAccept}
              disabled={!checked}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('ai.disclaimer.continue')}
              accessibilityState={{ disabled: !checked }}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>
                {t('ai.disclaimer.continue')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollArea: {
    maxHeight: 260,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AIDisclaimerModal;
