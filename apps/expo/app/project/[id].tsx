import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, SectionHeader, StatusBadge, Colors, Spacing, Typography } from '@pvmind/ui';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project from Supabase when configured
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Project</Text>
        <Text style={styles.id}>ID: {id}</Text>

        <Card style={styles.card}>
          <Text style={styles.cardText}>
            Project data is loaded from Supabase. Configure your environment variables to enable cloud sync.
          </Text>
          <StatusBadge status="idle" label="Pending configuration" />
        </Card>

        <Button
          label="Edit Design"
          onPress={() => router.push('/(tabs)/design')}
          variant="primary"
          fullWidth
          style={styles.btn}
        />
        <Button
          label="Run Simulation"
          onPress={() => router.push('/(tabs)/simulation')}
          variant="secondary"
          fullWidth
          style={styles.btn}
        />
        <Button
          label="View SCADA"
          onPress={() => router.push('/(tabs)/scada')}
          variant="secondary"
          fullWidth
          style={styles.btn}
        />
        <Button
          label="Back"
          onPress={() => router.back()}
          variant="ghost"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  id: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textMuted,
    fontFamily: 'monospace',
    marginBottom: Spacing.base,
  },
  card: { marginBottom: Spacing.base },
  cardText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  btn: { marginBottom: Spacing.sm },
});
