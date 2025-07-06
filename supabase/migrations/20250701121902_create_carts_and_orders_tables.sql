-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the carts table
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the cart_items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_addition NUMERIC(10, 2) NOT NULL, -- Price at the time item was added to cart
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (cart_id, product_id) -- Ensure only one entry per product per cart
);

-- Create the orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- The customer
  seller_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable, if created by a seller agent
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_order NUMERIC(10, 2) NOT NULL, -- Price at the time of order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (order_id, product_id) -- Ensure only one entry per product per order
);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carts
-- Customers can SELECT, INSERT, UPDATE, DELETE their own carts
CREATE POLICY "Customers can view their own carts." ON carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers can create their own carts." ON carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Customers can update their own carts." ON carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Customers can delete their own carts." ON carts FOR DELETE USING (auth.uid() = user_id);
-- Admins can SELECT all carts
CREATE POLICY "Admins can view all carts." ON carts FOR SELECT USING (auth.role() = 'admin');

-- RLS Policies for cart_items
-- Customers can SELECT, INSERT, UPDATE, DELETE their own cart items
CREATE POLICY "Customers can view their own cart items." ON cart_items FOR SELECT USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Customers can add items to their carts." ON cart_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Customers can update items in their carts." ON cart_items FOR UPDATE USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Customers can remove items from their carts." ON cart_items FOR DELETE USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_id AND carts.user_id = auth.uid()));
-- Admins can SELECT all cart items
CREATE POLICY "Admins can view all cart items." ON cart_items FOR SELECT USING (auth.role() = 'admin');

-- RLS Policies for orders
-- Customers can SELECT their own orders
CREATE POLICY "Customers can view their own orders." ON orders FOR SELECT USING (auth.uid() = user_id);
-- Admins can SELECT all orders, UPDATE order status, and INSERT orders (on behalf of customers)
CREATE POLICY "Admins can view all orders." ON orders FOR SELECT USING (auth.role() = 'admin');
CREATE POLICY "Admins can update order status." ON orders FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "Admins can create orders on behalf of customers." ON orders FOR INSERT WITH CHECK (auth.role() = 'admin');
-- Seller agents can SELECT all orders and INSERT orders on behalf of customers
CREATE POLICY "Seller agents can view all orders." ON orders FOR SELECT USING (auth.role() = 'seller_agent');
CREATE POLICY "Seller agents can create orders on behalf of customers." ON orders FOR INSERT WITH CHECK (auth.role() = 'seller_agent');

-- RLS Policies for order_items
-- Customers can SELECT their own order items
CREATE POLICY "Customers can view their own order items." ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));
-- Admins can SELECT all order items
CREATE POLICY "Admins can view all order items." ON order_items FOR SELECT USING (auth.role() = 'admin');
-- Seller agents can SELECT all order items
CREATE POLICY "Seller agents can view all order items." ON order_items FOR SELECT USING (auth.role() = 'seller_agent');