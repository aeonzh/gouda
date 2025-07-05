-- Create the profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'buyer', -- 'buyer', 'admin', 'seller_agent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add stock_quantity to products table
ALTER TABLE products
ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0;

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view their own profile." ON profiles FOR SELECT USING (auth.uid() = id);
-- Users can create their own profile upon registration
CREATE POLICY "Users can create their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles." ON profiles FOR SELECT USING (auth.role() = 'admin');
-- Admins can update any profile
CREATE POLICY "Admins can update any profile." ON profiles FOR UPDATE USING (auth.role() = 'admin');
-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles." ON profiles FOR DELETE USING (auth.role() = 'admin');

-- RLS Policies for addresses
-- Users can view their own addresses
CREATE POLICY "Users can view their own addresses." ON addresses FOR SELECT USING (auth.uid() = user_id);
-- Users can add their own addresses
CREATE POLICY "Users can add their own addresses." ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own addresses
CREATE POLICY "Users can update their own addresses." ON addresses FOR UPDATE USING (auth.uid() = user_id);
-- Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses." ON addresses FOR DELETE USING (auth.uid() = user_id);
-- Admins can view all addresses
CREATE POLICY "Admins can view all addresses." ON addresses FOR SELECT USING (auth.role() = 'admin');