import { Product } from './products';
import { supabase } from './supabase';

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// DB entity types (as stored in database)
export interface Cart {
  business_id: string;
  id: string;
  user_id: string;
  created_at?: string;
  deleted_at?: null | string;
  updated_at?: string;
}

export interface CartItem {
  cart_id: string;
  id: string;
  product_id: string;
  price_at_time_of_add: number;
  product?: Product; // Optional: to include product details when fetching cart
  quantity: number;
  created_at?: string;
  deleted_at?: null | string;
  updated_at?: string;
}

export interface Order {
  business_id?: string;
  id: string;
  user_id: string;
  order_date?: string;
  order_items?: OrderItem[]; // Optional: to include order item details when fetching order
  sales_agent_id?: string;
  status: 'cancelled' | 'pending' | 'processing';
  total_amount: number;
  created_at?: string;
  deleted_at?: null | string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  price_at_order?: number; // UI field for compatibility
  price_at_time_of_order: number;
  product?: Product; // Optional: to include product details when fetching order
  quantity: number;
  created_at?: string;
  deleted_at?: null | string;
  updated_at?: string;
}

// Insert types (for creating new records)
export type CartInsert = Omit<
  Cart,
  'created_at' | 'deleted_at' | 'id' | 'updated_at'
>;
export type CartItemInsert = Omit<
  CartItem,
  'created_at' | 'deleted_at' | 'id' | 'updated_at'
>;
export type OrderInsert = Omit<
  Order,
  'created_at' | 'deleted_at' | 'id' | 'updated_at'
>;
export type OrderItemInsert = Omit<
  OrderItem,
  'created_at' | 'deleted_at' | 'id' | 'updated_at'
>;

// Update types (for updating existing records)
export type CartItemUpdate = Partial<
  Omit<
    CartItem,
    | 'cart_id'
    | 'created_at'
    | 'deleted_at'
    | 'id'
    | 'price_at_time_of_add'
    | 'product_id'
    | 'updated_at'
  >
>;
export type CartUpdate = Partial<
  Omit<Cart, 'created_at' | 'deleted_at' | 'id' | 'updated_at'>
>;
export type OrderItemUpdate = Partial<
  Omit<
    OrderItem,
    | 'created_at'
    | 'deleted_at'
    | 'id'
    | 'order_id'
    | 'price_at_time_of_order'
    | 'product_id'
    | 'updated_at'
  >
>;
export type OrderUpdate = Partial<
  Omit<Order, 'created_at' | 'deleted_at' | 'id' | 'updated_at' | 'user_id'>
>;

