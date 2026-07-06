import { ScrollView, StyleSheet, Text, View } from 'react-native'

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Application preferences</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Platform</Text>
        <View style={styles.row}><Text style={styles.key}>Domain</Text><Text style={styles.val}>pvmind.ai</Text></View>
        <View style={styles.row}><Text style={styles.key}>Version</Text><Text style={styles.val}>1.0.0</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend</Text>
        <View style={styles.row}><Text style={styles.key}>Provider</Text><Text style={styles.val}>Supabase</Text></View>
        <View style={styles.row}><Text style={styles.key}>Auth</Text><Text style={styles.val}>Email + OAuth</Text></View>
        <View style={styles.row}><Text style={styles.key}>RLS</Text><Text style={[styles.val, { color: '#22c55e' }]}>Enabled</Text></View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#e8edf5', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#7a8499', marginBottom: 20 },
  card: { backgroundColor: '#151922', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e2430' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#e8edf5', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1e2430' },
  key: { fontSize: 13, color: '#7a8499' },
  val: { fontSize: 13, color: '#e8edf5', fontWeight: '600' },
})
