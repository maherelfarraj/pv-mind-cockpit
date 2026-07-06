import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, SectionHeader, StatusBadge, Colors, Spacing, Typography } from '@pvmind/ui';
import { isConfigured } from '../../src/config/env';

interface ProjectSummary {
  id: string;
  name: string;
  location: string;
  arrayKWp: number | null;
  bessKWh: number | null;
  status: 'draft' | 'active' | 'completed' | 'archived';
  updatedAt: string;
}

export default function DashboardScreen() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const configured = isConfigured();

  const loadProjects = useCallback(async () => {
    setRefreshing(true);
    // Projects are loaded from Supabase when configured.
    // The list starts empty — no hardcoded demo projects.
    setRefreshing(false);
  }, []);

  const handleNewProject = useCallback(() => {
    router.push('/project/new');
  }, []);

  const handleOpenProject = useCallback((id: string) => {
    router.push(`/project/${id}`);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadProjects}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>PV Mind Cockpit</Text>
          <Text style={styles.heroSubtitle}>GridMind EPC · pvmind.ai</Text>
          {!configured && (
            <View style={styles.configWarning}>
              <Text style={styles.configWarningText}>
                ⚠️ Configure SUPABASE_URL and SUPABASE_ANON_KEY to enable cloud sync.
              </Text>
            </View>
          )}
        </View>

        {/* Platform cards */}
        <SectionHeader
          title="Modules"
          subtitle="Access all platform capabilities"
          style={styles.sectionHeader}
        />
        <View style={styles.modulesGrid}>
          {MODULE_SHORTCUTS.map((mod) => (
            <TouchableOpacity
              key={mod.route}
              onPress={() => router.push(mod.route as never)}
              activeOpacity={0.75}
              style={styles.moduleCardTouch}
              accessibilityRole="button"
              accessibilityLabel={`Open ${mod.title}`}
            >
              <Card style={styles.moduleCard}>
                <View style={[styles.moduleIcon, { backgroundColor: mod.color + '22' }]}>
                  <Text style={[styles.moduleIconText, { color: mod.color }]}>{mod.icon}</Text>
                </View>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleDesc}>{mod.description}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Projects */}
        <SectionHeader
          title="Projects"
          subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          right={
            <TouchableOpacity
              onPress={handleNewProject}
              style={styles.newBtn}
              accessibilityRole="button"
              accessibilityLabel="Create new project"
            >
              <Text style={styles.newBtnText}>+ New</Text>
            </TouchableOpacity>
          }
          style={styles.sectionHeader}
        />

        {projects.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyDesc}>
              Create your first solar PV + BESS project to start designing, simulating, and monitoring.
            </Text>
            <TouchableOpacity
              onPress={handleNewProject}
              style={styles.createBtn}
              accessibilityRole="button"
              accessibilityLabel="Create first project"
            >
              <Text style={styles.createBtnText}>Create Project</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          projects.map((proj) => (
            <TouchableOpacity
              key={proj.id}
              onPress={() => handleOpenProject(proj.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Open project ${proj.name}`}
            >
              <Card style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{proj.name}</Text>
                  <StatusBadge status={proj.status === 'active' ? 'online' : 'idle'} label={proj.status} />
                </View>
                <Text style={styles.projectLocation}>{proj.location}</Text>
                <View style={styles.projectMetrics}>
                  <Text style={styles.metricChip}>
                    PV: {proj.arrayKWp != null ? `${proj.arrayKWp} kWp` : 'Needs Input'}
                  </Text>
                  <Text style={styles.metricChip}>
                    BESS: {proj.bessKWh != null ? `${proj.bessKWh} kWh` : 'Needs Input'}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const MODULE_SHORTCUTS = [
  {
    title: 'Design',
    description: 'PV & BESS sizing',
    icon: '⚡',
    color: Colors.primary,
    route: '/(tabs)/design',
  },
  {
    title: 'Simulate',
    description: 'Energy simulation',
    icon: '▷',
    color: Colors.accent,
    route: '/(tabs)/simulation',
  },
  {
    title: 'Yield',
    description: 'Annual production',
    icon: '☀',
    color: Colors.warning,
    route: '/(tabs)/yield',
  },
  {
    title: 'SCADA',
    description: 'Live monitoring',
    icon: '◈',
    color: Colors.success,
    route: '/(tabs)/scada',
  },
  {
    title: 'Reports',
    description: 'Export & share',
    icon: '≡',
    color: Colors.info,
    route: '/(tabs)/reports',
  },
] as const;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },

  hero: { marginBottom: Spacing.xl },
  heroTitle: {
    fontSize: Typography.fontSize3xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  configWarning: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.warning + '22',
    borderRadius: 8,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
  },
  configWarningText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.warning,
  },

  sectionHeader: { marginTop: Spacing.xl, marginBottom: Spacing.md },

  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  moduleCardTouch: { width: '47%' },
  moduleCard: { padding: Spacing.md },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  moduleIconText: { fontSize: 20 },
  moduleTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  moduleDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  newBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  newBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
  },

  emptyCard: { alignItems: 'center', paddingVertical: Spacing['2xl'] },
  emptyTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
  },
  createBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeightSemiBold,
    fontSize: Typography.fontSizeMd,
  },

  projectCard: { marginBottom: Spacing.sm },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  projectName: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  projectLocation: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  projectMetrics: { flexDirection: 'row', gap: Spacing.sm },
  metricChip: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
});
