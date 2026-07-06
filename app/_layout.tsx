import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { palette } from '@/constants/theme';
import { AppDataProvider } from '@/providers/AppDataProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: palette.surface,
            },
            headerTintColor: palette.text,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: palette.background,
            },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="projects/[id]" options={{ title: 'Project Detail' }} />
          <Stack.Screen name="summaries/pv" options={{ title: 'PV Summary' }} />
          <Stack.Screen name="summaries/bess" options={{ title: 'BESS Summary' }} />
          <Stack.Screen name="summaries/yield" options={{ title: 'Yield Summary' }} />
          <Stack.Screen name="summaries/capex" options={{ title: 'CAPEX Summary' }} />
          <Stack.Screen name="scada-live" options={{ title: 'SCADA Live' }} />
          <Stack.Screen name="alarms" options={{ title: 'Alarms' }} />
          <Stack.Screen name="work-orders" options={{ title: 'Work Orders' }} />
          <Stack.Screen name="auth/callback" options={{ title: 'Auth Callback' }} />
        </Stack>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
