import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/constants/theme';
import { ResponsiveCardGrid } from '@/components/ResponsiveCardGrid';
import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';

type Metric = {
  label: string;
  value: string;
  detail: string;
};

type SummaryScreenProps = {
  title: string;
  subtitle: string;
  metrics: Metric[];
  focusAreas: string[];
};

export function SummaryScreen({ title, subtitle, metrics, focusAreas }: SummaryScreenProps) {
  return (
    <Screen title={title} subtitle={subtitle}>
      <ResponsiveCardGrid>
        {metrics.map((metric) => (
          <SectionCard key={metric.label}>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricDetail}>{metric.detail}</Text>
          </SectionCard>
        ))}
      </ResponsiveCardGrid>

      <SectionCard title="Focus Areas" eyebrow="Next Actions">
        <View style={styles.list}>
          {focusAreas.map((item) => (
            <View key={item} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricValue: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '700',
  },
  metricLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  metricDetail: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bullet: {
    color: palette.primary,
    fontSize: 18,
    lineHeight: 20,
  },
  listText: {
    color: palette.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
