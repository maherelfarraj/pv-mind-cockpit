import type { ConfigContext, ExpoConfig } from 'expo/config';

const MOBILE_APP_NAME = 'PV_Mind';
const APP_DESCRIPTION =
  'PV_Mind Cockpit helps engineers and developers create PV and PV+BESS projects, validate stringing, estimate yield, calculate CAPEX, generate BOM/BOQ, preview SLDs, monitor SCADA telemetry, and export project reports.';
const BUNDLE_IDENTIFIER = 'ai.pvmind.app';
const DEEP_LINK_SCHEME = 'pvmind';
const DOMAIN = 'pvmind.ai';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: MOBILE_APP_NAME,
  slug: 'pvmind-cockpit',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: DEEP_LINK_SCHEME,
  userInterfaceStyle: 'automatic',
  description: APP_DESCRIPTION,
  ios: {
    supportsTablet: true,
    bundleIdentifier: BUNDLE_IDENTIFIER,
    associatedDomains: [
      `applinks:${DOMAIN}`,
      `applinks:www.${DOMAIN}`,
      `applinks:app.${DOMAIN}`,
    ],
  },
  android: {
    package: BUNDLE_IDENTIFIER,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'https', host: DOMAIN, pathPrefix: '/auth' },
          { scheme: 'https', host: `app.${DOMAIN}`, pathPrefix: '/auth' },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
      {
        action: 'VIEW',
        data: [{ scheme: DEEP_LINK_SCHEME }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    macosBundleIdentifier: 'ai.pvmind.desktop',
    macosAppName: 'PV_Mind Cockpit',
  },
});
