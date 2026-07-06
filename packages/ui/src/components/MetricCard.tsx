import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { NEEDS_INPUT, type SafeNumber } from '@pvmind/calc-engine';
import { Colors, Radius, Spacing, Typography } from '../theme';
import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: SafeNumber | string;
  unit?: string;
  decimals?: number;
  description?: string;
  color?: string;
  style?: ViewStyle;
}

/**
 * Displays a metric value. Shows "Needs Input" if value is null/undefined/NaN/Infinity.
 */
export function MetricCard({
  label,
  value,
  unit,
  decimals = 2,
  description,
  color,
  style,
}: MetricCardProps) {
  const displayValue = formatMetricValue(value, unit, decimals);
  const isNeedsInput = displayValue === NEEDS_INPUT;

  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          isNeedsInput && styles.needsInput,
          color && !isNeedsInput ? { color } : null,
        ]}
        accessibilityLabel={`${label}: ${displayValue}`}
      >
        {displayValue}
      </Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </Card>
  );
}

function formatMetricValue(
  value: SafeNumber | string,
  unit?: string,
  decimals = 2,
): string {
  if (value === null || value === undefined) return NEEDS_INPUT;
  if (typeof value === 'string') return value;
  const n = Number(value);
  if (isNaN(n) || !isFinite(n)) return NEEDS_INPUT;
  const formatted = n.toFixed(decimals);
  return unit ? `${formatted} ${unit}` : formatted;
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    minWidth: 140,
  },
  label: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  needsInput: {
    fontSize: Typography.fontSizeSm,
    color: Colors.needsInput,
    fontWeight: Typography.fontWeightMedium,
    fontStyle: 'italic',
  },
  description: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
  },
});