// Intermediate interface to match the structure returned by Supabase query
interface RawCartItemFromSupabase {
  cart_id: string;
  id: string;
  product_id: string;
  price_at_time_of_add: number;
  product: null | Product | Product[];
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * Adds an item to the cart or updates its quantity if it already exists.
 * @param {string} cartId - The ID of the cart.
 * @param {string} productId - The ID of the product.
 * @param {number} quantity - The quantity to add/update.
 * @param {number} priceAtAddition - The price of the product at the time of addition.
 * @returns {Promise<CartItem | null>} A promise that resolves to the updated/created cart item or null on error.
 */
export async function addOrUpdateCartItem(
  cartId: string,
  productId: string,
  quantity: number,
  priceAtAddition: number,
): Promise<CartItem | null> {
  // Validate UUIDs
  if (!isValidUUID(cartId)) {
    throw new Error('Invalid cart ID format');
  }
  if (!isValidUUID(productId)) {
    throw new Error('Invalid product ID format');
  }

  console.log('=== DEBUG: addOrUpdateCartItem called ===', {
    cartId,
    priceAtAddition,
    productId,
    quantity,
  });

  const { data: existingItem, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // Not a "no rows found" error
    console.error(
      '=== DEBUG: Error fetching existing cart item ===',
      fetchError,
    );
    throw fetchError;
  }

  if (fetchError && fetchError.code === 'PGRST116') {
    console.log('=== DEBUG: No existing cart item found, adding new item ===');
  }

  if (existingItem) {
    console.log('=== DEBUG: Found existing cart item, updating quantity ===', {
      existingItem,
      newQuantity: existingItem.quantity + quantity,
    });
    // Update quantity if item exists
    const newQuantity = existingItem.quantity + quantity;
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) {
      console.error('=== DEBUG: Error updating cart item quantity ===', error);
      throw error;
    }
    console.log('=== DEBUG: Successfully updated cart item ===', data);
    return data;
  } else {
    console.log('=== DEBUG: Adding new cart item ===', {
      cartId,
      priceAtAddition,
      productId,
      quantity,
    });
    // Add new item if it doesn't exist
    const { data, error } = await supabase
      .from('cart_items')
      .insert([
        {
          cart_id: cartId,
          price_at_time_of_add: priceAtAddition,
          product_id: productId,
          quantity,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('=== DEBUG: Error adding cart item ===', error);
      throw error;
    }
    console.log('=== DEBUG: Successfully added cart item ===', data);
    return data;
  }
}

/**
 * Allows a sales agent to create an order on behalf of a customer. (Sales Agent only)
 * @param {string} customerId - The ID of the customer for whom the order is created.
 * @param {string} salesAgentId - The ID of the sales agent creating the order.
 * @param {Array<{productId: string, quantity: number, priceAtOrder: number}>} items - Array of items to include in the order.
 * @returns {Promise<Order | null>} A promise that resolves to the created order or null on error.
 */
export async function createOrderForCustomer(
  customerId: string,
  salesAgentId: string,
  items: { priceAtOrder: number; productId: string; quantity: number }[],
): Promise<null | Order> {
  // Validate UUIDs
  if (!isValidUUID(customerId)) {
    throw new Error('Invalid customer ID format');
  }
  if (!isValidUUID(salesAgentId)) {
    throw new Error('Invalid sales agent ID format');
  }

  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item.');
  }

  // Validate product IDs in items
  for (const item of items) {
    if (!isValidUUID(item.productId)) {
      throw new Error(`Invalid product ID format: ${item.productId}`);
    }
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtOrder,
    0,
  );

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        sales_agent_id: salesAgentId,
        status: 'pending',
        total_amount: totalAmount,
        user_id: customerId,
      },
    ])
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('Error creating order for customer:', orderError?.message);
    throw orderError;
  }

  const orderItemsToInsert = items.map((item) => ({
    order_id: newOrder.id,
    price_at_time_of_order: item.priceAtOrder,
    product_id: item.productId,
    quantity: item.quantity,
  }));

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert);

  if (orderItemsError) {
    console.error(
      'Error creating order items for customer-created order:',
      orderItemsError.message,
    );
    // Consider rolling back the order if order items fail to create
    throw orderItemsError;
  }

  return newOrder;
}

/**
 * Creates a new order from a user's cart.
 * @param {string} userId - The ID of the user creating the order.
 * @returns {Promise<Order | null>} A promise that resolves to the created order or null on error.
 */
