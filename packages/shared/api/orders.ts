import { Product } from './products';
import { supabase } from './supabase';

export interface Cart {
  created_at: string;
  id: string;
  updated_at: string;
  user_id: string;
}

export interface CartItem {
  cart_id: string;
  created_at: string;
  id: string;
  price_at_addition: number;
  product?: Product; // Optional: to include product details when fetching cart
  product_id: string;
  quantity: number;
  updated_at: string;
}

export interface Order {
  created_at: string;
  id: string;
  order_date: string;
  order_items?: OrderItem[]; // Optional: to include order item details when fetching order
  sales_agent_id?: string;
  status: 'cancelled' | 'delivered' | 'pending' | 'processing' | 'shipped';
  total_amount: number;
  updated_at: string;
  user_id: string;
}

export interface OrderItem {
  created_at: string;
  id: string;
  order_id: string;
  price_at_order: number;
  product?: Product; // Optional: to include product details when fetching order
  product_id: string;
  quantity: number;
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
  const { data: existingItem, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // Not a "no rows found" error
    console.error('Error fetching existing cart item:', fetchError.message);
    throw fetchError;
  }
  if (existingItem) {
    // Update quantity if item exists
    const newQuantity = existingItem.quantity + quantity;
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item quantity:', error.message);
      throw error;
    }
    return data;
  } else {
    // Add new item if it doesn't exist
    const { data, error } = await supabase
      .from('cart_items')
      .insert([
        {
          cart_id: cartId,
          price_at_addition: priceAtAddition,
          product_id: productId,
          quantity,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding cart item:', error.message);
      throw error;
    }
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
  items: { priceAtOrder: number; productId: string; quantity: number; }[],
): Promise<null | Order> {
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item.');
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.priceAtOrder, 0);

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
    price_at_order: item.priceAtOrder,
    product_id: item.productId,
    quantity: item.quantity,
  }));

  const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

  if (orderItemsError) {
    console.error('Error creating order items for customer-created order:', orderItemsError.message);
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
export async function createOrderFromCart(userId: string): Promise<null | Order> {
  const { data: cart, error: cartError } = await supabase.from('carts').select('id').eq('user_id', userId).single();

  if (cartError || !cart) {
    console.error('Error fetching user cart:', cartError?.message || 'Cart not found');
    throw cartError || new Error('Cart not found for user.');
  }

  const { data: cartItems, error: cartItemsError } = await supabase
    .from('cart_items')
    .select('product_id, quantity, price_at_addition')
    .eq('cart_id', cart.id);

  if (cartItemsError || !cartItems || cartItems.length === 0) {
    console.error('Error fetching cart items or cart is empty:', cartItemsError?.message || 'Cart is empty');
    throw cartItemsError || new Error('Cart is empty. Cannot create order.');
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.price_at_addition, 0);

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        status: 'pending',
        total_amount: totalAmount,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('Error creating order:', orderError?.message);
    throw orderError;
  }

  const orderItemsToInsert = cartItems.map((item) => ({
    order_id: newOrder.id,
    price_at_order: item.price_at_addition,
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

  if (orderItemsError) {
    console.error('Error creating order items:', orderItemsError.message);
    // Consider rolling back the order if order items fail to create
    throw orderItemsError;
  }

  // Clear the cart after order creation
  const { error: clearCartError } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);

  if (clearCartError) {
    console.error('Error clearing cart after order creation:', clearCartError.message);
    // This error might not be critical enough to fail the order creation, but should be logged
  }

  return newOrder;
}

/**
 * Fetches all items in a specific cart, optionally with product details.
 * @param {string} cartId - The ID of the cart.
 * @returns {Promise<CartItem[] | null>} A promise that resolves to an array of cart items or null on error.
 */
export async function getCartItems(cartId: string): Promise<CartItem[] | null> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)') // Select all cart item fields and join product details
    .eq('cart_id', cartId);

  if (error) {
    console.error('Error fetching cart items:', error.message);
    throw error;
  }
  return data as CartItem[];
}

/**
 * Lists a customer's order history.
 * @param {string} userId - The ID of the customer.
 * @returns {Promise<Order[] | null>} A promise that resolves to an array of orders or null on error.
 */
export async function getCustomerOrderHistory(
  userId?: string, // Make userId optional
): Promise<null | Order[]> {
  let query = supabase.from('orders').select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('order_date', { ascending: false });

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
export async function getOrCreateCart(userId: string): Promise<Cart | null> {
  let { data: cart, error } = await supabase.from('carts').select('*').eq('user_id', userId).single();

  if (error && error.code === 'PGRST116') {
    // No rows found
    // Create a new cart if one doesn't exist
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating cart:', createError.message);
      throw createError;
    }
    cart = newCart;
  } else if (error) {
    console.error('Error fetching cart:', error.message);
    throw error;
  }
  return cart;
}

/**
 * Gets detailed information for a specific order.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<Order | null>} A promise that resolves to the detailed order object or null on error.
 */
export async function getOrderDetails(orderId: string): Promise<null | Order> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))') // Select order and join order_items with product details
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order details:', error.message);
    throw error;
  }
  return data as Order;
}

/**
 * Removes an item from the cart.
 * @param {string} cartItemId - The ID of the cart item to remove.
 * @returns {Promise<void>} A promise that resolves when the item is removed or rejects on error.
 */
export async function removeCartItem(cartItemId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);

  if (error) {
    console.error('Error removing cart item:', error.message);
    throw error;
  }
}

/**
 * Updates the quantity of a specific cart item.
 * @param {string} cartItemId - The ID of the cart item to update.
 * @param {number} quantity - The new quantity.
 * @returns {Promise<CartItem | null>} A promise that resolves to the updated cart item or null on error.
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem | null> {
  if (quantity <= 0) {
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
    console.error('Error updating cart item quantity:', error.message);
    throw error;
  }
  return data;
}

/**
 * Updates the status of an order. (Admin only)
 * @param {string} orderId - The ID of the order to update.
 * @param {Order['status']} newStatus - The new status of the order.
 * @returns {Promise<Order | null>} A promise that resolves to the updated order or null on error.
 */
export async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<null | Order> {
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
