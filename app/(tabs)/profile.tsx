import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import {
  Settings,
  CreditCard,
  Heart,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

export default function ProfileScreen() {
  // Mock user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2ZpbGUlMjBwaG90b3xlbnwwfHwwfHx8MA%3D%3D',
    memberSince: 'May 2024',
    orderCount: 12,
  };

  const menuItems = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: <Settings size={22} color="#3498db" />,
      items: [
        { id: 'personal', name: 'Personal Information' },
        { id: 'address', name: 'Addresses' },
        {
          id: 'payment',
          name: 'Payment Methods',
          icon: <CreditCard size={20} color="#666" />,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: <Heart size={22} color="#e74c3c" />,
      items: [
        { id: 'favorites', name: 'Favorite Stores' },
        {
          id: 'notifications',
          name: 'Notification Settings',
          icon: <Bell size={20} color="#666" />,
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      icon: <HelpCircle size={22} color="#f39c12" />,
      items: [
        { id: 'help', name: 'Help Center' },
        { id: 'contact', name: 'Contact Us' },
        { id: 'about', name: 'About' },
      ],
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100"
    >
      <View className="flex-row items-center">
        {item.icon && <View className="mr-3">{item.icon}</View>}
        <Text className="text-base text-gray-800">{item.name}</Text>
      </View>
      <ChevronRight size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pb-5 border-b border-gray-200">
        <View className="flex-row items-center px-5 pt-14 mb-5">
          <Image
            source={{ uri: user.avatar }}
            className="w-20 h-20 rounded-full mr-5"
          />
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">
              {user.name}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">{user.email}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              Member since {user.memberSince}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row mx-5 p-4 bg-gray-50 rounded-lg">
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-gray-800">
              {user.orderCount}
            </Text>
            <Text className="text-sm text-gray-600">Orders</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-gray-800">5</Text>
            <Text className="text-sm text-gray-600">Favorites</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-gray-800">3</Text>
            <Text className="text-sm text-gray-600">Reviews</Text>
          </View>
        </View>
      </View>

      {/* Menu Sections */}
      <View className="px-5 pt-5 pb-8">
        {menuItems.map((section) => (
          <View key={section.id} className="mb-6">
            <View className="flex-row items-center mb-4">
              {section.icon}
              <Text className="text-lg font-bold text-gray-800 ml-2">
                {section.title}
              </Text>
            </View>
            <View className="bg-white rounded-lg shadow-sm">
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity className="flex-row items-center justify-center bg-white py-4 rounded-lg shadow-sm">
          <LogOut size={20} color="#e74c3c" />
          <Text className="text-base font-medium text-red-500 ml-2">
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
