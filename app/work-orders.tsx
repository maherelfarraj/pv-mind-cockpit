import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, spacing } from '@/constants/theme';
import { projects } from '@/data/mockData';
import { useAppData } from '@/providers/AppDataProvider';

const FORM_STORAGE_KEY = 'pvmind.work-order-form';

const blankForm = {
  projectId: projects[0]?.id ?? '',
  title: '',
  description: '',
  photoPlaceholder: false,
};

export default function WorkOrdersScreen() {
  const { isOnline, pendingDraftCount, saveWorkOrderDraft, syncPendingDrafts, workOrderDrafts } = useAppData();
  const [form, setForm] = useState(blankForm);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    async function hydrateForm() {
      const stored = await AsyncStorage.getItem(FORM_STORAGE_KEY);

      if (stored) {
        setForm(JSON.parse(stored) as typeof blankForm);
        setMessage('Local draft restored from this device.');
      }

      setHydrated(true);
    }

    void hydrateForm();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
  }, [form, hydrated]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === form.projectId),
    [form.projectId]
  );

  async function clearLocalForm() {
    setForm(blankForm);
    await AsyncStorage.removeItem(FORM_STORAGE_KEY);
  }

  async function handleSaveDraft() {
    if (!form.title.trim() || !form.description.trim()) {
      setMessage('Add both a title and description before saving a draft.');
      return;
    }

    await saveWorkOrderDraft(form);
    if (isOnline) {
      await syncPendingDrafts();
    }
    await clearLocalForm();
    setMessage(isOnline ? 'Draft saved and synced.' : 'Draft saved offline and queued for sync.');
  }

  return (
    <Screen title="Work Orders" subtitle="Capture field work, keep a local draft, and sync automatically when online.">
      <SectionCard eyebrow="Draft Sync" title="Mobile status">
        <View style={styles.statusRow}>
          <StatusBadge label={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'success' : 'warning'} />
          <Text style={styles.caption}>
            {pendingDraftCount > 0
              ? `${pendingDraftCount} saved draft${pendingDraftCount === 1 ? '' : 's'} still pending upload.`
              : 'No saved drafts are waiting to sync.'}
          </Text>
        </View>
        {message ? <Text style={styles.info}>{message}</Text> : null}
      </SectionCard>

      <SectionCard eyebrow="New Draft" title="Field action">
        <Text style={styles.label}>Project</Text>
        <View style={styles.selectorWrap}>
          {projects.map((project) => {
            const active = project.id === form.projectId;

            return (
              <Pressable
                key={project.id}
                onPress={() => setForm((current) => ({ ...current, projectId: project.id }))}
                style={[styles.selector, active && styles.selectorActive]}>
                <Text style={[styles.selectorText, active && styles.selectorTextActive]}>{project.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          onChangeText={(title) => setForm((current) => ({ ...current, title }))}
          placeholder="Example: Inspect inverter string mismatch"
          placeholderTextColor={palette.muted}
          style={styles.input}
          value={form.title}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          multiline
          onChangeText={(description) => setForm((current) => ({ ...current, description }))}
          placeholder="Describe the issue, site context, and intended action."
          placeholderTextColor={palette.muted}
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={form.description}
        />

        <Pressable
          onPress={() =>
            setForm((current) => ({ ...current, photoPlaceholder: !current.photoPlaceholder }))
          }
          style={[styles.secondaryButton, form.photoPlaceholder && styles.secondaryButtonActive]}>
          <Text
            style={[
              styles.secondaryButtonText,
              form.photoPlaceholder && styles.secondaryButtonTextActive,
            ]}>
            {form.photoPlaceholder ? 'Photo placeholder attached' : 'Add photo attachment placeholder'}
          </Text>
        </Pressable>

        {selectedProject ? (
          <Text style={styles.caption}>
            Selected project: {selectedProject.name} • {selectedProject.location}
          </Text>
        ) : null}

        <View style={styles.buttonRow}>
          <Pressable onPress={() => void clearLocalForm()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Clear local draft</Text>
          </Pressable>
          <Pressable onPress={() => void handleSaveDraft()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save draft</Text>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard eyebrow="Saved Drafts" title="Queued and synced items">
        <View style={styles.stack}>
          {workOrderDrafts.length === 0 ? (
            <Text style={styles.caption}>No work-order drafts have been saved yet.</Text>
          ) : (
            workOrderDrafts.map((draft) => (
              <View key={draft.id} style={styles.draftCard}>
                <View style={styles.draftHeader}>
                  <Text style={styles.draftTitle}>{draft.title}</Text>
                  <StatusBadge
                    label={draft.status === 'synced' ? 'Synced' : 'Pending'}
                    tone={draft.status === 'synced' ? 'success' : 'warning'}
                  />
                </View>
                <Text style={styles.caption}>{draft.description}</Text>
                <Text style={styles.meta}>
                  {projects.find((project) => project.id === draft.projectId)?.name ?? 'Unknown project'} •{' '}
                  {draft.photoPlaceholder ? 'Photo placeholder included' : 'No photo placeholder'} •{' '}
                  {draft.updatedAt}
                </Text>
              </View>
            ))
          )}
        </View>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  info: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectorWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selector: {
    backgroundColor: palette.background,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectorActive: {
    backgroundColor: palette.primary,
  },
  selectorText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    color: palette.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textArea: {
    minHeight: 120,
  },
  caption: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 14,
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonActive: {
    backgroundColor: palette.primarySoft,
    borderColor: palette.primary,
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonTextActive: {
    color: palette.primary,
  },
  stack: {
    gap: spacing.sm,
  },
  draftCard: {
    backgroundColor: palette.background,
    borderRadius: 18,
    gap: 6,
    padding: spacing.md,
  },
  draftHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  draftTitle: {
    color: palette.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
});
