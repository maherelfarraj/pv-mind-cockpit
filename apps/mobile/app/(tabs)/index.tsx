import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { calcFleetKPIs } from '@pvmind/calc-engine'

const SEED_PROJECTS = [
  { id: 'p1', name: 'Solar Farm Alpha', capacity_kwp: 5000, bess_capacity_kwh: 0, status: 'active' },
  { id: 'p2', name: 'Desert Sun Beta', capacity_kwp: 10000, bess_capacity_kwh: 20000, status: 'active' },
  { id: 'p3', name: 'Green Valley', capacity_kwp: 2000, bess_capacity_kwh: 0, status: 'draft' },
]

export default function DashboardScreen() {
  const kpis = calcFleetKPIs(SEED_PROJECTS)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>PV Mind Cockpit</Text>
      <Text style={styles.subtitle}>Portfolio control center</Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Capacity</Text>
          <Text style={styles.kpiValue}>{(kpis.total_kwp / 1000).toFixed(1)} MW</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Active Projects</Text>
          <Text style={styles.kpiValue}>{kpis.active}</Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>BESS Fleet</Text>
          <Text style={styles.kpiValue}>{(kpis.total_bess_kwh / 1000).toFixed(0)} MWh</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Health Score</Text>
          <Text style={[styles.kpiValue, { color: '#22c55e' }]}>{kpis.health_score}%</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Projects</Text>
      {SEED_PROJECTS.map(p => (
        <View key={p.id} style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{p.name}</Text>
            <Text style={[styles.badge, p.status === 'active' ? styles.badgeSuccess : styles.badgeNeutral]}>{p.status}</Text>
          </View>
          <Text style={styles.projectDetail}>{(p.capacity_kwp / 1000).toFixed(1)} MWp DC</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#e8edf5', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7a8499', marginBottom: 24 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: '#151922', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1e2430' },
  kpiLabel: { fontSize: 11, color: '#7a8499', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  kpiValue: { fontSize: 24, fontWeight: '700', color: '#e8edf5' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#e8edf5', marginTop: 12, marginBottom: 12 },
  projectCard: { backgroundColor: '#151922', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#1e2430' },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  projectName: { fontSize: 15, fontWeight: '700', color: '#e8edf5' },
  projectDetail: { fontSize: 13, color: '#7a8499' },
  badge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, textTransform: 'uppercase' },
  badgeSuccess: { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  badgeNeutral: { backgroundColor: '#1e2430', color: '#7a8499' },
})
