import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Input,
  Card,
  MetricCard,
  SectionHeader,
  Colors,
  Spacing,
  Typography,
} from '@pvmind/ui';
import {
  sizePVSystem,
  sizeBESS,
  estimateCapex,
  generateSLD,
  formatValue,
  formatCurrency,
  type PVSizingInputs,
  type BESSInputs,
  type CapexInputs,
} from '@pvmind/calc-engine';

type DesignTab = 'pv' | 'bess' | 'capex' | 'sld';

export default function DesignScreen() {
  const [activeTab, setActiveTab] = useState<DesignTab>('pv');
  const [hasBESS, setHasBESS] = useState(true);

  // PV inputs
  const [pvInputs, setPVInputs] = useState<Partial<Record<keyof PVSizingInputs, string>>>({});

  // BESS inputs
  const [bessInputs, setBESSInputs] = useState<Partial<Record<keyof BESSInputs, string>>>({});

  // CAPEX inputs
  const [capexInputs, setCapexInputs] = useState<Partial<Record<keyof CapexInputs, string>>>({});

  const parsedPV = parsePVInputs(pvInputs);
  const parsedBESS = parseBESSInputs(bessInputs);

  const pvResult = sizePVSystem(parsedPV);
  const bessResult = hasBESS ? sizeBESS(parsedBESS) : null;
  const capexResult = estimateCapex({
    ...parseCapexInputs(capexInputs),
    arrayKWp: pvResult.arrayPowerKWp ?? undefined,
    bessKWh: bessResult?.grossCapacityKWh ?? undefined,
  });
  const sldData = generateSLD({
    stringsCount: parsedPV.strings ?? 0,
    inverterCount: 1,
    inverterRatingKW: pvResult.inverterCapacityKW ?? undefined,
    transformerCount: 1,
    transformerRatingKVA: (pvResult.inverterCapacityKW ?? 0) * 1.1,
    hasBESS,
    bessRatingKW: bessResult?.peakPowerKW ?? undefined,
  });

  const handleSave = useCallback(() => {
    // Persist to Supabase via repository layer
    // Actual save logic plugged in when Supabase is configured
    console.info('[Design] Save triggered — connect Supabase to persist.');
  }, [pvResult, bessResult]);

  const setPVField = (key: keyof PVSizingInputs) => (val: string) => {
    setPVInputs((prev) => ({ ...prev, [key]: val }));
  };

  const setBESSField = (key: keyof BESSInputs) => (val: string) => {
    setBESSInputs((prev) => ({ ...prev, [key]: val }));
  };

  const setCapexField = (key: keyof CapexInputs) => (val: string) => {
    setCapexInputs((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {DESIGN_TABS.map((tab) => (
          <Button
            key={tab.id}
            label={tab.label}
            onPress={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            size="sm"
          />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* ─── PV Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'pv' && (
          <>
            <SectionHeader title="PV System Sizing" subtitle="Enter system parameters to compute sizing" />

            <Input
              label="Daily Load"
              value={pvInputs.dailyLoadKWh ?? ''}
              onChangeText={setPVField('dailyLoadKWh')}
              unit="kWh/day"
              keyboardType="numeric"
              required
              hint="Total daily AC energy demand"
            />
            <Input
              label="Peak Sun Hours"
              value={pvInputs.peakSunHours ?? ''}
              onChangeText={setPVField('peakSunHours')}
              unit="h/day"
              keyboardType="numeric"
              required
              hint="Average daily peak sun hours at site"
            />
            <Input
              label="System Efficiency"
              value={pvInputs.systemEfficiency ?? ''}
              onChangeText={setPVField('systemEfficiency')}
              unit="(0–1)"
              keyboardType="numeric"
              hint="Combined losses factor e.g. 0.80"
            />
            <Input
              label="Module Power"
              value={pvInputs.modulePowerWp ?? ''}
              onChangeText={setPVField('modulePowerWp')}
              unit="Wp"
              keyboardType="numeric"
              hint="Rated STC module power"
            />
            <Input
              label="Module Area"
              value={pvInputs.moduleAreaM2 ?? ''}
              onChangeText={setPVField('moduleAreaM2')}
              unit="m²"
              keyboardType="numeric"
            />
            <Input
              label="Modules per String"
              value={pvInputs.modulesPerString ?? ''}
              onChangeText={setPVField('modulesPerString')}
              keyboardType="numeric"
            />
            <Input
              label="Number of Strings"
              value={pvInputs.strings ?? ''}
              onChangeText={setPVField('strings')}
              keyboardType="numeric"
            />

            <SectionHeader title="Results" style={styles.resultsHeader} />
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Array Power"
                value={pvResult.arrayPowerKWp}
                unit="kWp"
                style={styles.metricCard}
              />
              <MetricCard
                label="Module Count"
                value={pvResult.moduleCount}
                decimals={0}
                style={styles.metricCard}
              />
              <MetricCard
                label="Inverter Capacity"
                value={pvResult.inverterCapacityKW}
                unit="kW"
                style={styles.metricCard}
              />
              <MetricCard
                label="Annual Production"
                value={pvResult.annualProductionMWh}
                unit="MWh/yr"
                style={styles.metricCard}
              />
              <MetricCard
                label="Array Area"
                value={pvResult.totalArrayAreaM2}
                unit="m²"
                style={styles.metricCard}
              />
              <MetricCard
                label="DC/AC Ratio"
                value={pvResult.dcAcRatio}
                decimals={3}
                style={styles.metricCard}
              />
            </View>
          </>
        )}

        {/* ─── BESS Tab ────────────────────────────────────────────────── */}
        {activeTab === 'bess' && (
          <>
            <View style={styles.switchRow}>
              <SectionHeader title="BESS Sizing" style={styles.switchHeader} />
              <View style={styles.switchControl}>
                <Text style={styles.switchLabel}>Include BESS</Text>
                <Switch
                  value={hasBESS}
                  onValueChange={setHasBESS}
                  trackColor={{ true: Colors.primary, false: Colors.border }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>

            {hasBESS && (
              <>
                <Input
                  label="Required Energy"
                  value={bessInputs.requiredEnergyKWh ?? ''}
                  onChangeText={setBESSField('requiredEnergyKWh')}
                  unit="kWh"
                  keyboardType="numeric"
                  required
                />
                <Input
                  label="Depth of Discharge (DoD)"
                  value={bessInputs.dod ?? ''}
                  onChangeText={setBESSField('dod')}
                  unit="(0–1)"
                  keyboardType="numeric"
                  hint="e.g. 0.90 for 90%"
                />
                <Input
                  label="Round-Trip Efficiency"
                  value={bessInputs.roundTripEfficiency ?? ''}
                  onChangeText={setBESSField('roundTripEfficiency')}
                  unit="(0–1)"
                  keyboardType="numeric"
                  hint="e.g. 0.92"
                />
                <Input
                  label="Backup Duration"
                  value={bessInputs.backupHours ?? ''}
                  onChangeText={setBESSField('backupHours')}
                  unit="hours"
                  keyboardType="numeric"
                />
                <Input
                  label="Cell Voltage"
                  value={bessInputs.nominalVoltageV ?? ''}
                  onChangeText={setBESSField('nominalVoltageV')}
                  unit="V"
                  keyboardType="numeric"
                />
                <Input
                  label="Cell Capacity"
                  value={bessInputs.nominalCapacityAh ?? ''}
                  onChangeText={setBESSField('nominalCapacityAh')}
                  unit="Ah"
                  keyboardType="numeric"
                />
                <Input
                  label="Cells in Series"
                  value={bessInputs.seriesCount ?? ''}
                  onChangeText={setBESSField('seriesCount')}
                  keyboardType="numeric"
                />
                <Input
                  label="Parallel Strings"
                  value={bessInputs.parallelCount ?? ''}
                  onChangeText={setBESSField('parallelCount')}
                  keyboardType="numeric"
                />

                <SectionHeader title="Results" style={styles.resultsHeader} />
                <View style={styles.metricsGrid}>
                  <MetricCard
                    label="Gross Capacity"
                    value={bessResult?.grossCapacityKWh}
                    unit="kWh"
                    style={styles.metricCard}
                  />
                  <MetricCard
                    label="Usable Energy"
                    value={bessResult?.usableEnergyKWh}
                    unit="kWh"
                    style={styles.metricCard}
                  />
                  <MetricCard
                    label="Peak Power"
                    value={bessResult?.peakPowerKW}
                    unit="kW"
                    style={styles.metricCard}
                  />
                  <MetricCard
                    label="System Voltage"
                    value={bessResult?.systemVoltageV}
                    unit="V"
                    style={styles.metricCard}
                  />
                  <MetricCard
                    label="Cell Count"
                    value={bessResult?.totalCellCount}
                    decimals={0}
                    style={styles.metricCard}
                  />
                  <MetricCard
                    label="C-Rate"
                    value={bessResult?.cRate}
                    decimals={3}
                    style={styles.metricCard}
                  />
                </View>
              </>
            )}
          </>
        )}

        {/* ─── CAPEX Tab ───────────────────────────────────────────────── */}
        {activeTab === 'capex' && (
          <>
            <SectionHeader title="CAPEX Estimate" subtitle="System cost breakdown" />

            <Input
              label="Module Cost"
              value={capexInputs.moduleCostUSDWp ?? ''}
              onChangeText={setCapexField('moduleCostUSDWp')}
              unit="USD/Wp"
              keyboardType="numeric"
              hint="e.g. 0.30"
            />
            <Input
              label="Inverter Cost"
              value={capexInputs.inverterCostUSDKW ?? ''}
              onChangeText={setCapexField('inverterCostUSDKW')}
              unit="USD/kW"
              keyboardType="numeric"
              hint="e.g. 80"
            />
            {hasBESS && (
              <Input
                label="BESS Cost"
                value={capexInputs.bessCostUSDKWh ?? ''}
                onChangeText={setCapexField('bessCostUSDKWh')}
                unit="USD/kWh"
                keyboardType="numeric"
                hint="e.g. 200"
              />
            )}
            <Input
              label="BOS Factor"
              value={capexInputs.bosFraction ?? ''}
              onChangeText={setCapexField('bosFraction')}
              unit="(0–1)"
              keyboardType="numeric"
              hint="Balance of system as fraction of hardware e.g. 0.25"
            />
            <Input
              label="EPC Margin"
              value={capexInputs.epcMarginFraction ?? ''}
              onChangeText={setCapexField('epcMarginFraction')}
              unit="(0–1)"
              keyboardType="numeric"
              hint="EPC contractor margin e.g. 0.15"
            />
            <Input
              label="Contingency"
              value={capexInputs.contingencyFraction ?? ''}
              onChangeText={setCapexField('contingencyFraction')}
              unit="(0–1)"
              keyboardType="numeric"
              hint="e.g. 0.05"
            />

            <SectionHeader title="Cost Breakdown" style={styles.resultsHeader} />
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Module Cost"
                value={formatCurrency(capexResult.moduleCostUSD)}
                style={styles.metricCard}
              />
              <MetricCard
                label="Inverter Cost"
                value={formatCurrency(capexResult.inverterCostUSD)}
                style={styles.metricCard}
              />
              {hasBESS && (
                <MetricCard
                  label="BESS Cost"
                  value={formatCurrency(capexResult.bessCostUSD)}
                  style={styles.metricCard}
                />
              )}
              <MetricCard
                label="BOS Cost"
                value={formatCurrency(capexResult.bosCostUSD)}
                style={styles.metricCard}
              />
              <MetricCard
                label="EPC Margin"
                value={formatCurrency(capexResult.epcMarginUSD)}
                style={styles.metricCard}
              />
              <MetricCard
                label="Total CAPEX"
                value={formatCurrency(capexResult.totalCapexUSD)}
                color={Colors.accent}
                style={styles.metricCard}
              />
              <MetricCard
                label="Specific CAPEX"
                value={formatValue(capexResult.specificCapexUSDKWp, 'USD/Wp', 3)}
                style={styles.metricCard}
              />
            </View>
          </>
        )}

        {/* ─── SLD Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'sld' && (
          <>
            <SectionHeader title="Single-Line Diagram" subtitle="Auto-generated from design parameters" />
            <Card style={styles.sldCard}>
              {sldData.components.length === 0 ? (
                <Text style={styles.sldPlaceholderText}>
                  Enter PV and BESS parameters in the Design and BESS tabs to generate the SLD.
                </Text>
              ) : (
                <>
                  <Text style={styles.sldTitle}>System Components ({sldData.components.length})</Text>
                  {sldData.components.map((c) => (
                    <View key={c.id} style={styles.sldRow}>
                      <View style={[styles.sldTypeBadge, { backgroundColor: getSLDColor(c.type) + '33' }]}>
                        <Text style={[styles.sldType, { color: getSLDColor(c.type) }]}>{c.type.replace('_', ' ')}</Text>
                      </View>
                      <Text style={styles.sldLabel}>{c.label}</Text>
                      {c.ratingKW != null && (
                        <Text style={styles.sldRating}>{c.ratingKW.toFixed(1)} kW</Text>
                      )}
                    </View>
                  ))}
                  <Text style={[styles.sldTitle, { marginTop: Spacing.base }]}>
                    Connections ({sldData.connections.length})
                  </Text>
                  {sldData.connections.map((conn, i) => (
                    <Text key={i} style={styles.sldConnection}>
                      {conn.from} → {conn.to}
                    </Text>
                  ))}
                </>
              )}
            </Card>
          </>
        )}

        <Button
          label="Save Design"
          onPress={handleSave}
          variant="primary"
          fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parsePVInputs(raw: Partial<Record<string, string>>): Partial<PVSizingInputs> {
  return {
    dailyLoadKWh: parseOptionalFloat(raw['dailyLoadKWh']),
    peakSunHours: parseOptionalFloat(raw['peakSunHours']),
    systemEfficiency: parseOptionalFloat(raw['systemEfficiency']),
    modulePowerWp: parseOptionalFloat(raw['modulePowerWp']),
    moduleAreaM2: parseOptionalFloat(raw['moduleAreaM2']),
    modulesPerString: parseOptionalFloat(raw['modulesPerString']),
    strings: parseOptionalFloat(raw['strings']),
  };
}

function parseBESSInputs(raw: Partial<Record<string, string>>): Partial<BESSInputs> {
  return {
    requiredEnergyKWh: parseOptionalFloat(raw['requiredEnergyKWh']),
    dod: parseOptionalFloat(raw['dod']),
    roundTripEfficiency: parseOptionalFloat(raw['roundTripEfficiency']),
    backupHours: parseOptionalFloat(raw['backupHours']),
    nominalVoltageV: parseOptionalFloat(raw['nominalVoltageV']),
    nominalCapacityAh: parseOptionalFloat(raw['nominalCapacityAh']),
    seriesCount: parseOptionalFloat(raw['seriesCount']),
    parallelCount: parseOptionalFloat(raw['parallelCount']),
  };
}

function parseCapexInputs(raw: Partial<Record<string, string>>): Partial<CapexInputs> {
  return {
    moduleCostUSDWp: parseOptionalFloat(raw['moduleCostUSDWp']),
    inverterCostUSDKW: parseOptionalFloat(raw['inverterCostUSDKW']),
    bessCostUSDKWh: parseOptionalFloat(raw['bessCostUSDKWh']),
    bosFraction: parseOptionalFloat(raw['bosFraction']),
    epcMarginFraction: parseOptionalFloat(raw['epcMarginFraction']),
    contingencyFraction: parseOptionalFloat(raw['contingencyFraction']),
  };
}

function parseOptionalFloat(val: string | undefined): number | undefined {
  if (!val || val.trim() === '') return undefined;
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

function getSLDColor(type: string): string {
  const map: Record<string, string> = {
    module: Colors.warning,
    string_combiner: Colors.accent,
    inverter: Colors.primary,
    transformer: Colors.info,
    meter: Colors.textSecondary,
    battery: Colors.success,
    bms: Colors.accent,
    pcs: Colors.primaryLight,
    grid: Colors.error,
  };
  return map[type] ?? Colors.textMuted;
}

const DESIGN_TABS: { id: DesignTab; label: string }[] = [
  { id: 'pv', label: 'PV' },
  { id: 'bess', label: 'BESS' },
  { id: 'capex', label: 'CAPEX' },
  { id: 'sld', label: 'SLD' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  tabBar: {
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  resultsHeader: { marginTop: Spacing.xl },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: { width: '47%' },
  saveBtn: { marginTop: Spacing.xl },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchHeader: { flex: 1 },
  switchControl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  switchLabel: { color: Colors.textSecondary, fontSize: Typography.fontSizeSm },
  sldCard: { minHeight: 200 },
  sldPlaceholderText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeSm,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  sldTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  sldTypeBadge: {
    borderRadius: 4,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  sldType: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightMedium },
  sldLabel: { flex: 1, color: Colors.textPrimary, fontSize: Typography.fontSizeSm },
  sldRating: { color: Colors.textMuted, fontSize: Typography.fontSizeXs },
  sldConnection: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXs,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});
