import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@pvmind/ui';

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <View style={[styles.icon, focused && styles.iconFocused]}>
      {/* Icon text — replace with proper SVG icons in production */}
      <View style={[styles.iconInner, { opacity: focused ? 1 : 0.55 }]}>
        <View style={[styles.dot, { backgroundColor: focused ? Colors.primary : Colors.textMuted }]} />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: Typography.fontSizeXs,
          fontWeight: Typography.fontWeightMedium,
        },
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontWeight: Typography.fontWeightBold,
          color: Colors.textPrimary,
        },
        headerRight: () => (
          <View style={styles.headerBadge}>
            <View style={styles.headerDot} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⊞" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="design"
        options={{
          title: 'Design',
          tabBarLabel: 'Design',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="simulation"
        options={{
          title: 'Simulation',
          tabBarLabel: 'Simulate',
          tabBarIcon: ({ focused }) => <TabIcon symbol="▷" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="yield"
        options={{
          title: 'Yield',
          tabBarLabel: 'Yield',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◉" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scada"
        options={{
          title: 'SCADA',
          tabBarLabel: 'SCADA',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarLabel: 'Reports',
          tabBarIcon: ({ focused }) => <TabIcon symbol="≡" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xs },
  iconFocused: {},
  iconInner: {},
  dot: { width: 8, height: 8, borderRadius: 4 },
  headerBadge: { marginRight: Spacing.base },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
});
