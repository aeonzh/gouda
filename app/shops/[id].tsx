import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  ShoppingBag,
} from 'lucide-react-native';

// Mock data for stores
const STORES = [
  {
    id: '1',
    name: 'Fashion Boutique',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xvdGhpbmclMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D',
    rating: 4.8,
    location: '123 Fashion St, Downtown',
    category: 'Clothing',
    distance: '0.8 mi',
    hours: '9:00 AM - 9:00 PM',
    phone: '+1 (555) 123-4567',
    description:
      'A premium boutique offering the latest fashion trends for men and women. We curate collections from top designers and emerging brands.',
    items: [
      {
        id: '101',
        name: 'Designer T-Shirt',
        price: 49.99,
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHNoaXJ0fGVufDB8fDB8fHww',
      },
      {
        id: '102',
        name: 'Premium Jeans',
        price: 89.99,
        image:
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amVhbnN8ZW58MHx8MHx8fDA%3D',
      },
      {
        id: '103',
        name: 'Leather Jacket',
        price: 199.99,
        image:
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGVhdGhlciUyMGphY2tldHxlbnwwfHwwfHx8MA%3D%3D',
      },
      {
        id: '104',
        name: 'Summer Dress',
        price: 79.99,
        image:
          'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZHJlc3N8ZW58MHx8MHx8fDA%3D',
      },
    ],
  },
  {
    id: '2',
    name: 'Tech Haven',
    image:
      'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWxlY3Ryb25pY3MlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D',
    rating: 4.6,
    location: '456 Tech Ave, Tech District',
    category: 'Electronics',
    distance: '1.2 mi',
    hours: '10:00 AM - 8:00 PM',
    phone: '+1 (555) 987-6543',
    description:
      'Your one-stop shop for all things tech. We offer the latest gadgets, accessories, and expert advice on technology products.',
    items: [
      {
        id: '201',
        name: 'Wireless Earbuds',
        price: 129.99,
        image:
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWFyYnVkc3xlbnwwfHwwfHx8MA%3D%3D',
      },
      {
        id: '202',
        name: 'Smart Watch',
        price: 249.99,
        image:
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D',
      },
      {
        id: '203',
        name: 'Bluetooth Speaker',
        price: 79.99,
        image:
          'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Ymx1ZXRvb3RoJTIwc3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D',
      },
      {
        id: '204',
        name: 'Phone Charger',
        price: 29.99,
        image:
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGhvbmUlMjBjaGFyZ2VyfGVufDB8fDB8fHww',
      },
    ],
  },
  {
    id: '3',
    name: 'Gourmet Delights',
    image:
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JvY2VyeSUyMHN0b3JlfGVufDB8fDB8fHww',
    rating: 4.9,
    location: '789 Gourmet Blvd, Food Court',
    category: 'Grocery',
    distance: '0.5 mi',
    hours: '8:00 AM - 10:00 PM',
    phone: '+1 (555) 456-7890',
    description:
      'Premium grocery store specializing in organic, local, and international gourmet foods. We source the freshest ingredients for your culinary adventures.',
    items: [
      {
        id: '301',
        name: 'Organic Olive Oil',
        price: 19.99,
        image:
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2xpdmUlMjBvaWx8ZW58MHx8MHx8fDA%3D',
      },
      {
        id: '302',
        name: 'Artisan Cheese',
        price: 12.99,
        image:
          'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hlZXNlfGVufDB8fDB8fHww',
      },
      {
        id: '303',
        name: 'Fresh Pasta',
        price: 8.99,
        image:
          'https://images.unsplash.com/photo-1611068120813-eca5a8cbf793?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlc2glMjBwYXN0YXxlbnwwfHwwfHx8MA%3D%3D',
      },
      {
        id: '304',
        name: 'Exotic Fruits',
        price: 15.99,
        image:
          'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZXhvdGljJTIwZnJ1aXRzfGVufDB8fDB8fHww',
      },
    ],
  },
  {
    id: '4',
    name: 'Home Essentials',
    image:
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZnVybml0dXJlJTIwc3RvcmV8ZW58MHx8MHx8fDA%3D',
    rating: 4.5,
    location: '101 Home St, Shopping Mall',
    category: 'Home Goods',
    distance: '1.5 mi',
    hours: '9:00 AM - 7:00 PM',
    phone: '+1 (555) 234-5678',
    description:
      'Everything you need to make your house a home. We offer furniture, decor, kitchenware, and more to enhance your living space.',
    items: [
      {
        id: '401',
        name: 'Throw Pillows',
        price: 24.99,
        image:
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGhyb3clMjBwaWxsb3dzfGVufDB8fDB8fHww',
      },
      {
        id: '402',
        name: 'Table Lamp',
        price: 59.99,
        image:
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGFibGUlMjBsYW1wfGVufDB8fDB8fHww',
      },
      {
        id: '403',
        name: 'Ceramic Vase',
        price: 39.99,
        image:
          'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2VyYW1pYyUyMHZhc2V8ZW58MHx8MHx8fDA%3D',
      },
      {
        id: '404',
        name: 'Kitchen Utensils',
        price: 29.99,
        image:
          'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2l0Y2hlbiUyMHV0ZW5zaWxzfGVufDB8fDB8fHww',
      },
    ],
  },
  {
    id: '5',
    name: 'Sports World',
    image:
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BvcnRzJTIwc3RvcmV8ZW58MHx8MHx8fDA%3D',
    rating: 4.7,
    location: '202 Sports Way, Sports Complex',
    category: 'Sports',
    distance: '2.0 mi',
    hours: '10:00 AM - 9:00 PM',
    phone: '+1 (555) 876-5432',
    description:
      'Your destination for all sports equipment and athletic wear. We cater to athletes of all levels with quality gear and expert advice.',
    items: [
      {
        id: '501',
        name: 'Running Shoes',
        price: 119.99,
        image:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cnVubmluZyUyMHNob2VzfGVufDB8fDB8fHww',
      },
      {
        id: '502',
        name: 'Yoga Mat',
        price: 29.99,
        image:
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8eW9nYSUyMG1hdHxlbnwwfHwwfHx8MA%3D%3D',
      },
      {
        id: '503',
        name: 'Basketball',
        price: 24.99,
        image:
          'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbHxlbnwwfHwwfHx8MA%3D%3D',
      },
      {
        id: '504',
        name: 'Fitness Tracker',
        price: 99.99,
        image:
          'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zml0bmVzcyUyMHRyYWNrZXJ8ZW58MHx8MHx8fDA%3D',
      },
    ],
  },
];

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Find the store with the matching ID
  const store = STORES.find((s) => s.id === id);

  if (!store) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Store not found</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity className="w-40 bg-white rounded-xl mr-4 shadow-sm overflow-hidden">
      <Image source={{ uri: item.image }} className="w-full h-32" />
      <View className="p-3">
        <Text className="text-sm font-medium text-gray-800 mb-1">
          {item.name}
        </Text>
        <Text className="text-lg font-bold text-blue-500">
          ${item.price.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity className="flex-row items-center justify-center bg-blue-500 py-2">
        <ShoppingBag size={16} color="#fff" />
        <Text className="text-white font-medium ml-1">Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="absolute top-14 left-5 z-10">
        <TouchableOpacity
          className="w-10 h-10 bg-white/90 rounded-full justify-center items-center shadow-sm"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: store.image }} className="w-full h-64" />

      <View className="bg-white rounded-t-3xl -mt-6 px-5 pt-6 pb-8">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {store.name}
        </Text>

        <View className="flex-row items-center mb-5">
          <Star size={18} color="#FFD700" fill="#FFD700" />
          <Text className="text-base text-gray-600 ml-1 mr-4">
            {store.rating}
          </Text>
          <Text className="text-sm text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
            {store.category}
          </Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <MapPin size={18} color="#666" />
            <Text className="text-base text-gray-600 ml-2">
              {store.location}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Clock size={18} color="#666" />
            <Text className="text-base text-gray-600 ml-2">{store.hours}</Text>
          </View>

          <View className="flex-row items-center">
            <Phone size={18} color="#666" />
            <Text className="text-base text-gray-600 ml-2">{store.phone}</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-2">About</Text>
          <Text className="text-base text-gray-600 leading-6">
            {store.description}
          </Text>
        </View>

        <View>
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Available Items
          </Text>
          <FlatList
            data={store.items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
