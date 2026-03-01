/**
 * PhoneInput Component
 * 
 * Phone number input with country selector and mask.
 * Supports Brazilian format by default with international support.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { TextInput, Text, IconButton } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import Haptic from '@/shared/utils/haptics';

interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
  mask: string;
}

const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil', dial: '+55', flag: '🇧🇷', mask: '(99) 99999-9999' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', mask: '(999) 999-9999' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', mask: '999 999 999' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷', mask: '99 9999-9999' },
  { code: 'MX', name: 'México', dial: '+52', flag: '🇲🇽', mask: '99 9999 9999' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string, fullNumber: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = false,
}) => {
  const colors = useColors();
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const formatPhone = useCallback((input: string): string => {
    const digits = input.replace(/\D/g, '');
    let formatted = '';
    let digitIndex = 0;

    for (const char of country.mask) {
      if (digitIndex >= digits.length) break;
      
      if (char === '9') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += char;
      }
    }

    return formatted;
  }, [country.mask]);

  const handleChange = useCallback((text: string) => {
    const formatted = formatPhone(text);
    const fullNumber = country.dial + formatted.replace(/\D/g, '');
    onChange(formatted, fullNumber);
    Haptic.lightImpact();
  }, [formatPhone, country.dial, onChange]);

  const selectCountry = useCallback((selected: Country) => {
    setCountry(selected);
    setShowCountryPicker(false);
    onChange('', selected.dial);
    Haptic.selectionChanged();
  }, [onChange]);

  const isValid = useMemo(() => {
    const digits = value.replace(/\D/g, '');
    const expectedDigits = country.mask.replace(/\D/g, '').length;
    return digits.length === expectedDigits;
  }, [value, country.mask]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.countrySelector}
        onPress={() => {
          setShowCountryPicker(true);
          Haptic.lightImpact();
        }}
        disabled={disabled}
      >
        <Text style={styles.flag}>{country.flag}</Text>
        <Text style={styles.dialCode}>{country.dial}</Text>
        <IconButton icon="chevron-down" size={16} />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          value={value}
          onChangeText={handleChange}
          placeholder={country.mask.replace(/9/g, '0')}
          keyboardType="phone-pad"
          autoFocus={autoFocus}
          disabled={disabled}
          error={!!error}
          style={styles.input}
          outlineStyle={[
            styles.outline,
            error ? styles.errorOutline : null,
            isValid ? styles.validOutline : null,
          ]}
          right={isValid ? (
            <TextInput.Icon icon="check-circle" color={colors.primary} />
          ) : undefined}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <IconButton
              icon="close"
              onPress={() => setShowCountryPicker(false)}
            />
          </View>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  item.code === country.code && styles.countryItemSelected,
                ]}
                onPress={() => selectCountry(item)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDial}>{item.dial}</Text>
                </View>
                {item.code === country.code && (
                  <IconButton icon="check" iconColor={colors.primary} size={20} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
  },
  flag: {
    fontSize: 24,
    marginRight: 4,
  },
  dialCode: {
    fontSize: 16,
    color: colors.foreground,
    fontWeight: '500',
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.card,
  },
  outline: {
    borderRadius: 8,
  },
  errorOutline: {
    borderColor: colors.destructive,
  },
  validOutline: {
    borderColor: colors.primary,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countryItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  countryDial: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
});

export default PhoneInput;
