import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ResponsiveCardGrid } from '@/components/ResponsiveCardGrid';
import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { APP_NAME, APP_SUBTITLE } from '@/constants/branding';
import { palette, spacing } from '@/constants/theme';
import { projects } from '@/data/mockData';
import { useAppData } from '@/providers/AppDataProvider';

const summaryLinks = [
  { href: '/summaries/pv' as const, title: 'PV Summary', value: '265 MW', detail: 'Installed DC capacity across active projects' },
  { href: '/summaries/bess' as const, title: 'BESS Summary', value: '108 MWh', detail: 'Dispatch-ready storage fleet under monitoring' },
  { href: '/summaries/yield' as const, title: 'Yield Summary', value: '591 GWh', detail: 'Modeled annual energy generation outlook' },
  { href: '/summaries/capex' as const, title: 'CAPEX Summary', value: '$208M', detail: 'Portfolio EPC and energization capital snapshot' },
];

const operationsLinks = [
  {
    href: '/scada-live' as const,
    title: 'SCADA Live',
    detail: 'Live telemetry and availability trends',
  },
  {
    href: '/alarms' as const,
    title: 'Alarms',
    detail: 'Prioritized issues needing response',
  },
  {
    href: '/work-orders' as const,
    title: 'Work Orders',
    detail: 'Field execution drafts and sync queue',
  },
];

export default function DashboardScreen() {
  const { isOnline, pendingDraftCount } = useAppData();

  return (
    <Screen
      title="Dashboard"
      subtitle={`${APP_NAME} — ${APP_SUBTITLE}`}>
      <SectionCard eyebrow="Portfolio Health" title="Today at a glance">
        <View style={styles.heroHeader}>
          <Text style={styles.heroValue}>3 Active Projects</Text>
          <StatusBadge
            label={isOnline ? 'Online sync enabled' : 'Offline mode'}
            tone={isOnline ? 'success' : 'warning'}
          />
        </View>
        <Text style={styles.heroText}>
          {pendingDraftCount > 0
            ? `${pendingDraftCount} work-order draft${pendingDraftCount === 1 ? '' : 's'} waiting for sync.`
            : 'All saved work-order drafts are synced.'}
        </Text>
      </SectionCard>

      <ResponsiveCardGrid>
        {summaryLinks.map((summary) => (
          <Link href={summary.href} key={summary.title} asChild>
            <Pressable>
              <SectionCard eyebrow="Summary" title={summary.title}>
                <Text style={styles.cardValue}>{summary.value}</Text>
                <Text style={styles.cardDetail}>{summary.detail}</Text>
              </SectionCard>
            </Pressable>
          </Link>
        ))}
      </ResponsiveCardGrid>

      <SectionCard eyebrow="Operations" title="Live workflows">
        <View style={styles.list}>
          {operationsLinks.map((item) => (
            <Link href={item.href} key={item.title} asChild>
              <Pressable style={styles.listItem}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listDetail}>{item.detail}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </SectionCard>

      <SectionCard eyebrow="Projects" title="Recently updated">
        <View style={styles.list}>
          {projects.map((project) => (
            <Link
              href={{ pathname: '/projects/[id]', params: { id: project.id } }}
              key={project.id}
              asChild>
              <Pressable style={styles.projectItem}>
                <View style={styles.projectHeading}>
                  <Text style={styles.listTitle}>{project.name}</Text>
                  <StatusBadge
                    label={project.status}
                    tone={project.status === 'Construction' ? 'warning' : 'primary'}
                  />
                </View>
                <Text style={styles.listDetail}>
                  {project.location} • {project.capacityMw} MW PV • {project.bessMWh} MWh BESS
                </Text>
                <Text style={styles.updateText}>{project.lastUpdate}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  heroValue: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
  },
  heroText: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  cardValue: {
    color: palette.text,
    fontSize: 26,
    fontWeight: '700',
  },
  cardDetail: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    backgroundColor: palette.background,
    borderRadius: 18,
    gap: 4,
    padding: spacing.md,
  },
  listTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  listDetail: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  projectItem: {
    backgroundColor: palette.background,
    borderRadius: 18,
    gap: spacing.xs,
    padding: spacing.md,
  },
  projectHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  updateText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
