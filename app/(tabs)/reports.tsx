import { StyleSheet, Text, View } from 'react-native';

import { ReportBranding } from '@/components/ReportBranding';
import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { APP_NAME, REPORT_FOOTER } from '@/constants/branding';
import { palette, spacing } from '@/constants/theme';
import { reports } from '@/data/mockData';

export default function ReportsScreen() {
  return (
    <Screen
      title="Reports"
      subtitle={`${APP_NAME} reporting workspace for scheduled portfolio, yield, and execution summaries.`}>
      <ReportBranding />

      <View style={styles.stack}>
        {reports.map((report) => (
          <SectionCard key={report.id} eyebrow={report.cadence} title={report.title}>
            <Text style={styles.description}>{report.description}</Text>
            <Text style={styles.meta}>Last generated: {report.lastGenerated}</Text>
            <Text style={styles.footer}>{REPORT_FOOTER}</Text>
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
  description: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: palette.muted,
    fontSize: 13,
  },
  footer: {
    color: palette.muted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
