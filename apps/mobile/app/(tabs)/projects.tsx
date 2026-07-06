import { ScrollView, StyleSheet, Text, View } from 'react-native'

const PROJECTS = [
  { id: 'p1', name: 'Solar Farm Alpha', capacity_kwp: 5000, location: 'Dubai, UAE', status: 'active' },
  { id: 'p2', name: 'Desert Sun Beta', capacity_kwp: 10000, location: 'Riyadh, KSA', status: 'active' },
  { id: 'p3', name: 'Green Valley', capacity_kwp: 2000, location: 'London, UK', status: 'draft' },
]

export default function ProjectsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Projects</Text>
      <Text style={styles.subtitle}>{PROJECTS.length} projects in portfolio</Text>
      {PROJECTS.map(p => (
        <View key={p.id} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={[styles.badge, p.status === 'active' ? styles.badgeSuccess : styles.badgeNeutral]}>{p.status}</Text>
          </View>
          <Text style={styles.detail}>{(p.capacity_kwp / 1000).toFixed(1)} MWp · {p.location}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#e8edf5', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#7a8499', marginBottom: 20 },
  card: { backgroundColor: '#151922', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1e2430' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 15, fontWeight: '700', color: '#e8edf5' },
  detail: { fontSize: 13, color: '#7a8499' },
  badge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, textTransform: 'uppercase' },
  badgeSuccess: { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  badgeNeutral: { backgroundColor: '#1e2430', color: '#7a8499' },
})
