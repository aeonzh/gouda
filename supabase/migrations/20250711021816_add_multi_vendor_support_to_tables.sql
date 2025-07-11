-- Add business_id to carts table
ALTER TABLE carts
ADD COLUMN business_id UUID REFERENCES organisations(id) ON DELETE CASCADE;

-- Add business_id to orders table
ALTER TABLE orders
ADD COLUMN business_id UUID REFERENCES organisations(id) ON DELETE CASCADE;

-- Add business_id to categories table
ALTER TABLE categories
ADD COLUMN business_id UUID REFERENCES organisations(id) ON DELETE CASCADE;

-- Update UNIQUE constraint on categories table
ALTER TABLE categories
DROP CONSTRAINT categories_name_key;

ALTER TABLE categories
ADD CONSTRAINT categories_business_id_name_key UNIQUE (business_id, name);

-- Add business_id to products table
ALTER TABLE products
ADD COLUMN business_id UUID REFERENCES organisations(id) ON DELETE CASCADE;

-- Add foreign key constraint to products table referencing categories(id, business_id)
ALTER TABLE products
ADD CONSTRAINT fk_product_category_business
FOREIGN KEY (category_id, business_id) REFERENCES categories(id, business_id);