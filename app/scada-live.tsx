import { StyleSheet, Text, View } from 'react-native';

import { ResponsiveCardGrid } from '@/components/ResponsiveCardGrid';
import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export default function ScadaLiveScreen() {
  const { isOnline } = useAppData();

  return (
    <Screen title="SCADA Live" subtitle="Live telemetry placeholder for PV and BESS performance.">
      <SectionCard eyebrow="Telemetry Status" title="Connection state">
        <View style={styles.row}>
          <StatusBadge label={isOnline ? 'Streaming' : 'Cached'} tone={isOnline ? 'success' : 'warning'} />
          <Text style={styles.caption}>
            {isOnline
              ? 'Live values are ready for backend SCADA integration.'
              : 'Showing cached placeholders until connectivity returns.'}
          </Text>
        </View>
      </SectionCard>

      <ResponsiveCardGrid>
        <SectionCard title="PV Output">
          <Text style={styles.value}>184 MW</Text>
          <Text style={styles.caption}>Current fleet generation against a 191 MW target.</Text>
        </SectionCard>
        <SectionCard title="BESS Dispatch">
          <Text style={styles.value}>32 MW</Text>
          <Text style={styles.caption}>Discharging into the evening peak support window.</Text>
        </SectionCard>
        <SectionCard title="Grid Availability">
          <Text style={styles.value}>99.3%</Text>
          <Text style={styles.caption}>Availability placeholder for the last 24-hour period.</Text>
        </SectionCard>
      </ResponsiveCardGrid>
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
  value: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '700',
  },
  caption: {
    color: palette.muted,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
