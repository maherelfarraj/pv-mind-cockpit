import { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { generateSCADAPoints } from '@pvmind/calc-engine'

export default function SCADAScreen() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000)
    return () => clearInterval(id)
  }, [])

  const points = useMemo(() => generateSCADAPoints(5000, 24), [tick])
  const current = points[points.length - 1]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>SCADA Monitor</Text>
      <Text style={styles.subtitle}>Solar Farm Alpha · live telemetry</Text>

      <View style={[styles.statusBadge, { backgroundColor: current.power_kw > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }]}>
        <Text style={[styles.statusText, { color: current.power_kw > 0 ? '#22c55e' : '#ef4444' }]}>
          {current.power_kw > 0 ? '● ONLINE' : '● OFFLINE'}
        </Text>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Power</Text><Text style={styles.kpiValue}>{current.power_kw.toFixed(0)} kW</Text></View>
        <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Energy</Text><Text style={styles.kpiValue}>{current.energy_kwh.toFixed(1)} kWh</Text></View>
      </View>
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Irradiance</Text><Text style={styles.kpiValue}>{current.irradiance_wm2.toFixed(0)} W/m²</Text></View>
        <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Module Temp</Text><Text style={styles.kpiValue}>{current.temperature_c.toFixed(1)}°C</Text></View>
      </View>

      <Text style={styles.sectionTitle}>PR: {(current.pr * 100).toFixed(1)}%</Text>
      <Text style={styles.note}>Refreshes every 5 seconds</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#e8edf5', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#7a8499', marginBottom: 16 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16 },
  statusText: { fontWeight: '700', fontSize: 13 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: '#151922', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1e2430' },
  kpiLabel: { fontSize: 11, color: '#7a8499', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  kpiValue: { fontSize: 22, fontWeight: '700', color: '#e8edf5' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#3b82f6', marginTop: 8 },
  note: { fontSize: 12, color: '#7a8499', marginTop: 4 },
})
