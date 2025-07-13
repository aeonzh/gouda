
-- Enable Row Level Security (RLS) for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (deleted_at IS NULL AND (auth.uid() = id));
CREATE POLICY "Users can create their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can soft-delete their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Owners/Sales Agents can view profiles associated with their business" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id))
    AND deleted_at IS NULL
);
CREATE POLICY "Owners/Sales Agents can create profiles associated with their business" ON profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id))
);
CREATE POLICY "Owners/Sales Agents can update profiles associated with their business" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id))
);
CREATE POLICY "Owners/Sales Agents can soft-delete profiles associated with their business" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id))
);

-- RLS Policies for products table
CREATE POLICY "Admins can view all products" ON products FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "Owners/Sales Agents can view products associated with their business" ON products FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "Owners/Sales Agents can add products to their business" ON products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners/Sales Agents can update products in their business" ON products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners/Sales Agents can soft-delete products from their business" ON products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Customers can view published products from businesses they are members of" ON products FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business = 'customer')
    AND status = 'published' AND deleted_at IS NULL
);

-- RLS Policies for categories table
CREATE POLICY "Admins can view all categories" ON categories FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "Owners/Sales Agents can view categories associated with their business" ON categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "Owners can add categories to their business" ON categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'owner')
);
CREATE POLICY "Owners can update categories in their business" ON categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'owner')
);
CREATE POLICY "Owners can soft-delete categories from their business" ON categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'owner')
);
CREATE POLICY "Customers can view categories from businesses they are members of" ON categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'customer')
    AND deleted_at IS NULL
);

-- RLS Policies for carts table
CREATE POLICY "Customers can view their own cart" ON carts FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Customers can create their own cart" ON carts FOR INSERT WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id));
CREATE POLICY "Customers can update their own cart" ON carts FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id));
CREATE POLICY "Customers can soft-delete their own cart" ON carts FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Owners/Sales Agents can view carts associated with their business" ON carts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "Owners/Sales Agents can create carts for a customer within their business" ON carts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m_agent WHERE m_agent.profile_id = auth.uid() AND m_agent.role_in_business IN ('owner', 'sales_agent') AND m_agent.business_id = carts.business_id)
    AND EXISTS (SELECT 1 FROM public.members m_customer WHERE m_customer.profile_id = carts.user_id AND m_customer.role_in_business = 'customer' AND m_customer.business_id = carts.business_id)
);
CREATE POLICY "Owners/Sales Agents can update carts associated with their business" ON carts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners/Sales Agents can soft-delete carts associated with their business" ON carts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);

-- RLS Policies for cart_items table
CREATE POLICY "Customers can view items in their own cart" ON cart_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
    AND deleted_at IS NULL
);
CREATE POLICY "Customers can add items to their own cart" ON cart_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
);
CREATE POLICY "Customers can update items in their own cart" ON cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
);
CREATE POLICY "Customers can soft-delete items from their own cart" ON cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
);
CREATE POLICY "Owners/Sales Agents can view cart items for carts associated with their business" ON cart_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "Owners/Sales Agents can manage cart items for carts associated with their business" ON cart_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners/Sales Agents can update cart items for carts associated with their business" ON cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners/Sales Agents can soft-delete cart items for carts associated with their business" ON cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);

-- RLS Policies for orders table
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "Owners/Sales Agents can view orders associated with their business" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "Owners/Sales Agents can create orders associated with their business" ON orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m_agent WHERE m_agent.profile_id = auth.uid() AND m_agent.role_in_business IN ('owner', 'sales_agent') AND m_agent.business_id = orders.business_id)
    AND EXISTS (SELECT 1 FROM public.members m_customer WHERE m_customer.profile_id = orders.user_id AND m_customer.role_in_business = 'customer' AND m_customer.business_id = orders.business_id)
);
CREATE POLICY "Owners/Sales Agents can update orders associated with their business" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners/Sales Agents can soft-delete orders associated with their business" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Customers can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Customers can create orders for businesses they are a member of" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id));
CREATE POLICY "Customers can update their own orders when pending" ON orders FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id) AND (SELECT status FROM public.orders WHERE id = orders.id) = 'pending');

-- RLS Policies for order_items table
CREATE POLICY "Admins can view all order items" ON order_items FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "Owners/Sales Agents can view order items associated with their business" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "Owners/Sales Agents can create order items associated with their business" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners/Sales Agents can update order items associated with their business" ON order_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners/Sales Agents can soft-delete order items associated with their business" ON order_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Customers can view items in their own orders" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    AND deleted_at IS NULL
);

-- RLS Policies for organisations table
CREATE POLICY "Admins can view all organisations" ON organisations FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "Owners/Sales Agents can view their own organisation" ON organisations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "Owners can update their own organisation" ON organisations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business = 'owner')
);
CREATE POLICY "Owners can soft-delete their organisation" ON organisations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business = 'owner')
);
CREATE POLICY "Customers can view organisations they are a member of" ON organisations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business = 'customer')
    AND deleted_at IS NULL
);

-- RLS Policies for members table
CREATE POLICY "Admins can view all organisation memberships" ON members FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "Owners can view members within their business" ON members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'owner')
    AND deleted_at IS NULL
);
CREATE POLICY "Owners and Sales Agents can create members within their business" ON members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "Owners can update members within their business" ON members FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'owner')
);
CREATE POLICY "Owners can soft-delete members within their business" ON members FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'owner')
);
CREATE POLICY "Sales agents can view members within their business" ON members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'sales_agent')
    AND deleted_at IS NULL
);
CREATE POLICY "Customers can view their own membership record" ON members FOR SELECT USING (profile_id = auth.uid() AND deleted_at IS NULL);
