import { Tabs } from 'expo-router';
import { TabBarIcon } from 'packages/shared/components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
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
        name="products"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              name={focused ? 'grid' : 'grid-outline'}
            />
          ),
          title: 'Products',
        }}
      />
      <Tabs.Screen
        name="orders"
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
        name="orders/[id]"
        options={{
          headerShown: true, // Show header for order details
          href: null, // Hide this tab from the tab bar
          title: 'Order Details',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              name={focused ? 'cart' : 'cart-outline'}
            />
          ),
          title: 'Cart',
        }}
      />
      <Tabs.Screen
        name="profile"
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
