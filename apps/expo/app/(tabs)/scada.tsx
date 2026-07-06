import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  MetricCard,
  SectionHeader,
  StatusBadge,
  Button,
  Colors,
  Spacing,
  Typography,
} from '@pvmind/ui';
import { safeNumber, NEEDS_INPUT } from '@pvmind/calc-engine';

interface LiveReading {
  id: string;
  timestamp: string;
  acPowerKW: number | null;
  irradianceWM2: number | null;
  moduleTempC: number | null;
  ambientTempC: number | null;
  energyTodayKWh: number | null;
  pr: number | null;
  status: 'normal' | 'warning' | 'fault';
  alarms: string[];
}

type TimeRange = '1h' | '6h' | '24h' | '7d';

export default function SCADAScreen() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [reading, setReading] = useState<LiveReading | null>(null);
  const [history, setHistory] = useState<LiveReading[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [alarmCount, setAlarmCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    // Real SCADA connects via Supabase Realtime subscription.
    // Simulate connection delay:
    await new Promise<void>((r) => setTimeout(r, 1000));
    setConnected(true);
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setConnected(false);
    setReading(null);
  }, []);

  // Poll for updates when connected
  // In production: subscribe via subscribeToReadings() from @pvmind/supabase
  useEffect(() => {
    if (!connected) return;

    const tick = () => {
      const now = new Date();
      const sunHour = now.getHours() + now.getMinutes() / 60;
      // Realistic solar power curve
      const solarFactor = sunHour >= 6 && sunHour <= 18
        ? Math.sin(((sunHour - 6) / 12) * Math.PI)
        : 0;

      const irr = safeNumber(1000 * solarFactor * (0.9 + Math.random() * 0.1));
      const acPower = irr !== null ? safeNumber(irr * 0.8 * (0.95 + Math.random() * 0.05)) : null;
      const moduleTemp = irr !== null ? safeNumber(25 + (irr / 1000) * 30 + (Math.random() * 2 - 1)) : null;
      const pr = acPower !== null && irr !== null && irr > 0
        ? safeNumber(acPower / (irr * 0.001 * 1000) * 0.82)
        : null;

      const newReading: LiveReading = {
        id: now.toISOString(),
        timestamp: now.toLocaleTimeString(),
        acPowerKW: acPower !== null ? safeNumber(acPower / 1000) : null,
        irradianceWM2: irr,
        moduleTempC: moduleTemp,
        ambientTempC: safeNumber(28 + Math.random() * 4),
        energyTodayKWh: safeNumber(Math.random() * 500 + 200),
        pr,
        status: 'normal',
        alarms: [],
      };

      setReading(newReading);
      setHistory((h) => [newReading, ...h.slice(0, 49)]);
    };

    tick();
    intervalRef.current = setInterval(tick, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [connected]);

  const clearAlarms = useCallback(() => {
    setAlarmCount(0);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Connection Bar */}
        <Card style={styles.connBar}>
          <View style={styles.connLeft}>
            <StatusBadge
              status={connected ? 'online' : 'offline'}
              label={connected ? 'Live' : 'Disconnected'}
            />
            <Text style={styles.connSubtitle}>
              {connected ? 'Receiving data every 5s' : 'Not connected to SCADA data source'}
            </Text>
          </View>
          <Button
            label={connecting ? 'Connecting…' : connected ? 'Disconnect' : 'Connect'}
            onPress={connected ? disconnect : connect}
            variant={connected ? 'danger' : 'primary'}
            loading={connecting}
            size="sm"
          />
        </Card>

        {/* Alarms Banner */}
        {alarmCount > 0 && (
          <TouchableOpacity
            style={styles.alarmBanner}
            onPress={clearAlarms}
            accessibilityRole="button"
            accessibilityLabel={`${alarmCount} active alarms. Tap to clear.`}
          >
            <Text style={styles.alarmText}>⚠ {alarmCount} Active Alarm{alarmCount !== 1 ? 's' : ''} — Tap to Clear</Text>
          </TouchableOpacity>
        )}

        {/* Live Metrics */}
        <SectionHeader title="Live Readings" style={styles.sectionHeader} />
        <View style={styles.metricsGrid}>
          <MetricCard
            label="AC Power"
            value={reading?.acPowerKW ?? null}
            unit="kW"
            color={Colors.accent}
            style={styles.metricCard}
          />
          <MetricCard
            label="Irradiance"
            value={reading?.irradianceWM2 ?? null}
            unit="W/m²"
            style={styles.metricCard}
          />
          <MetricCard
            label="Module Temp"
            value={reading?.moduleTempC ?? null}
            unit="°C"
            style={styles.metricCard}
          />
          <MetricCard
            label="Ambient Temp"
            value={reading?.ambientTempC ?? null}
            unit="°C"
            style={styles.metricCard}
          />
          <MetricCard
            label="Energy Today"
            value={reading?.energyTodayKWh ?? null}
            unit="kWh"
            color={Colors.primary}
            style={styles.metricCard}
          />
          <MetricCard
            label="Performance Ratio"
            value={reading?.pr !== null && reading?.pr !== undefined ? reading.pr * 100 : null}
            unit="%"
            style={styles.metricCard}
          />
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeRow}>
          {TIME_RANGES.map((tr) => (
            <TouchableOpacity
              key={tr}
              style={[styles.timeRangeBtn, timeRange === tr && styles.timeRangeBtnActive]}
              onPress={() => setTimeRange(tr)}
              accessibilityRole="button"
              accessibilityLabel={`View ${tr} range`}
              accessibilityState={{ selected: timeRange === tr }}
            >
              <Text style={[styles.timeRangeBtnText, timeRange === tr && styles.timeRangeBtnTextActive]}>
                {tr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History Log */}
        <SectionHeader
          title="Reading History"
          subtitle={`Last ${history.length} readings`}
          style={styles.sectionHeader}
        />
        {history.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              {connected ? 'Waiting for first reading…' : 'Connect to SCADA to view history.'}
            </Text>
          </Card>
        ) : (
          <Card padded={false}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.2 }]}>Time</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>AC kW</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Irr W/m²</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>PR%</Text>
            </View>
            {history.slice(0, 20).map((row) => (
              <View key={row.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{row.timestamp}</Text>
                <Text style={styles.tableCell}>
                  {row.acPowerKW !== null ? row.acPowerKW.toFixed(1) : '—'}
                </Text>
                <Text style={styles.tableCell}>
                  {row.irradianceWM2 !== null ? row.irradianceWM2.toFixed(0) : '—'}
                </Text>
                <Text style={styles.tableCell}>
                  {row.pr !== null ? (row.pr * 100).toFixed(1) : '—'}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const TIME_RANGES: TimeRange[] = ['1h', '6h', '24h', '7d'];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  connBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  connLeft: { flex: 1, marginRight: Spacing.sm },
  connSubtitle: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  alarmBanner: {
    backgroundColor: Colors.error + '22',
    borderWidth: 1,
    borderColor: Colors.error + '55',
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
  },
  alarmText: {
    color: Colors.error,
    fontWeight: Typography.fontWeightSemiBold,
    fontSize: Typography.fontSizeSm,
  },
  sectionHeader: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  metricCard: { width: '47%' },
  timeRangeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  timeRangeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRangeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeRangeBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
  },
  timeRangeBtnTextActive: { color: Colors.white },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeSm,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: Spacing.xl,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderText: {
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXs,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '66',
  },
  tableCell: {
    flex: 1,
    fontSize: Typography.fontSizeXs,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
});
