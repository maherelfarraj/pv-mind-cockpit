import { StyleSheet, Text, View } from 'react-native';

import { EMAIL_FOOTER, REPORT_FOOTER, REPORT_HEADER } from '@/constants/branding';
import { palette, spacing } from '@/constants/theme';

type ReportBrandingProps = {
  variant?: 'report' | 'email';
};

export function ReportBranding({ variant = 'report' }: ReportBrandingProps) {
  const footer = variant === 'email' ? EMAIL_FOOTER : REPORT_FOOTER;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{REPORT_HEADER.title}</Text>
      <Text style={styles.subtitle}>{REPORT_HEADER.subtitle}</Text>
      <Text style={styles.domain}>{REPORT_HEADER.domain}</Text>
      <Text style={styles.footer}>{footer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: spacing.md,
  },
  title: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 13,
  },
  domain: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  footer: {
    borderTopColor: palette.border,
    borderTopWidth: 1,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
});
