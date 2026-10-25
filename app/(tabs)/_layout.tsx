import { Tabs } from 'expo-router';
import { BookOpen, ChefHat, Clapperboard, Inbox, Refrigerator } from 'lucide-react-native';

import { useTheme } from '@/lib/theme';

export default function TabLayout() {
  const { colors, iconSize, type } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: type.caption.fontFamily,
          fontSize: type.caption.size,
          lineHeight: type.caption.lineHeight,
          paddingBottom: 2,
        },
        tabBarItemStyle: { minWidth: 0, paddingHorizontal: 0 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color }) => <Refrigerator color={color} size={iconSize.md + 1} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="cook"
        options={{
          title: 'Cook',
          tabBarIcon: ({ color }) => <ChefHat color={color} size={iconSize.md + 1} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="reel"
        options={{
          title: 'Reel',
          tabBarIcon: ({ color }) => <Clapperboard color={color} size={iconSize.md + 1} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="incoming"
        options={{
          title: 'Incoming',
          tabBarIcon: ({ color }) => <Inbox color={color} size={iconSize.md + 1} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="cookbook"
        options={{
          title: 'Cookbook',
          tabBarIcon: ({ color }) => <BookOpen color={color} size={iconSize.md + 1} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