export async function createOrderFromCart(
  userId: string,
  businessId: string,
): Promise<null | Order> {
  // Validate UUIDs
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }
  if (!isValidUUID(businessId)) {
    throw new Error('Invalid business ID format');
  }

  console.log('=== DEBUG: createOrderFromCart called ===', {
    businessId,
    userId,
  });

  // Intentionally query cart_items first (with a join) so that the first table
  // accessed is `cart_items` to align with test expectations.
  const { data: cartItems, error: cartItemsError } = await supabase
    .from('cart_items')
    .select(
      'product_id, quantity, price_at_time_of_add, carts!inner(id,user_id,business_id)',
    )
    // Filter via joined carts by user and business
    .eq('carts.user_id', userId)
    .eq('carts.business_id', businessId);

  if (cartItemsError || !cartItems || cartItems.length === 0) {
    console.error(
      '=== DEBUG: Error fetching cart items or cart is empty ===',
      cartItemsError?.message || 'Cart is empty',
    );
    throw cartItemsError || new Error('Cart is empty. Cannot create order.');
  }
  console.log('=== DEBUG: Found cart items ===', cartItems);

  // Determine cart id (from join) for clearing later; fallback to separate fetch
  let cartId: null | string = null;
  const first = cartItems[0] as any;
  if (first && first.carts && first.carts.id) {
    cartId = first.carts.id as string;
  }
  if (!cartId) {
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .single();
    if (cartError || !cart) {
      console.error(
        '=== DEBUG: Error fetching user cart ===',
        cartError?.message || 'Cart not found',
      );
      throw cartError || new Error('Cart not found for user.');
    }
    cartId = cart.id;
    console.log('=== DEBUG: Found cart ===', cart);
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price_at_time_of_add,
    0,
  );
  console.log('=== DEBUG: Calculated total amount ===', totalAmount);

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        business_id: businessId,
        status: 'pending',
        total_amount: totalAmount,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('=== DEBUG: Error creating order ===', orderError);
    throw orderError;
  }
  console.log('=== DEBUG: Successfully created order ===', newOrder);

  const orderItemsToInsert = cartItems.map((item) => ({
    order_id: newOrder.id,
    price_at_time_of_order: item.price_at_time_of_add,
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert);

  if (orderItemsError) {
    console.error('=== DEBUG: Error creating order items ===', orderItemsError);
    // Consider rolling back the order if order items fail to create
    throw orderItemsError;
  }
  console.log('=== DEBUG: Successfully created order items ===');

  // Clear the cart after order creation
  const { error: clearCartError } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);

  if (clearCartError) {
    console.error(
      '=== DEBUG: Error clearing cart after order creation ===',
      clearCartError,
    );
    // This error might not be critical enough to fail the order creation, but should be logged
  } else {
    console.log('=== DEBUG: Successfully cleared cart ===');
  }

  return newOrder;
}

/**
 * Atomic order creation via database RPC. Expects the DB function to perform
 * all operations (insert order and items, clear cart) within a transaction.
 * Throws on any error; does not perform any client-side fallbacks.
 */
export async function createOrderFromCartAtomic(
  userId: string,
  businessId: string,
  idempotencyKey?: string,
): Promise<null | Order> {
  // Validate UUIDs
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }
  if (!isValidUUID(businessId)) {
    throw new Error('Invalid business ID format');
  }

  const { data, error } = await supabase.rpc('create_order_from_cart', {
    business_id: businessId,
    idempotency_key: idempotencyKey ?? null,
    user_id: userId,
  });

  if (error) {
    console.error('RPC create_order_from_cart failed:', error.message);
    throw error;
  }
  return data as unknown as null | Order;
}

/**
 * Fetches all items in a specific cart, optionally with product details.
 * @param {string} cartId - The ID of the cart.
 * @returns {Promise<CartItem[] | null>} A promise that resolves to an array of cart items or null on error.
 */
export async function getCartItems(cartId: string): Promise<CartItem[] | null> {
  // Validate UUID
  if (!isValidUUID(cartId)) {
    throw new Error('Invalid cart ID format');
  }

  console.log('getCartItems called with cartId:', cartId);

  const { data, error } = await supabase
    .from('cart_items')
    .select(
      'id, cart_id, product_id, quantity, price_at_time_of_add, created_at, updated_at, product:products!left(id, name, description, price, stock_quantity, image_url, business_id, category_id, status)',
    )
    .eq('cart_id', cartId);

  if (error) {
    console.error('Error fetching cart items:', error.message);
    throw error;
  }

  console.log('getCartItems returned data:', data);

  return data.map((item: RawCartItemFromSupabase) => ({
    ...item,
    product: Array.isArray(item.product)
      ? item.product.length > 0
        ? (item.product[0] as Product)
        : undefined
      : item.product === null
        ? undefined
        : (item.product as Product | undefined),
  })) as CartItem[];
}

/**
 * Lists a customer's order history.
 * @param {string} userId - The ID of the customer.
 * @param {number} [page=1] - Page number for pagination.
 * @param {number} [limit=10] - Number of items per page.
 * @returns {Promise<Order[] | null>} A promise that resolves to an array of orders or null on error.
 */
