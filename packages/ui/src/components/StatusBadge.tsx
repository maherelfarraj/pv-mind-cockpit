import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme';

type Status = 'online' | 'offline' | 'warning' | 'error' | 'idle' | 'info';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  showDot?: boolean;
}

const statusConfig: Record<Status, { color: string; label: string }> = {
  online: { color: Colors.success, label: 'Online' },
  offline: { color: Colors.textMuted, label: 'Offline' },
  warning: { color: Colors.warning, label: 'Warning' },
  error: { color: Colors.error, label: 'Error' },
  idle: { color: Colors.info, label: 'Idle' },
  info: { color: Colors.info, label: 'Info' },
};

export function StatusBadge({ status, label, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label ?? config.label;

  return (
    <View style={[styles.badge, { borderColor: config.color + '40', backgroundColor: config.color + '20' }]}>
      {showDot && (
        <View style={[styles.dot, { backgroundColor: config.color }]} />
      )}
      <Text style={[styles.label, { color: config.color }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 1,
    alignSelf: 'flex-start',
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightMedium,
    letterSpacing: 0.3,
  },
});
