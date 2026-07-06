import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { NEEDS_INPUT, type SafeNumber } from '@pvmind/calc-engine';
import { Colors, Typography } from '../theme';

interface SafeValueProps {
  value: SafeNumber | string | number;
  unit?: string;
  decimals?: number;
  style?: TextStyle;
  needsInputStyle?: TextStyle;
}

/**
 * Inline text component that renders a safe numeric value or "Needs Input".
 * Guarantees NaN and Infinity are never shown in the UI.
 */
export function SafeValue({ value, unit, decimals = 2, style, needsInputStyle }: SafeValueProps) {
  const display = resolveSafeDisplay(value, unit, decimals);
  const isNeedsInput = display === NEEDS_INPUT;

  return (
    <Text
      style={[styles.base, isNeedsInput ? [styles.needsInput, needsInputStyle] : style]}
      accessibilityLabel={display}
    >
      {display}
    </Text>
  );
}

function resolveSafeDisplay(
  value: SafeNumber | string | number,
  unit?: string,
  decimals = 2,
): string {
  if (value === null || value === undefined) return NEEDS_INPUT;
  if (typeof value === 'string') return value || NEEDS_INPUT;
  const n = Number(value);
  if (isNaN(n) || !isFinite(n)) return NEEDS_INPUT;
  const formatted = n.toFixed(decimals);
  return unit ? `${formatted} ${unit}` : formatted;
}

const styles = {
  base: {
    fontSize: Typography.fontSizeBase,
    color: Colors.textPrimary,
  } as TextStyle,
  needsInput: {
    fontSize: Typography.fontSizeSm,
    color: Colors.needsInput,
    fontStyle: 'italic',
  } as TextStyle,
};
