import { useRouter } from 'expo-router';
import {
  getAuthorizedBusinesses,
  Organisation,
} from 'packages/shared/api/organisations';
import { Input, useAuth } from 'packages/shared/components';
import { useEffect, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

import '@/global.css';

interface VendorCardProps {
  onPress: (vendorId: string) => void;
  vendor: Organisation;
}

const StorefrontCard: React.FC<VendorCardProps> = ({ onPress, vendor }) => (
  <TouchableOpacity
    className='mb-4 min-h-32 rounded-lg border border-gray-200 bg-white p-4 shadow-sm'
    onPress={() => onPress(vendor.id)}
  >
    <View className='min-h-full flex-row items-center'>
      {vendor.image_url ? (
        <Image
          className='mr-4 h-12 w-12'
          source={{ uri: vendor.image_url }}
        />
      ) : (
        <View className='mr-4 h-12 w-12 items-center justify-center rounded-full bg-gray-200'>
          <Text className='text-lg font-bold text-gray-600'>
            {vendor.name.charAt(0)}
          </Text>
        </View>
      )}
      <View className='flex-1 py-2'>
        <Text className='text-lg font-bold'>{vendor.name}</Text>
        {vendor.description && (
          <Text className='text-sm text-gray-500'>{vendor.description}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<Organisation[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);
          const authorizedVendors = await getAuthorizedBusinesses(
            session.user.id,
          );
          if (authorizedVendors) {
            setVendors(authorizedVendors);
            setFilteredVendors(authorizedVendors);
          }
        } catch (err) {
          console.error('Failed to fetch authorized vendors:', err);
          setError('Failed to load vendors. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchVendors();
  }, [session?.user?.id]);

  useEffect(() => {
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = vendors.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(lowerCaseQuery) ||
          vendor.address_line1.toLowerCase().includes(lowerCaseQuery) ||
          (vendor.address_line2 &&
            vendor.address_line2.toLowerCase().includes(lowerCaseQuery)) ||
          vendor.city.toLowerCase().includes(lowerCaseQuery) ||
          vendor.state.toLowerCase().includes(lowerCaseQuery) ||
          vendor.postal_code.toLowerCase().includes(lowerCaseQuery) ||
          vendor.country.toLowerCase().includes(lowerCaseQuery),
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors(vendors);
    }
  }, [searchQuery, vendors]);

  const handleVendorPress = (vendorId: string) => {
    router.push(`/storefront/${vendorId}`);
  };

  return (
    <View className='flex-1 bg-white'>
      {/* Header */}
      <View className='flex-row items-center justify-between border-b border-gray-200 p-4'>
        <View className='mr-4 flex-1'>
          <Input
            onChangeText={setSearchQuery}
            placeholder='Search vendors...'
            value={searchQuery}
          />
        </View>
        <TouchableOpacity
          className='rounded-md bg-blue-500 px-4 py-2'
          onPress={() => {
            /* No action for now */
          }}
        >
          <Text className='text-white'>Add New Vendors</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area - Authorized Vendor List */}
      <View className='flex-1 p-4'>
        {loading && (
          <Text className='text-center text-gray-500'>Loading vendors...</Text>
        )}
        {error && <Text className='text-center text-red-500'>{error}</Text>}
        {!loading && !error && filteredVendors.length === 0 && (
          <Text className='text-center text-lg font-bold text-gray-600'>
            No authorized vendors found.
          </Text>
        )}
        <FlatList
          contentContainerStyle={{ paddingBottom: 16 }}
          data={filteredVendors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StorefrontCard
              onPress={handleVendorPress}
              vendor={item}
            />
          )}
        />
      </View>
    </View>
  );
}