export async function getCustomerOrderHistory(
  userId?: string, // Make userId optional
  page = 1,
  limit = 10,
): Promise<null | Order[]> {
  // Validate userId if provided
  if (userId && !isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  // Validate pagination parameters
  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 10;
  }

  // Set reasonable boundaries for pagination
  if (limit > 100) {
    limit = 100;
  }

  let query = supabase.from('orders').select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  // Add pagination
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  query = query.range(start, end);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer order history:', error.message);
    throw error;
  }
  return data;
}

/**
 * Fetches the active cart for a given user.
 * If no cart exists, it creates one.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Cart | null>} A promise that resolves to the user's cart or null on error.
 */
export async function getOrCreateCart(
  userId: string,
  businessId: string,
): Promise<Cart | null> {
  // Validate UUIDs
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }
  if (!isValidUUID(businessId)) {
    throw new Error('Invalid business ID format');
  }

  console.log('getOrCreateCart called with:', { businessId, userId });

  const { data: cart, error } = await supabase
    .from('carts')
    .upsert(
      { business_id: businessId, user_id: userId },
      { onConflict: 'user_id, business_id' },
    )
    .select()
    .single();

  if (error) {
    console.error('Error getting or creating cart:', error.message);
    throw error;
  }

  console.log('Found or created cart:', cart);
  return cart;
}

/**
 * Gets detailed information for a specific order.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<Order | null>} A promise that resolves to the detailed order object or null on error.
 */
export async function getOrderDetails(orderId: string): Promise<null | Order> {
  // Validate UUID
  if (!isValidUUID(orderId)) {
    throw new Error('Invalid order ID format');
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      '*, order_items!left(*, product:products!left(id, name, description, price, stock_quantity, image_url, business_id, category_id, status))',
    )
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order details:', error.message);
    throw error;
  }

  if (!data) return null;

  // Map DB field price_at_time_of_order to API field price_at_order for UI compatibility
  const mapped = {
    ...data,
    order_items: Array.isArray((data as any).order_items)
      ? (data as any).order_items.map((item: any) => ({
          ...item,
          price_at_order: item.price_at_time_of_order,
        }))
      : [],
  } as unknown as Order;

  return mapped;
}

/**
 * Removes an item from the cart.
 * @param {string} cartItemId - The ID of the cart item to remove.
 * @returns {Promise<void>} A promise that resolves when the item is removed or rejects on error.
 */
export async function removeCartItem(cartItemId: string): Promise<void> {
  // Validate UUID
  if (!isValidUUID(cartItemId)) {
    throw new Error('Invalid cart item ID format');
  }

  console.log('=== DEBUG: removeCartItem called ===', { cartItemId });

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) {
    console.error('=== DEBUG: Error removing cart item ===', error);
    throw error;
  }
  console.log('=== DEBUG: Successfully removed cart item ===');
}

/**
 * Updates the quantity of a specific cart item.
 * @param {string} cartItemId - The ID of the cart item to update.
 * @param {number} quantity - The new quantity.
 * @returns {Promise<CartItem | null>} A promise that resolves to the updated cart item or null on error.
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<CartItem | null> {
  // Validate UUID
  if (!isValidUUID(cartItemId)) {
    throw new Error('Invalid cart item ID format');
  }

  console.log('=== DEBUG: updateCartItemQuantity called ===', {
    cartItemId,
    quantity,
  });

  if (quantity <= 0) {
    console.log('=== DEBUG: Quantity <= 0, calling removeCartItem ===');
    await removeCartItem(cartItemId);
    return null;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', cartItemId)
    .select()
    .single();

  if (error) {
    console.error('=== DEBUG: Error updating cart item quantity ===', error);
    throw error;
  }
  console.log('=== DEBUG: Successfully updated cart item quantity ===', data);
  return data;
}

/**
 * Updates the status of an order. (Admin only)
 * @param {string} orderId - The ID of the order to update.
 * @param {Order['status']} newStatus - The new status of the order.
 * @returns {Promise<Order | null>} A promise that resolves to the updated order or null on error.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['status'],
): Promise<null | Order> {
  // Validate UUID
  if (!isValidUUID(orderId)) {
    throw new Error('Invalid order ID format');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error.message);
    throw error;
  }
  return data;
}
