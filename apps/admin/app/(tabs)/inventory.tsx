import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  InventoryProduct,
  adjustInventoryLevel,
  getInventoryLevels,
} from 'shared/api/products';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const router = useRouter();

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInventoryLevels();
      setInventory(data || []);
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch inventory: ${error.message}`);
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInventory();
  }, [fetchInventory]);

  const handleAdjustInventoryPress = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setNewQuantity(product.stock_quantity.toString());
    setModalVisible(true);
  };

  const handleSaveQuantity = async () => {
    if (!selectedProduct || isNaN(Number(newQuantity))) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    const quantity = Number(newQuantity);
    if (quantity < 0) {
      Alert.alert('Error', 'Quantity cannot be negative.');
      return;
    }

    try {
      await adjustInventoryLevel(selectedProduct.id, quantity);
      Alert.alert('Success', 'Inventory adjusted successfully.');
      setModalVisible(false);
      fetchInventory(); // Refresh the list
    } catch (error: any) {
      Alert.alert('Error', `Failed to adjust inventory: ${error.message}`);
      console.error('Error adjusting inventory:', error);
    }
  };

  const renderInventoryItem = ({ item }: { item: InventoryProduct }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-600">
          Current Stock: {item.stock_quantity}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleAdjustInventoryPress(item)}
        className="p-2 rounded-full bg-blue-100"
      >
        <Feather name="edit" size={20} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-700">Loading inventory...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Inventory Management',
          headerLargeTitle: true,
          headerTransparent: false,
          headerBlurEffect: 'light',
        }}
      />
      {inventory.length === 0 && !loading ? (
        <View className="flex-1 justify-center items-center p-4">
          <Feather name="box" size={60} color="#9CA3AF" />
          <Text className="text-xl text-gray-600 mt-4 font-semibold">
            No Inventory Items Found
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            It looks like there are no products with inventory to manage.
          </Text>
        </View>
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(item) => item.id}
          renderItem={renderInventoryItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          className="flex-1"
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-md">
            <Text className="text-xl font-bold mb-4 text-gray-800">
              Adjust Stock for {selectedProduct?.name}
            </Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-md text-lg mb-4"
              keyboardType="numeric"
              placeholder="Enter new quantity"
              value={newQuantity}
              onChangeText={setNewQuantity}
            />
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="px-5 py-3 rounded-md bg-gray-200"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveQuantity}
                className="px-5 py-3 rounded-md bg-indigo-600"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
