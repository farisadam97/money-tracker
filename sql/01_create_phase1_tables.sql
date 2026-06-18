-- ============================================================
-- Script 1: Create Phase 1 Tables
-- Purpose: Create categories and transactions tables for Phase 1
-- Tables:
--   - categories: Master + custom categories for transactions
--   - transactions: Income and expense records
-- ============================================================

-- Enable UUID extension for gen_random_uuid() function
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: categories
-- Purpose: Store category definitions for transactions
-- Rules:
--   - user_id = NULL → master/global category (read-only, visible to all)
--   - user_id = X → custom category (only visible to user X)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Category metadata
  name TEXT NOT NULL CHECK (length(name) > 0),
  icon TEXT NOT NULL CHECK (length(icon) > 0),  -- Lucide icon name
  color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),  -- Hex color code

  -- Soft delete flag
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for categories
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============================================================
-- Table: transactions
-- Purpose: Store income and expense records
-- Rules:
--   - All operations scoped to user_id (no public data)
--   - category_id references categories table
--   - type can be 'income' or 'expense'
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transaction details
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (length(currency) = 3),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  note TEXT,

  -- Transaction date (when the transaction occurred, not created)
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Source tracking
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'split_bill', 'email')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for transactions (optimized for common queries)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_source ON transactions(source);

-- ============================================================
-- Function: update_updated_at_column()
-- Purpose: Automatically update updated_at timestamp on row update
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Trigger: transactions_updated_at
-- Purpose: Auto-update updated_at on transactions table
-- ============================================================
CREATE TRIGGER transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Completed: Phase 1 Tables Created
-- Next: Run 02_enable_rls.sql
-- ============================================================
