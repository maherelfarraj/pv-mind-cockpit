import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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
  calculateYield,
  monthlyEnergyDistribution,
  estimatePOA,
  type YieldInputs,
} from '@pvmind/calc-engine';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Default monthly GHI fractions (typical mid-latitude site)
const DEFAULT_MONTHLY_FRACTIONS = [0.055, 0.063, 0.092, 0.095, 0.099, 0.095, 0.098, 0.097, 0.090, 0.080, 0.062, 0.074];

export default function YieldScreen() {
  const [arrayKWp, setArrayKWp] = useState('');
  const [annualPOA, setAnnualPOA] = useState('');
  const [performanceRatio, setPerformanceRatio] = useState('0.82');
  const [latitude, setLatitude] = useState('');
  const [tiltDeg, setTiltDeg] = useState('');
  const [ghiKWh, setGhiKWh] = useState('');
  const [calculated, setCalculated] = useState(false);

  const parsedInputs: Partial<YieldInputs> = {
    arrayKWp: parseF(arrayKWp),
    annualPoaKWhM2: parseF(annualPOA),
    performanceRatio: parseF(performanceRatio),
  };

  const result = calculated ? calculateYield(parsedInputs) : null;

  const poaEstimate =
    ghiKWh && latitude && tiltDeg
      ? estimatePOA(parseF(ghiKWh) ?? 0, parseF(tiltDeg) ?? 0, parseF(latitude) ?? 0)
      : null;

  const monthlyMWh =
    result
      ? monthlyEnergyDistribution(result.annualACMWh, DEFAULT_MONTHLY_FRACTIONS)
      : null;

  const maxMonthly = monthlyMWh
    ? Math.max(...monthlyMWh.filter((v): v is number => v !== null))
    : 1;

  const handleCalculate = useCallback(() => {
    setCalculated(true);
  }, []);

  const handleReset = useCallback(() => {
    setCalculated(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionHeader
          title="Yield Analysis"
          subtitle="Annual and monthly energy production"
        />

        {/* POA Estimator */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>POA Irradiance Estimator</Text>
          <Input
            label="Annual GHI"
            value={ghiKWh}
            onChangeText={setGhiKWh}
            unit="kWh/m²/yr"
            keyboardType="numeric"
            hint="Global Horizontal Irradiance"
          />
          <Input
            label="Site Latitude"
            value={latitude}
            onChangeText={setLatitude}
            unit="°"
            keyboardType="numeric"
          />
          <Input
            label="Tilt Angle"
            value={tiltDeg}
            onChangeText={setTiltDeg}
            unit="°"
            keyboardType="numeric"
          />
          {poaEstimate && (
            <View style={styles.poaRow}>
              <MetricCard
                label="Optimal Tilt"
                value={poaEstimate.optimalTiltDeg}
                unit="°"
                style={styles.poaMini}
              />
              <MetricCard
                label="Trans. Factor"
                value={poaEstimate.transpositionFactor}
                decimals={3}
                style={styles.poaMini}
              />
              <MetricCard
                label="POA"
                value={poaEstimate.poaKWhM2Day}
                unit="kWh/m²/d"
                style={styles.poaMini}
              />
            </View>
          )}
        </Card>

        {/* Yield Inputs */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>System Parameters</Text>
          <Input
            label="Array Capacity"
            value={arrayKWp}
            onChangeText={setArrayKWp}
            unit="kWp"
            keyboardType="numeric"
            required
          />
          <Input
            label="Annual POA"
            value={annualPOA}
            onChangeText={setAnnualPOA}
            unit="kWh/m²/yr"
            keyboardType="numeric"
            required
            hint={poaEstimate?.poaKWhM2Day ? `Estimated: ${(poaEstimate.poaKWhM2Day * 365).toFixed(0)} kWh/m²/yr` : undefined}
          />
          <Input
            label="Performance Ratio"
            value={performanceRatio}
            onChangeText={setPerformanceRatio}
            unit="(0–1)"
            keyboardType="numeric"
            required
          />
        </Card>

        <View style={styles.actionRow}>
          <Button
            label="Calculate Yield"
            onPress={handleCalculate}
            variant="primary"
            disabled={!arrayKWp || !annualPOA || !performanceRatio}
            style={styles.calcBtn}
          />
          {calculated && (
            <Button label="Reset" onPress={handleReset} variant="secondary" />
          )}
        </View>

        {/* Results */}
        {result && (
          <>
            <SectionHeader title="Annual Yield" style={styles.resultsHeader} />
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Annual AC Energy"
                value={result.annualACMWh}
                unit="MWh"
                color={Colors.accent}
                style={styles.metricCard}
              />
              <MetricCard
                label="Specific Yield"
                value={result.specificYieldKWhKWp}
                unit="kWh/kWp"
                style={styles.metricCard}
              />
              <MetricCard
                label="Capacity Factor"
                value={result.capacityFactor !== null ? result.capacityFactor * 100 : null}
                unit="%"
                style={styles.metricCard}
              />
              <MetricCard
                label="CO₂ Avoided"
                value={result.co2AvoidedTonnes}
                unit="t/yr"
                color={Colors.success}
                style={styles.metricCard}
              />
            </View>

            {/* Monthly Chart */}
            {monthlyMWh && (
              <>
                <SectionHeader title="Monthly Production" style={styles.resultsHeader} />
                <Card>
                  <View style={styles.barChart}>
                    {monthlyMWh.map((val, i) => {
                      const height = val !== null && maxMonthly > 0 ? (val / maxMonthly) * 100 : 0;
                      return (
                        <View key={i} style={styles.barColumn}>
                          <Text style={styles.barValue}>
                            {val !== null ? (val * 1000).toFixed(0) : '—'}
                          </Text>
                          <View style={styles.barTrack}>
                            <View
                              style={[
                                styles.bar,
                                {
                                  height: `${height}%` as never,
                                  backgroundColor: Colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.barLabel}>{MONTH_LABELS[i]}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={styles.chartUnit}>MWh per month</Text>
                </Card>
              </>
            )}

            <Button
              label="Export Report"
              onPress={() => {
                console.info('[Yield] Export report triggered');
              }}
              variant="secondary"
              fullWidth
              style={styles.exportBtn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function parseF(val: string): number | undefined {
  if (!val || val.trim() === '') return undefined;
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

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
  poaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  poaMini: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  calcBtn: { flex: 1 },
  resultsHeader: { marginTop: Spacing.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  metricCard: { width: '47%' },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 3,
    paddingBottom: Spacing.lg,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 8,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  barTrack: {
    width: '100%',
    height: 80,
    justifyContent: 'flex-end',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 8,
    color: Colors.textMuted,
    marginTop: 4,
  },
  chartUnit: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  exportBtn: { marginTop: Spacing.lg },
});
