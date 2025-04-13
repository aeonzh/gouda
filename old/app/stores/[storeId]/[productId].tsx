import { useState } from 'react';
import { View, Image, ScrollView, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import CartButton from '@/components/CartButton';

import STORE_PRODUCTS from '@/mock/storeproducts.json';

export default function StoreDetailScreen() {
  const { storeId, productId } = useLocalSearchParams();
  const [cartItems, setCartProducts] = useState([]);

  const storeProducts = STORE_PRODUCTS[storeId] || [];
  const product = storeProducts.find((p) => p.id === productId);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: product.name,
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
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
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
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productDescription: {
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
