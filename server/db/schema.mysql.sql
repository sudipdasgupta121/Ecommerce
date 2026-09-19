CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image MEDIUMTEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  placed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  items JSON NOT NULL
);

-- ADD COLUMN IF NOT EXISTS (rather than adding it to the CREATE TABLE above) so this
-- still lands on databases where `orders` already exists.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);

-- Better Auth's core tables (email/password + session), matching the schema its own
-- `generate` CLI produces for this project's Kysely/mysql2 adapter.
CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  emailVerified BOOLEAN NOT NULL,
  image TEXT,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS session (
  id VARCHAR(36) PRIMARY KEY,
  expiresAt TIMESTAMP(3) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt TIMESTAMP(3) NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId VARCHAR(36) NOT NULL REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id VARCHAR(36) PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId VARCHAR(36) NOT NULL REFERENCES user (id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TIMESTAMP(3),
  refreshTokenExpiresAt TIMESTAMP(3),
  scope TEXT,
  password TEXT,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id VARCHAR(36) PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP(3) NOT NULL,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
