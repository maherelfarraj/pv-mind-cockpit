import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { APP_NAME, MOBILE_AUTH_CALLBACK_URI, WEB_AUTH_CALLBACK_URL } from '@/constants/branding';
import { palette } from '@/constants/theme';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const status = typeof params.status === 'string' ? params.status : 'received';
  const provider = typeof params.provider === 'string' ? params.provider : 'identity provider';

  return (
    <Screen
      title="Auth Callback"
      subtitle={`${APP_NAME} deep-link landing screen for mobile and web authentication flows.`}>
      <SectionCard eyebrow="Deep Link" title={MOBILE_AUTH_CALLBACK_URI}>
        <Text style={styles.message}>
          Callback received with status <Text style={styles.emphasis}>{status}</Text> from{' '}
          <Text style={styles.emphasis}>{provider}</Text>.
        </Text>
        <Text style={styles.note}>
          Production web auth completes at {WEB_AUTH_CALLBACK_URL}. This screen is ready for future token exchange or
          session bootstrap logic.
        </Text>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
  },
  emphasis: {
    fontWeight: '700',
  },
  note: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
