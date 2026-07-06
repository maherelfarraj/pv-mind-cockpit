import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  SectionHeader,
  MetricCard,
  Colors,
  Spacing,
  Typography,
} from '@pvmind/ui';
import { formatValue, formatCurrency } from '@pvmind/calc-engine';

type ReportSection =
  | 'executive'
  | 'design'
  | 'simulation'
  | 'yield'
  | 'capex'
  | 'bom'
  | 'environmental';

interface ReportConfig {
  section: ReportSection;
  label: string;
  description: string;
  enabled: boolean;
}

export default function ReportsScreen() {
  const [sections, setSections] = useState<ReportConfig[]>(REPORT_SECTIONS);
  const [generating, setGenerating] = useState(false);

  const toggleSection = useCallback((s: ReportSection) => {
    setSections((prev) =>
      prev.map((r) => (r.section === s ? { ...r, enabled: !r.enabled } : r)),
    );
  }, []);

  const generateReport = useCallback(async () => {
    const enabled = sections.filter((s) => s.enabled);
    if (enabled.length === 0) return;

    setGenerating(true);
    await new Promise<void>((r) => setTimeout(r, 1200));

    // Build report text (replace with PDF generation in production)
    const reportLines = [
      'PV MIND COCKPIT — PROJECT REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Domain: pvmind.ai`,
      '',
      'SECTIONS INCLUDED:',
      ...enabled.map((s) => `  • ${s.label}`),
      '',
      'NOTE: Connect a project to generate a data-populated report.',
    ];

    setGenerating(false);

    await Share.share({
      title: 'PV Mind Cockpit Report',
      message: reportLines.join('\n'),
    }).catch(() => {
      // User dismissed share sheet — no action needed
    });
  }, [sections]);

  const enabledCount = sections.filter((s) => s.enabled).length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionHeader
          title="Reports"
          subtitle="Configure and export project reports"
        />

        {/* Report Configuration */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Report Sections</Text>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.section}
              style={styles.sectionRow}
              onPress={() => toggleSection(section.section)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityLabel={section.label}
              accessibilityState={{ checked: section.enabled }}
            >
              <View style={[styles.checkbox, section.enabled && styles.checkboxChecked]}>
                {section.enabled && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionLabel}>{section.label}</Text>
                <Text style={styles.sectionDesc}>{section.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Report Formats */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Export Format</Text>
          <View style={styles.formatRow}>
            {REPORT_FORMATS.map((fmt) => (
              <View key={fmt.id} style={styles.formatChip}>
                <Text style={styles.formatIcon}>{fmt.icon}</Text>
                <Text style={styles.formatLabel}>{fmt.label}</Text>
                <Text style={styles.formatStatus}>{fmt.status}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Project Summary Preview */}
        <SectionHeader title="Summary Preview" style={styles.sectionHeader} />
        <Card>
          <Text style={styles.previewNote}>
            Connect a project to populate the report with real data. All metrics will show{' '}
            <Text style={styles.needsInputText}>Needs Input</Text> until design parameters are saved.
          </Text>
          <View style={styles.metricsGrid}>
            <MetricCard label="Array Capacity" value={null} unit="kWp" style={styles.metricCard} />
            <MetricCard label="BESS Capacity" value={null} unit="kWh" style={styles.metricCard} />
            <MetricCard label="Annual Yield" value={null} unit="MWh/yr" style={styles.metricCard} />
            <MetricCard label="Total CAPEX" value={null} unit="USD" style={styles.metricCard} />
            <MetricCard label="Specific Yield" value={null} unit="kWh/kWp" style={styles.metricCard} />
            <MetricCard label="CO₂ Avoided" value={null} unit="t/yr" style={styles.metricCard} />
          </View>
        </Card>

        {/* Generate Button */}
        <Button
          label={
            generating
              ? 'Generating Report…'
              : `Generate Report (${enabledCount} section${enabledCount !== 1 ? 's' : ''})`
          }
          onPress={generateReport}
          variant="primary"
          disabled={enabledCount === 0 || generating}
          loading={generating}
          fullWidth
          style={styles.generateBtn}
        />

        {enabledCount === 0 && (
          <Text style={styles.hintText}>Select at least one section to generate a report.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const REPORT_SECTIONS: ReportConfig[] = [
  {
    section: 'executive',
    label: 'Executive Summary',
    description: 'Project overview, KPIs and key findings',
    enabled: true,
  },
  {
    section: 'design',
    label: 'System Design',
    description: 'PV array, BESS sizing and SLD',
    enabled: true,
  },
  {
    section: 'simulation',
    label: 'Simulation Results',
    description: 'Energy flow, losses and performance',
    enabled: true,
  },
  {
    section: 'yield',
    label: 'Yield Analysis',
    description: 'Annual and monthly production',
    enabled: true,
  },
  {
    section: 'capex',
    label: 'CAPEX Breakdown',
    description: 'Cost estimate and BoQ summary',
    enabled: false,
  },
  {
    section: 'bom',
    label: 'Bill of Materials',
    description: 'Component list with quantities',
    enabled: false,
  },
  {
    section: 'environmental',
    label: 'Environmental Impact',
    description: 'CO₂ avoided and green energy metrics',
    enabled: false,
  },
];

const REPORT_FORMATS = [
  { id: 'pdf', icon: '📄', label: 'PDF', status: 'Ready' },
  { id: 'xlsx', icon: '📊', label: 'Excel', status: 'Ready' },
  { id: 'json', icon: '{ }', label: 'JSON', status: 'API' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  card: { marginBottom: Spacing.base },
  cardTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '55',
    gap: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  sectionInfo: { flex: 1 },
  sectionLabel: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
  },
  sectionDesc: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  formatRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  formatChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    alignItems: 'center',
    minWidth: 70,
    gap: 2,
  },
  formatIcon: { fontSize: 20 },
  formatLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
  },
  formatStatus: {
    fontSize: Typography.fontSizeXs,
    color: Colors.accent,
  },
  sectionHeader: { marginTop: Spacing.sm },
  previewNote: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
    lineHeight: 20,
  },
  needsInputText: {
    color: Colors.needsInput,
    fontStyle: 'italic',
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: { width: '47%' },
  generateBtn: { marginTop: Spacing.xl },
  hintText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
