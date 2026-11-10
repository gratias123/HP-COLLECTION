-- ====================================================================
-- HP COLLECTION — Schéma Relationnel PostgreSQL Production
-- Bénin (Cotonou / Calavi) — Streetwear & Sneakers Haute Fidélité
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Catégories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(64),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Produits
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL CHECK (price >= 0),
    sale_price INT CHECK (sale_price IS NULL OR sale_price >= 0),
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE RESTRICT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    total_stock INT NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Variantes de Produits (Taille, Couleur, Stock Atomique)
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(64) UNIQUE NOT NULL,
    size VARCHAR(32) NOT NULL,
    color VARCHAR(64) NOT NULL,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_variants_prod ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_size ON product_variants(size);

-- 4. Clients
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(128) NOT NULL,
    district VARCHAR(128),
    address TEXT,
    total_orders INT DEFAULT 0,
    total_spent INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 5. Zones de Livraison Bénin
CREATE TABLE IF NOT EXISTS delivery_zones (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    fee INT NOT NULL CHECK (fee >= 0),
    estimated_hours VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Codes Promo
CREATE TABLE IF NOT EXISTS promo_codes (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    discount_type VARCHAR(32) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INT NOT NULL CHECK (discount_value > 0),
    min_order_amount INT DEFAULT 0,
    max_uses INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 7. Commandes
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE RESTRICT,
    customer_snapshot JSONB NOT NULL,
    subtotal INT NOT NULL CHECK (subtotal >= 0),
    shipping_fee INT NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    discount_amount INT NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total INT NOT NULL CHECK (total >= 0),
    promo_code VARCHAR(64),
    payment_method VARCHAR(64) NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'fedapay_mobile_money')),
    payment_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    fulfillment_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    fedapay_transaction_id VARCHAR(128),
    notes TEXT,
    status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment ON orders(fulfillment_status);

-- 8. Articles de Commande
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    variant_id VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    size VARCHAR(32) NOT NULL,
    color VARCHAR(64) NOT NULL,
    price INT NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    image TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 9. Mouvements de Stock (Traçabilité & Audit)
CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id VARCHAR(64) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    change INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason VARCHAR(64) NOT NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Utilisateurs Administrateurs (Sécurité scrypt)
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(128) NOT NULL,
    algorithm VARCHAR(32) NOT NULL DEFAULT 'scrypt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Sessions Administrateur
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(64) PRIMARY KEY,
    token VARCHAR(128) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'admin',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- 12. Paramètres de la Boutique
CREATE TABLE IF NOT EXISTS store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(32) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(64) NOT NULL,
    country VARCHAR(64) NOT NULL,
    fedapay_public_key VARCHAR(255),
    fedapay_sandbox BOOLEAN DEFAULT TRUE,
    notification_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
