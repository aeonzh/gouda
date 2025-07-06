-- Users table for authentication and common user data
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'customer', 'agent', 'admin', or multiple roles
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone VARCHAR(20),
    profile_image TEXT
);

-- Stores table
CREATE TABLE Stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    address VARCHAR(255),
    hours VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- StoreAgents table - Many-to-many relationship between Users and Stores
CREATE TABLE StoreAgents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    store_id INT REFERENCES Stores(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'owner', 'manager', 'staff', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id) -- Each user can have only one role per store
);

-- Customer profiles
CREATE TABLE CustomerProfiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    shipping_address TEXT,
    preferred_payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- One customer profile per user
);

-- ProductCategories table with nested structure
CREATE TABLE ProductCategories (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES Stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    parent_id INT REFERENCES ProductCategories(id) ON DELETE CASCADE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Add constraint to prevent cycles
    CONSTRAINT prevent_circular_reference CHECK (parent_id != id)
);

-- StoreProducts table
CREATE TABLE StoreProducts (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES Stores(id) ON DELETE CASCADE,
    category_id INT REFERENCES ProductCategories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    description TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    Customer_id INT REFERENCES CustomerProfiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'cancelled'
    shipping_address TEXT,
    payment_method VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL
);

-- OrderItems table
CREATE TABLE OrderItems (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES StoreProducts(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL -- Store the price at time of purchase
);