import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Input,
  Card,
  MetricCard,
  SectionHeader,
  StatusBadge,
  Colors,
  Spacing,
  Typography,
} from '@pvmind/ui';
import {
  calculateYield,
  sizePVSystem,
  NEEDS_INPUT,
  formatValue,
  type YieldInputs,
  type PVSizingInputs,
} from '@pvmind/calc-engine';

type SimStatus = 'idle' | 'running' | 'complete' | 'error';

export default function SimulationScreen() {
  const [status, setStatus] = useState<SimStatus>('idle');

  // PV inputs for simulation
  const [arrayKWp, setArrayKWp] = useState('');
  const [peakSunHours, setPeakSunHours] = useState('');
  const [performanceRatio, setPerformanceRatio] = useState('');
  const [annualPOA, setAnnualPOA] = useState('');
  const [tempCoeff, setTempCoeff] = useState('-0.004');
  const [avgTempRise, setAvgTempRise] = useState('20');

  const [results, setResults] = useState<ReturnType<typeof calculateYield> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runSimulation = useCallback(async () => {
    setStatus('running');
    setErrorMsg(null);

    // Simulate async computation (would call backend in production)
    await new Promise<void>((resolve) => setTimeout(resolve, 800));

    try {
      const inputs: Partial<YieldInputs> = {
        arrayKWp: parseOptionalFloat(arrayKWp),
        annualPoaKWhM2: parseOptionalFloat(annualPOA),
        performanceRatio: parseOptionalFloat(performanceRatio),
        tempCoefficientPct: parseOptionalFloat(tempCoeff),
        avgTempRiseAboveStcC: parseOptionalFloat(avgTempRise),
      };

      const r = calculateYield(inputs);
      setResults(r);
      setStatus('complete');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }, [arrayKWp, annualPOA, performanceRatio, tempCoeff, avgTempRise]);

  const resetSimulation = useCallback(() => {
    setStatus('idle');
    setResults(null);
    setErrorMsg(null);
  }, []);

  const hasRequiredInputs =
    arrayKWp.trim() !== '' &&
    (annualPOA.trim() !== '' || peakSunHours.trim() !== '') &&
    performanceRatio.trim() !== '';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionHeader
          title="Energy Simulation"
          subtitle="Compute annual energy yield from PV parameters"
          right={
            status === 'complete' ? (
              <StatusBadge status="online" label="Complete" />
            ) : status === 'running' ? (
              <StatusBadge status="info" label="Running" />
            ) : null
          }
        />

        {/* Inputs */}
        <Card style={styles.inputCard}>
          <Text style={styles.cardTitle}>PV Array Parameters</Text>
          <Input
            label="Array Capacity"
            value={arrayKWp}
            onChangeText={setArrayKWp}
            unit="kWp"
            keyboardType="numeric"
            required
            hint="DC nameplate capacity"
          />
          <Input
            label="Annual POA Irradiance"
            value={annualPOA}
            onChangeText={setAnnualPOA}
            unit="kWh/m²/yr"
            keyboardType="numeric"
            required
            hint="Plane-of-array annual irradiation"
          />
          <Input
            label="Performance Ratio"
            value={performanceRatio}
            onChangeText={setPerformanceRatio}
            unit="(0–1)"
            keyboardType="numeric"
            required
            hint="System performance ratio e.g. 0.82"
          />
          <Input
            label="Temp. Coefficient"
            value={tempCoeff}
            onChangeText={setTempCoeff}
            unit="%/°C"
            keyboardType="numeric"
            hint="Module Pmax temp coefficient e.g. -0.004"
          />
          <Input
            label="Avg. Temp Rise Above STC"
            value={avgTempRise}
            onChangeText={setAvgTempRise}
            unit="°C"
            keyboardType="numeric"
            hint="Average module temperature rise above 25°C"
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            label={status === 'running' ? 'Simulating…' : 'Run Simulation'}
            onPress={runSimulation}
            variant="primary"
            disabled={!hasRequiredInputs || status === 'running'}
            loading={status === 'running'}
            style={styles.runBtn}
          />
          {(status === 'complete' || status === 'error') && (
            <Button
              label="Reset"
              onPress={resetSimulation}
              variant="secondary"
              style={styles.resetBtn}
            />
          )}
        </View>

        {!hasRequiredInputs && status === 'idle' && (
          <Text style={styles.hintText}>Fill in required fields above to run simulation.</Text>
        )}

        {/* Error */}
        {status === 'error' && errorMsg && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>Simulation failed: {errorMsg}</Text>
          </Card>
        )}

        {/* Results */}
        {status === 'complete' && results && (
          <>
            <SectionHeader title="Simulation Results" style={styles.resultsHeader} />
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Annual AC Energy"
                value={results.annualACMWh}
                unit="MWh/yr"
                color={Colors.accent}
                style={styles.metricCard}
              />
              <MetricCard
                label="Specific Yield"
                value={results.specificYieldKWhKWp}
                unit="kWh/kWp"
                style={styles.metricCard}
              />
              <MetricCard
                label="Capacity Factor"
                value={
                  results.capacityFactor !== null
                    ? results.capacityFactor * 100
                    : null
                }
                unit="%"
                style={styles.metricCard}
              />
              <MetricCard
                label="Temp-Corrected PR"
                value={results.tempCorrectedPR}
                decimals={3}
                style={styles.metricCard}
              />
              <MetricCard
                label="CO₂ Avoided"
                value={results.co2AvoidedTonnes}
                unit="t CO₂/yr"
                color={Colors.success}
                style={styles.metricCard}
              />
              <MetricCard
                label="Full Load Hours"
                value={results.fullLoadHours}
                unit="h/yr"
                style={styles.metricCard}
              />
            </View>

            <Button
              label="Save Simulation"
              onPress={() => {
                // Persist to Supabase via repository layer
                console.info('[Simulation] Save triggered');
              }}
              variant="secondary"
              fullWidth
              style={styles.saveBtn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function parseOptionalFloat(val: string): number | undefined {
  if (!val || val.trim() === '') return undefined;
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  inputCard: { marginBottom: Spacing.base },
  cardTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  runBtn: { flex: 1 },
  resetBtn: {},
  hintText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  errorCard: {
    backgroundColor: Colors.error + '22',
    borderColor: Colors.error + '44',
    marginBottom: Spacing.base,
  },
  errorText: { color: Colors.error, fontSize: Typography.fontSizeSm },
  resultsHeader: { marginTop: Spacing.xl },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: { width: '47%' },
  saveBtn: { marginTop: Spacing.lg },
});
