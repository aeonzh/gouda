-- This file sets up Row Level Security (RLS) policies for various tables in the database.
-- These policies control data access based on user roles (admin, owner, sales_agent, customer)
-- and business affiliations, ensuring that users can only access and modify data relevant to them.

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
SET search_path = ''
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


-- RLS Policies for profiles table

-- Policy for selecting profiles: Allows admins to view all profiles, users to view their own profile, and business owners/sales agents to view profiles within their business.
CREATE POLICY "profiles_select_access" ON profiles FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        ((select auth.uid()) = id) OR
        (EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = (select auth.uid()) AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id)))
    )
);
-- Policy for inserting profiles: Allows admins to insert any profile, users to insert their own profile, and business owners/sales agents to insert profiles within their business.
CREATE POLICY "profiles_insert_access" ON profiles FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    ((select auth.uid()) = id) OR
    (EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = (select auth.uid()) AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id)))
);
-- Policy for updating profiles: Allows admins to update any profile, users to update their own profile, and business owners/sales agents to update profiles within their business.
CREATE POLICY "profiles_update_access" ON profiles FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    ((select auth.uid()) = id) OR
    (EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = (select auth.uid()) AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id)))
);
-- Policy for deleting profiles: Allows only admins to delete profiles.
CREATE POLICY "profiles_delete_access" ON profiles FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);

-- RLS Policies for products table

-- Policy for selecting products: Allows admins to view all products, business owners/sales agents to view products within their business, and customers to view published products within their business.
CREATE POLICY "products_select_access" ON products FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))) OR
        (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = products.business_id AND m.role_in_business = 'customer') AND status = 'published')
    )
);
-- Policy for inserting products: Allows admins to insert any product and business owners/sales agents to insert products within their business.
CREATE POLICY "products_insert_access" ON products FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent')))
);
-- Policy for updating products: Allows admins to update any product and business owners/sales agents to update products within their business.
CREATE POLICY "products_update_access" ON products FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent')))
);
-- Policy for deleting products: Allows only admins to delete products.
CREATE POLICY "products_delete_access" ON products FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);

-- RLS Policies for categories table

-- Policy for selecting categories: Allows admins to view all categories, business owners/sales agents to view categories within their business, and customers to view categories within their business.
CREATE POLICY "categories_select_access" ON categories FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = categories.business_id AND m.role_in_business IN ('owner', 'sales_agent'))) OR
        (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = categories.business_id AND m.role_in_business = 'customer'))
    )
);
-- Policy for inserting categories: Allows admins to insert any category and business owners to insert categories within their business.
CREATE POLICY "categories_insert_access" ON categories FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = categories.business_id AND m.role_in_business = 'owner'))
);
-- Policy for updating categories: Allows admins to update any category and business owners to update categories within their business.
CREATE POLICY "categories_update_access" ON categories FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = categories.business_id AND m.role_in_business = 'owner'))
);
-- Policy for deleting categories: Allows only admins to delete categories.
CREATE POLICY "categories_delete_access" ON categories FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);

-- RLS Policies for carts table

-- Policy for selecting carts: Allows admins to view all carts, users to view their own cart, and business owners/sales agents to view carts within their business.
CREATE POLICY "carts_select_access" ON carts FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        ((select auth.uid()) = user_id) OR
        (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent')))
    )
);
-- Policy for inserting carts: Allows admins to insert any cart, customers to insert their own cart, and business owners/sales agents to insert carts for customers within their business.
CREATE POLICY "carts_insert_access" ON carts FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (((select auth.uid()) = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = carts.business_id))) OR
    ((EXISTS (SELECT 1 FROM public.members m_agent WHERE m_agent.profile_id = (select auth.uid()) AND m_agent.role_in_business IN ('owner', 'sales_agent') AND m_agent.business_id = carts.business_id) AND EXISTS (SELECT 1 FROM public.members m_customer WHERE m_customer.profile_id = carts.user_id AND m_customer.role_in_business = 'customer' AND m_customer.business_id = carts.business_id)))
);
-- Policy for updating carts: Allows admins to update any cart, customers to update their own cart, and business owners/sales agents to update carts within their business.
CREATE POLICY "carts_update_access" ON carts FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (((select auth.uid()) = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = carts.business_id))) OR
    ((EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent'))))
);
-- Policy for deleting carts: Allows only admins to delete carts.
CREATE POLICY "carts_delete_access" ON carts FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);

-- RLS Policies for cart_items table

-- Policy for selecting cart items: Allows admins to view all cart items, users to view cart items in their own cart, and business owners/sales agents to view cart items within their business.
CREATE POLICY "cart_items_select_access" ON cart_items FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = (select auth.uid()))) OR
        (EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = (select auth.uid()) AND m.role_in_business IN ('owner', 'sales_agent')))
    )
);
-- Policy for inserting cart items: Allows admins to insert any cart item, users to insert cart items into their own cart, and business owners/sales agents to insert cart items within their business.
CREATE POLICY "cart_items_insert_access" ON cart_items FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = (select auth.uid()))) OR
    (EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = (select auth.uid()) AND m.role_in_business IN ('owner', 'sales_agent')))
);
-- Policy for updating cart items: Allows admins to update any cart item, users to update cart items in their own cart, and business owners/sales agents to update cart items within their business.
CREATE POLICY "cart_items_update_access" ON cart_items FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = (select auth.uid()))) OR
    (EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = (select auth.uid()) AND m.role_in_business IN ('owner', 'sales_agent')))
);
-- Policy for deleting cart items: Allows only admins to delete cart items.
CREATE POLICY "cart_items_delete_access" ON cart_items FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);

