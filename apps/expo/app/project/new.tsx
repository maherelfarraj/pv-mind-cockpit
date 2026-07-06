import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card, Colors, Spacing, Typography } from '@pvmind/ui';
import { isConfigured } from '../../src/config/env';

export default function NewProjectScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs['name'] = 'Project name is required';
    return errs;
  }, [name]);

  const handleCreate = useCallback(async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      if (isConfigured()) {
        // Persist to Supabase via createProject() from @pvmind/supabase
        // const project = await createProject({ ... });
        // router.replace(`/project/${project.id}`);
      }
      // Navigate back to dashboard after creation
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  }, [name, description, location, latitude, longitude, validate]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>New Project</Text>
        <Text style={styles.subtitle}>Set up a new solar PV + BESS project</Text>

        <Card style={styles.card}>
          <Input
            label="Project Name"
            value={name}
            onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
            placeholder="e.g. Al-Qassim 10 MWp Solar Farm"
            required
            error={errors['name']}
          />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Brief project description"
          />
          <Input
            label="Location Name"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Al-Qassim, Saudi Arabia"
          />
          <Input
            label="Latitude"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
            unit="°"
            hint="Decimal degrees, e.g. 26.3"
          />
          <Input
            label="Longitude"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
            unit="°"
            hint="Decimal degrees, e.g. 44.0"
          />
        </Card>

        {!isConfigured() && (
          <View style={styles.configNote}>
            <Text style={styles.configNoteText}>
              Supabase is not configured. The project will not be saved to the cloud until you set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
            </Text>
          </View>
        )}

        <Button
          label={saving ? 'Creating…' : 'Create Project'}
          onPress={handleCreate}
          variant="primary"
          fullWidth
          loading={saving}
          style={styles.createBtn}
        />
        <Button
          label="Cancel"
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
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  card: { marginBottom: Spacing.base },
  configNote: {
    backgroundColor: Colors.warning + '22',
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
    marginBottom: Spacing.base,
  },
  configNoteText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.warning,
    lineHeight: 18,
  },
  createBtn: { marginBottom: Spacing.sm },
});
