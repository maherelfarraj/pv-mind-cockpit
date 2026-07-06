import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/constants/theme';

type StatusBadgeProps = {
  label: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
};

const tones = {
  primary: {
    backgroundColor: palette.primarySoft,
    color: palette.primary,
  },
  success: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  warning: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },
  danger: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
};

export function StatusBadge({ label, tone = 'primary' }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: tones[tone].backgroundColor }]}>
      <Text style={[styles.label, { color: tones[tone].color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
