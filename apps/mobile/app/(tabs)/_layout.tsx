import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#151922', borderTopColor: '#1e2430' },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#7a8499',
        headerStyle: { backgroundColor: '#151922' },
        headerTintColor: '#e8edf5',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      <Tabs.Screen name="scada" options={{ title: 'SCADA' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  )
}
