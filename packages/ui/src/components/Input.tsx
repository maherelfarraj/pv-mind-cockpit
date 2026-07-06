import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type ViewStyle,
  type KeyboardTypeOptions,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  hint?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  hint,
  error,
  keyboardType = 'default',
  disabled = false,
  required = false,
  style,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? (required ? 'Required' : 'Optional')}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
          disabled && styles.inputDisabled,
        ]}
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityRequired={required}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.base },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: { color: Colors.error },
  unit: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeBase,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  inputError: { borderColor: Colors.error },
  inputDisabled: { opacity: 0.5 },
  hint: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSizeXs,
    color: Colors.error,
  },
});
