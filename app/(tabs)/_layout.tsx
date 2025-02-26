import { Tabs } from 'expo-router';
import { Store, ShoppingBag, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3498db', // Active tab icon and label color
        tabBarInactiveTintColor: '#999', // Inactive tab icon and label color
        tabBarStyle: {
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderTopWidth: 1, // Add a top border
          borderTopColor: '#f0f0f0', // Border color
          height: 60, // Tab bar height
          paddingBottom: 8, // Padding at the bottom
        },
        tabBarLabelStyle: {
          fontSize: 12, // Label font size
          fontWeight: '500', // Label font weight
        },
        headerShown: false, // Hide the header
      }}
    >
      {/* Shops Tab */}
      <Tabs.Screen
        name="shops"
        options={{
          title: 'Shops',
          tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
          href: null, // Hide this tab as we're using a custom shops screen
        }}
      />

      {/* Orders Tab */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
