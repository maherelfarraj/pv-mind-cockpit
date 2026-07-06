import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, spacing } from '@/constants/theme';
import { callbackUri } from '@/data/mockData';
import { useAppData } from '@/providers/AppDataProvider';

export default function SettingsScreen() {
  const { isOnline, lastSyncedAt } = useAppData();

  return (
    <Screen title="Settings" subtitle="Configuration placeholders for auth, notifications, and mobile sync.">
      <SectionCard eyebrow="Deep Link" title="Auth callback">
        <Text style={styles.value}>{callbackUri}</Text>
        <Text style={styles.description}>
          This app is configured to route authentication callbacks through the custom scheme above.
        </Text>
        <Link href="/auth/callback?status=success&provider=sso" asChild>
          <Pressable style={styles.cta}>
            <Text style={styles.ctaText}>Open callback placeholder</Text>
          </Pressable>
        </Link>
      </SectionCard>

      <SectionCard eyebrow="Notifications" title="Push notification placeholder">
        <StatusBadge label="Coming soon" tone="warning" />
        <Text style={styles.description}>
          Device registration and remote notification workflows are intentionally stubbed for a later backend integration.
        </Text>
      </SectionCard>

      <SectionCard eyebrow="Sync" title="Draft synchronization">
        <StatusBadge label={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'success' : 'warning'} />
        <Text style={styles.description}>
          {lastSyncedAt ? `Last draft sync completed at ${lastSyncedAt}.` : 'No synced work-order drafts yet.'}
        </Text>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  value: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
