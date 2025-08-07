-- Add foreign key constraints
ALTER     TABLE categories
ADD       CONSTRAINT fk_business FOREIGN key (business_id) REFERENCES organisations (id);

ALTER     TABLE products
ADD       CONSTRAINT fk_business FOREIGN key (business_id) REFERENCES organisations (id);

ALTER     TABLE products
ADD       CONSTRAINT fk_category FOREIGN key (category_id) REFERENCES categories (id);

ALTER     TABLE carts
ADD       CONSTRAINT fk_user FOREIGN key (user_id) REFERENCES profiles (id);

ALTER     TABLE carts
ADD       CONSTRAINT fk_business FOREIGN key (business_id) REFERENCES organisations (id);

ALTER     TABLE cart_items
ADD       CONSTRAINT fk_cart FOREIGN key (cart_id) REFERENCES carts (id);

ALTER     TABLE cart_items
ADD       CONSTRAINT fk_product FOREIGN key (product_id) REFERENCES products (id);

ALTER     TABLE orders
ADD       CONSTRAINT fk_user FOREIGN key (user_id) REFERENCES profiles (id);

ALTER     TABLE orders
ADD       CONSTRAINT fk_business FOREIGN key (business_id) REFERENCES organisations (id);

ALTER     TABLE order_items
ADD       CONSTRAINT fk_order FOREIGN key (order_id) REFERENCES orders (id);

ALTER     TABLE order_items
ADD       CONSTRAINT fk_product FOREIGN key (product_id) REFERENCES products (id);
