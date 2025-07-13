
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
CREATE POLICY "admin_allops_all_profiles" ON profiles FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "user_view_own_profiles" ON profiles FOR SELECT USING (deleted_at IS NULL AND (auth.uid() = id));
CREATE POLICY "user_add_own_profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "user_update_own_profiles" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "bizuser_view_business_profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id))
    AND deleted_at IS NULL
);
CREATE POLICY "bizuser_add_business_profiles" ON profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id))
);
CREATE POLICY "bizuser_update_business_profiles" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id))
);

-- RLS Policies for products table
CREATE POLICY "admin_allops_all_products" ON products FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "bizuser_view_business_products" ON products FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "bizuser_add_business_products" ON products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "bizuser_update_business_products" ON products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "customer_view_published_products" ON products FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business = 'customer')
    AND status = 'published' AND deleted_at IS NULL
);

-- RLS Policies for categories table
CREATE POLICY "admin_allops_all_categories" ON categories FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "bizuser_view_business_categories" ON categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "owner_add_business_categories" ON categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'owner')
);
CREATE POLICY "owner_update_business_categories" ON categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'owner')
);
CREATE POLICY "customer_view_business_categories" ON categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'customer')
    AND deleted_at IS NULL
);

-- RLS Policies for carts table
CREATE POLICY "customer_view_own_carts" ON carts FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "customer_add_own_carts" ON carts FOR INSERT WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id));
CREATE POLICY "customer_update_own_carts" ON carts FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id));
CREATE POLICY "bizuser_view_business_carts" ON carts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "bizuser_add_customer_business_carts" ON carts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m_agent WHERE m_agent.profile_id = auth.uid() AND m_agent.role_in_business IN ('owner', 'sales_agent') AND m_agent.business_id = carts.business_id)
    AND EXISTS (SELECT 1 FROM public.members m_customer WHERE m_customer.profile_id = carts.user_id AND m_customer.role_in_business = 'customer' AND m_customer.business_id = carts.business_id)
);
CREATE POLICY "bizuser_update_business_carts" ON carts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);

-- RLS Policies for cart_items table
CREATE POLICY "customer_view_own_cart_items" ON cart_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
    AND deleted_at IS NULL
);
CREATE POLICY "customer_add_own_cart_items" ON cart_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
);
CREATE POLICY "customer_update_own_cart_items" ON cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
);
CREATE POLICY "bizuser_view_business_cart_items" ON cart_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "bizuser_add_business_cart_items" ON cart_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "bizuser_update_business_cart_items" ON cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);

-- RLS Policies for orders table
CREATE POLICY "admin_allops_all_orders" ON orders FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "bizuser_view_business_orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "bizuser_add_business_orders" ON orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members m_agent WHERE m_agent.profile_id = auth.uid() AND m_agent.role_in_business IN ('owner', 'sales_agent') AND m_agent.business_id = orders.business_id)
    AND EXISTS (SELECT 1 FROM public.members m_customer WHERE m_customer.profile_id = orders.user_id AND m_customer.role_in_business = 'customer' AND m_customer.business_id = orders.business_id)
);
CREATE POLICY "bizuser_update_business_orders" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "customer_view_own_orders" ON orders FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "customer_add_business_orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id));
CREATE POLICY "customer_update_own_pending_orders" ON orders FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id) AND (SELECT status FROM public.orders WHERE id = orders.id) = 'pending');

-- RLS Policies for order_items table
CREATE POLICY "admin_allops_all_order_items" ON order_items FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "bizuser_view_business_order_items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "bizuser_add_business_order_items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "bizuser_update_business_order_items" ON order_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent'))
);
CREATE POLICY "customer_view_own_order_items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    AND deleted_at IS NULL
);

-- RLS Policies for organisations table
CREATE POLICY "admin_allops_all_organisations" ON organisations FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "bizuser_view_own_organisations" ON organisations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business IN ('owner', 'sales_agent'))
    AND deleted_at IS NULL
);
CREATE POLICY "owner_update_own_organisations" ON organisations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business = 'owner')
);
CREATE POLICY "customer_view_business_organisations" ON organisations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business = 'customer')
    AND deleted_at IS NULL
);

-- Create a SECURITY DEFINER function to check business membership and role
-- This function will bypass RLS on the members table, preventing infinite recursion.
CREATE OR REPLACE FUNCTION public.is_business_member_with_role(
    user_id uuid,
    business_id uuid,
    required_roles text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.members
        WHERE profile_id = user_id
          AND business_id = is_business_member_with_role.business_id
          AND role_in_business = ANY(required_roles)
          AND deleted_at IS NULL
    );
END;
$$;

-- Grant execute on the new function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_business_member_with_role(uuid, uuid, text[]) TO authenticated;

-- RLS Policies for members table
CREATE POLICY "admin_allops_all_members" ON members FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
CREATE POLICY "owner_view_business_members" ON members FOR SELECT USING (
    public.is_business_member_with_role(auth.uid(), members.business_id, ARRAY['owner'])
    AND deleted_at IS NULL
);
CREATE POLICY "bizuser_add_business_members" ON members FOR INSERT WITH CHECK (
    public.is_business_member_with_role(auth.uid(), members.business_id, ARRAY['owner', 'sales_agent'])
);
CREATE POLICY "owner_update_business_members" ON members FOR UPDATE USING (
    public.is_business_member_with_role(auth.uid(), members.business_id, ARRAY['owner'])
);
CREATE POLICY "salesagent_view_business_members" ON members FOR SELECT USING (
    public.is_business_member_with_role(auth.uid(), members.business_id, ARRAY['sales_agent'])
    AND deleted_at IS NULL
);
CREATE POLICY "customer_view_own_members" ON members FOR SELECT USING (profile_id = auth.uid() AND deleted_at IS NULL);
