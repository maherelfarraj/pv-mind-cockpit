import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ResponsiveCardGrid } from '@/components/ResponsiveCardGrid';
import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, spacing } from '@/constants/theme';
import { findProjectById } from '@/data/mockData';

const summaryRoutes = [
  { title: 'PV Summary', href: '/summaries/pv' as const },
  { title: 'BESS Summary', href: '/summaries/bess' as const },
  { title: 'Yield Summary', href: '/summaries/yield' as const },
  { title: 'CAPEX Summary', href: '/summaries/capex' as const },
];

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = findProjectById(id);

  if (!project) {
    return (
      <Screen title="Project Detail" subtitle="The requested project could not be found.">
        <SectionCard title="Missing project">
          <Text style={styles.detail}>Use the Projects tab to choose another portfolio item.</Text>
        </SectionCard>
      </Screen>
    );
  }

  return (
    <Screen title={project.name} subtitle={`${project.location} • ${project.lastUpdate}`}>
      <SectionCard eyebrow="Project Status" title="Execution overview">
        <View style={styles.row}>
          <StatusBadge
            label={project.status}
            tone={project.status === 'Commissioning' ? 'success' : 'warning'}
          />
          <Text style={styles.detail}>{project.capacityMw} MW PV • {project.bessMWh} MWh BESS</Text>
        </View>
        <Text style={styles.detail}>
          Modeled annual yield {project.yieldGWh} GWh with current CAPEX exposure of ${project.capexUsdM}M.
        </Text>
      </SectionCard>

      <ResponsiveCardGrid>
        {summaryRoutes.map((summary) => (
          <Link
            href={{ pathname: summary.href, params: { projectId: project.id } }}
            key={summary.title}
            asChild>
            <Pressable>
              <SectionCard title={summary.title}>
                <Text style={styles.metric}>Open</Text>
                <Text style={styles.detail}>Review project-specific KPIs and action items.</Text>
              </SectionCard>
            </Pressable>
          </Link>
        ))}
      </ResponsiveCardGrid>

      <SectionCard eyebrow="Operations" title="Live execution shortcuts">
        <View style={styles.stack}>
          <Link href="/scada-live" asChild>
            <Pressable style={styles.shortcut}>
              <Text style={styles.shortcutTitle}>SCADA Live</Text>
              <Text style={styles.detail}>Availability {project.scadaAvailability}% today.</Text>
            </Pressable>
          </Link>
          <Link href="/alarms" asChild>
            <Pressable style={styles.shortcut}>
              <Text style={styles.shortcutTitle}>Alarms</Text>
              <Text style={styles.detail}>{project.alarms} active alarms currently assigned.</Text>
            </Pressable>
          </Link>
          <Link href="/work-orders" asChild>
            <Pressable style={styles.shortcut}>
              <Text style={styles.shortcutTitle}>Work Orders</Text>
              <Text style={styles.detail}>{project.workOrders} open work orders or saved drafts.</Text>
            </Pressable>
          </Link>
        </View>
      </SectionCard>
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
  metric: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
  },
  detail: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  stack: {
    gap: spacing.sm,
  },
  shortcut: {
    backgroundColor: palette.background,
    borderRadius: 18,
    gap: 4,
    padding: spacing.md,
  },
  shortcutTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
