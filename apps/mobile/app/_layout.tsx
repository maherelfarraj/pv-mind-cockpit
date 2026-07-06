import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import '../global.css'

import { AppProviders } from '@/providers'

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#f8fafc',
          contentStyle: { backgroundColor: '#020617' }
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="drafts" options={{ title: 'Offline drafts' }} />
      </Stack>
    </AppProviders>
  )
}