-- RLS Policies for orders table

-- Policy for selecting orders: Allows admins to view all orders, business owners/sales agents to view orders within their business, and users to view their own orders.
CREATE POLICY "orders_select_access" ON orders FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent'))) OR
        ((select auth.uid()) = user_id)
    )
);
-- Policy for inserting orders: Allows admins to insert any order, business owners/sales agents to insert orders for customers within their business, and customers to insert their own orders.
CREATE POLICY "orders_insert_access" ON orders FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    ((EXISTS (SELECT 1 FROM public.members m_agent WHERE m_agent.profile_id = (select auth.uid()) AND m_agent.role_in_business IN ('owner', 'sales_agent') AND m_agent.business_id = orders.business_id) AND EXISTS (SELECT 1 FROM public.members m_customer WHERE m_customer.profile_id = orders.user_id AND m_customer.role_in_business = 'customer' AND m_customer.business_id = orders.business_id))) OR
    (((select auth.uid()) = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = orders.business_id)))
);
-- Policy for updating orders: Allows admins to update any order, business owners/sales agents to update orders within their business, and customers to update their own pending orders.
CREATE POLICY "orders_update_access" ON orders FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent'))) OR
    (((select auth.uid()) = user_id AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = orders.business_id) AND (SELECT status FROM public.orders WHERE id = orders.id) = 'pending'))
);
-- Policy for deleting orders: Allows only admins to delete orders.
CREATE POLICY "orders_delete_access" ON orders FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);

-- RLS Policies for order_items table

-- Policy for selecting order items: Allows admins to view all order items, business owners/sales agents to view order items within their business, and users to view order items in their own orders.
CREATE POLICY "order_items_select_access" ON order_items FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        (EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = (select auth.uid()) AND m.role_in_business IN ('owner', 'sales_agent'))) OR
        (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = (select auth.uid())))
    )
);
-- Policy for inserting order items: Allows admins to insert any order item and business owners/sales agents to insert order items within their business.
CREATE POLICY "order_items_insert_access" ON order_items FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = (select auth.uid()) AND m.role_in_business IN ('owner', 'sales_agent')))
);
-- Policy for updating order items: Allows admins to update any order item and business owners/sales agents to update order items within their business.
CREATE POLICY "order_items_update_access" ON order_items FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = (select auth.uid()) AND m.role_in_business IN ('owner', 'sales_agent')))
);
-- Policy for deleting order items: Allows only admins to delete order items.
CREATE POLICY "order_items_delete_access" ON order_items FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);

-- RLS Policies for organisations table

-- Policy for selecting organizations: Allows admins to view all organizations, business owners/sales agents to view their own organization, and customers to view their business's organization.
CREATE POLICY "organisations_select_access" ON organisations FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = organisations.id AND m.role_in_business IN ('owner', 'sales_agent'))) OR
        (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = organisations.id AND m.role_in_business = 'customer'))
    )
);
-- Policy for inserting organizations: Allows only admins to insert organizations.
CREATE POLICY "organisations_insert_access" ON organisations FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);
-- Policy for updating organizations: Allows admins to update any organization and business owners to update their own organization.
CREATE POLICY "organisations_update_access" ON organisations FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = (select auth.uid()) AND m.business_id = organisations.id AND m.role_in_business = 'owner'))
);
-- Policy for deleting organizations: Allows only admins to delete organizations.
CREATE POLICY "organisations_delete_access" ON organisations FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);

-- RLS Policies for members table

-- Policy for selecting members: Allows admins to view all members, business owners to view members within their business, sales agents to view members within their business, and users to view their own member entry.
CREATE POLICY "members_select_access" ON members FOR SELECT USING (
    deleted_at IS NULL AND (
        ((select auth.jwt()) ->> 'user_role' = 'admin') OR
        (public.is_business_member_with_role((select auth.uid()), members.business_id, ARRAY['owner'])) OR
        (public.is_business_member_with_role((select auth.uid()), members.business_id, ARRAY['sales_agent'])) OR
        (profile_id = (select auth.uid()))
    )
);
-- Policy for inserting members: Allows admins to insert any member and business owners/sales agents to insert members within their business.
CREATE POLICY "members_insert_access" ON members FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (public.is_business_member_with_role((select auth.uid()), members.business_id, ARRAY['owner', 'sales_agent']))
);
-- Policy for updating members: Allows admins to update any member and business owners to update members within their business.
CREATE POLICY "members_update_access" ON members FOR UPDATE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin') OR
    (public.is_business_member_with_role((select auth.uid()), members.business_id, ARRAY['owner']))
);
-- Policy for deleting members: Allows only admins to delete members.
CREATE POLICY "members_delete_access" ON members FOR DELETE USING (
    ((select auth.jwt()) ->> 'user_role' = 'admin')
);