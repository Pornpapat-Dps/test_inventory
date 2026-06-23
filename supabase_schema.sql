-- Run this in Supabase Dashboard → SQL Editor
-- ถ้ารันครั้งแรกแล้วเกิด error "already exists" ให้รัน block นี้แทน

CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name           TEXT             NOT NULL,
  sku            TEXT             UNIQUE NOT NULL,
  cost_price     NUMERIC(12, 2)   NOT NULL,
  stock_quantity INTEGER          NOT NULL DEFAULT 0,
  category_id    INTEGER          REFERENCES categories(id),
  created_at     TIMESTAMPTZ      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER      NOT NULL REFERENCES products(id),
  type        TEXT         NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity    INTEGER      NOT NULL CHECK (quantity > 0),
  note        TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Seed categories (ข้าม row ที่มีชื่อซ้ำ)
INSERT INTO categories (name)
VALUES ('IT'), ('Office Supply'), ('Furniture')
ON CONFLICT DO NOTHING;
