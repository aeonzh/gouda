-- Enable RLS on tables
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent conflicts during updates
DROP POLICY IF EXISTS "carts_all_access" ON carts;
DROP POLICY IF EXISTS "orders_all_access" ON orders;
DROP POLICY IF EXISTS "categories_all_access" ON categories;
DROP POLICY IF EXISTS "products_all_access" ON products;

-- RLS for carts table
CREATE POLICY "carts_all_access" ON carts
FOR ALL
USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT business_id FROM profiles WHERE id = auth.uid()) = business_id
)
WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT business_id FROM profiles WHERE id = auth.uid()) = business_id
);

-- RLS for orders table
CREATE POLICY "orders_all_access" ON orders
FOR ALL
USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT business_id FROM profiles WHERE id = auth.uid()) = business_id
)
WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT business_id FROM profiles WHERE id = auth.uid()) = business_id
);

-- RLS for categories table
CREATE POLICY "categories_all_access" ON categories
FOR ALL
USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT business_id FROM profiles WHERE id = auth.uid()) = business_id
)
WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT business_id FROM profiles WHERE id = auth.uid()) = business_id
);

-- RLS for products table
CREATE POLICY "products_all_access" ON products
FOR ALL
USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT business_id FROM profiles WHERE id = auth.uid()) = business_id
)
WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT business_id FROM profiles WHERE id = auth.uid()) = business_id
);