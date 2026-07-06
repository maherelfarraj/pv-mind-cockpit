import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  labelStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.white : Colors.primary}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`], labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  fullWidth: { width: '100%' },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.transparent,
  },
  danger: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },

  // Sizes
  size_sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  size_md: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.base },
  size_lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },

  disabled: { opacity: 0.45 },

  // Labels
  label: {
    fontWeight: Typography.fontWeightSemiBold,
    letterSpacing: 0.3,
  },
  label_primary: { color: Colors.white },
  label_secondary: { color: Colors.primary },
  label_ghost: { color: Colors.textSecondary },
  label_danger: { color: Colors.white },

  labelSize_sm: { fontSize: Typography.fontSizeSm },
  labelSize_md: { fontSize: Typography.fontSizeMd },
  labelSize_lg: { fontSize: Typography.fontSizeBase },
});
