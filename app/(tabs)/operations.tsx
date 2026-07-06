import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

const modules = [
  {
    href: '/scada-live' as const,
    title: 'SCADA Live',
    detail: 'Watch telemetry refresh, availability, inverter state, and BESS dispatch readiness.',
  },
  {
    href: '/alarms' as const,
    title: 'Alarms',
    detail: 'Review event severity, owner assignment, and affected asset context.',
  },
  {
    href: '/work-orders' as const,
    title: 'Work Orders',
    detail: 'Save drafts offline, attach photo placeholders, and sync when connectivity returns.',
  },
];

export default function OperationsScreen() {
  const { isOnline, pendingDraftCount } = useAppData();

  return (
    <Screen title="Operations" subtitle="Daily operational workflows for live monitoring, alarms, and field work.">
      <SectionCard eyebrow="Connectivity" title="Field readiness">
        <View style={styles.row}>
          <StatusBadge label={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'success' : 'warning'} />
          <Text style={styles.caption}>
            {pendingDraftCount > 0
              ? `${pendingDraftCount} work-order draft${pendingDraftCount === 1 ? '' : 's'} pending sync.`
              : 'No pending work-order sync actions.'}
          </Text>
        </View>
      </SectionCard>

      <View style={styles.stack}>
        {modules.map((module) => (
          <Link href={module.href} key={module.title} asChild>
            <Pressable>
              <SectionCard title={module.title}>
                <Text style={styles.moduleDetail}>{module.detail}</Text>
              </SectionCard>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  caption: {
    color: palette.muted,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  stack: {
    gap: spacing.sm,
  },
  moduleDetail: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
