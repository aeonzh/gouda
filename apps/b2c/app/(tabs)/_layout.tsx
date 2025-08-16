import { TabBarIcon } from '@shared/components/TabBarIcon';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              name={focused ? 'home' : 'home-outline'}
            />
          ),
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name='orders'
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              name={focused ? 'list' : 'list-outline'}
            />
          ),
          title: 'Orders',
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              name={focused ? 'person' : 'person-outline'}
            />
          ),
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
