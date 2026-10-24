import { Tabs } from 'expo-router';
import { BookOpen, ChefHat, Clapperboard, Inbox, Refrigerator } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#F0532F',
        tabBarInactiveTintColor: '#7A877E',
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 10,
          lineHeight: 16,
          paddingBottom: 2,
        },
        tabBarItemStyle: { minWidth: 0, paddingHorizontal: 0 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#D9E1D6',
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color }) => <Refrigerator color={color} size={21} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="cook"
        options={{
          title: 'Cook',
          tabBarIcon: ({ color }) => <ChefHat color={color} size={21} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="reel"
        options={{
          title: 'Reel',
          tabBarIcon: ({ color }) => <Clapperboard color={color} size={21} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="incoming"
        options={{
          title: 'Incoming',
          tabBarIcon: ({ color }) => <Inbox color={color} size={21} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="cookbook"
        options={{
          title: 'Cookbook',
          tabBarIcon: ({ color }) => <BookOpen color={color} size={21} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
