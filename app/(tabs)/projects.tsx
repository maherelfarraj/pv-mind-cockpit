import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ResponsiveCardGrid } from '@/components/ResponsiveCardGrid';
import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, spacing } from '@/constants/theme';
import { projects } from '@/data/mockData';

export default function ProjectsScreen() {
  return (
    <Screen title="Projects" subtitle="Track pipeline, engineering, construction, and commissioning milestones.">
      <ResponsiveCardGrid>
        {projects.map((project) => (
          <Link
            href={{ pathname: '/projects/[id]', params: { id: project.id } }}
            key={project.id}
            asChild>
          <Pressable>
              <SectionCard eyebrow={project.location} title={project.name}>
                <StatusBadge
                  label={project.status}
                  tone={project.status === 'Commissioning' ? 'success' : 'warning'}
                />
                <Text style={styles.metric}>
                  {project.capacityMw} MW PV • {project.bessMWh} MWh BESS
                </Text>
                <Text style={styles.detail}>
                  Yield {project.yieldGWh} GWh • CAPEX ${project.capexUsdM}M
                </Text>
                <Text style={styles.detail}>
                  {project.alarms} alarms • {project.workOrders} work orders • {project.lastUpdate}
                </Text>
              </SectionCard>
            </Pressable>
          </Link>
        ))}
      </ResponsiveCardGrid>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metric: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  detail: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
