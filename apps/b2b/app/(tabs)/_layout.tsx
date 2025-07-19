import { Tabs } from 'expo-router';
import { TabBarIcon } from 'shared/components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="home" />,
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="list" />,
          title: 'Products',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="book" />,
          title: 'Orders',
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon color={color} name="archive" />
          ),
          title: 'Inventory',
        }}
      />
    </Tabs>
  );
}
