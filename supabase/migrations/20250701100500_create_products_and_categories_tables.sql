-- Create the categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for products and categories tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
-- Allow public read access to all products
CREATE POLICY "Public products are viewable by everyone." ON products FOR SELECT USING (true);
-- Allow authenticated users with 'admin' role to insert products
CREATE POLICY "Admins can insert products." ON products FOR INSERT WITH CHECK (auth.role() = 'admin');
-- Allow authenticated users with 'admin' role to update products
CREATE POLICY "Admins can update products." ON products FOR UPDATE USING (auth.role() = 'admin');
-- Allow authenticated users with 'admin' role to delete products
CREATE POLICY "Admins can delete products." ON products FOR DELETE USING (auth.role() = 'admin');

-- RLS Policies for categories
-- Allow public read access to all categories
CREATE POLICY "Public categories are viewable by everyone." ON categories FOR SELECT USING (true);
-- Allow authenticated users with 'admin' role to insert categories
CREATE POLICY "Admins can insert categories." ON categories FOR INSERT WITH CHECK (auth.role() = 'admin');
-- Allow authenticated users with 'admin' role to update categories
CREATE POLICY "Admins can update categories." ON categories FOR UPDATE USING (auth.role() = 'admin');
-- Allow authenticated users with 'admin' role to delete categories
CREATE POLICY "Admins can delete categories." ON categories FOR DELETE USING (auth.role() = 'admin');