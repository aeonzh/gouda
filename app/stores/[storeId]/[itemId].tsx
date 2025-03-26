import { useState } from 'react';
import { View, Image, ScrollView, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import CartButton from '@/components/CartButton';

import STORE_ITEMS from '@/mock/storeitems.json';

export default function StoreDetailScreen() {
  const { storeId, itemId } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState([]);

  const storeItems = STORE_ITEMS[storeId] || [];
  const item = storeItems.find((i) => i.id === itemId);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: item.name,
          headerTitleStyle: { color: '#fff', fontSize: 18 },
          headerStyle: { backgroundColor: 'transparent' },
          headerTransparent: true,
          headerBackVisible: true,
          headerBackTitle: '',
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.itemContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.cartButtonContainer}>
        <CartButton itemCount={cartItems.length} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  itemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  cartButtonContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
  },
});
