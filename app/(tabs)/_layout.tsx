import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { palette } from '@/constants/theme';

type IconName = {
  ios: string;
  android: string;
  web: string;
};

function TabIcon({ color, name }: { color: string; name: IconName }) {
  return <SymbolView name={name} tintColor={color} size={22} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{
                ios: 'rectangle.grid.2x2.fill',
                android: 'dashboard',
                web: 'dashboard',
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{
                ios: 'folder.fill',
                android: 'folder',
                web: 'folder',
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="operations"
        options={{
          title: 'Operations',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{
                ios: 'bolt.horizontal.circle.fill',
                android: 'monitoring',
                web: 'monitoring',
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{
                ios: 'doc.text.fill',
                android: 'description',
                web: 'description',
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{
                ios: 'gearshape.fill',
                android: 'settings',
                web: 'settings',
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
