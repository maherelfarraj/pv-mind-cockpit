import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, spacing } from '@/constants/theme';
import { alarms } from '@/data/mockData';

export default function AlarmsScreen() {
  return (
    <Screen title="Alarms" subtitle="Prioritized issues for field and control-room response.">
      <View style={styles.stack}>
        {alarms.map((alarm) => (
          <SectionCard key={alarm.id} eyebrow={alarm.project} title={alarm.title}>
            <StatusBadge
              label={`${alarm.severity} severity`}
              tone={alarm.severity === 'High' ? 'danger' : alarm.severity === 'Medium' ? 'warning' : 'primary'}
            />
            <Text style={styles.message}>{alarm.message}</Text>
            <Text style={styles.meta}>Raised {alarm.timestamp}</Text>
          </SectionCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
  },
  message: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: palette.muted,
    fontSize: 13,
  },
});
