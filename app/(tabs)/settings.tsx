import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  APP_NAME,
  APP_URL,
  EMAIL_FOOTER,
  MOBILE_AUTH_CALLBACK_URI,
  NO_REPLY_EMAIL,
  PARENT_BRAND,
  PUBLIC_URL,
  SUPABASE_AUTH_REDIRECT_URLS,
  SUPPORT_EMAIL,
  WEB_AUTH_CALLBACK_URL,
} from '@/constants/branding';
import { palette, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export default function SettingsScreen() {
  const { isOnline, lastSyncedAt } = useAppData();

  return (
    <Screen
      title="Settings"
      subtitle={`${APP_NAME} configuration for auth, notifications, and mobile sync.`}>
      <SectionCard eyebrow="Brand" title={APP_NAME}>
        <Text style={styles.value}>{PARENT_BRAND}</Text>
        <Text style={styles.description}>
          Public site: {PUBLIC_URL}
          {'\n'}
          Authenticated app: {APP_URL}
        </Text>
      </SectionCard>

      <SectionCard eyebrow="Deep Link" title="Mobile auth callback">
        <Text style={styles.value}>{MOBILE_AUTH_CALLBACK_URI}</Text>
        <Text style={styles.description}>
          Authentication callbacks route through the official {APP_NAME} deep-link scheme.
        </Text>
        <Link href="/auth/callback?status=success&provider=sso" asChild>
          <Pressable style={styles.cta}>
            <Text style={styles.ctaText}>Open callback placeholder</Text>
          </Pressable>
        </Link>
      </SectionCard>

      <SectionCard eyebrow="Supabase" title="Auth redirect URLs">
        <Text style={styles.description}>
          Register these redirect URLs in the Supabase dashboard for production auth:
        </Text>
        <View style={styles.list}>
          {SUPABASE_AUTH_REDIRECT_URLS.map((url) => (
            <Text key={url} style={styles.listItem}>
              {url}
            </Text>
          ))}
        </View>
        <Text style={styles.description}>Web callback endpoint: {WEB_AUTH_CALLBACK_URL}</Text>
      </SectionCard>

      <SectionCard eyebrow="Email" title="System addresses">
        <Text style={styles.value}>{SUPPORT_EMAIL}</Text>
        <Text style={styles.description}>
          Support: {SUPPORT_EMAIL}
          {'\n'}
          No-reply: {NO_REPLY_EMAIL}
          {'\n\n'}
          {EMAIL_FOOTER}
        </Text>
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
  list: {
    gap: spacing.xs,
  },
  listItem: {
    color: palette.text,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
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
