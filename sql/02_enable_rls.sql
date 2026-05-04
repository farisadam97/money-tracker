-- ============================================================
-- Script 2: Enable Row Level Security (RLS)
-- Purpose: Enable RLS on Phase 1 tables
-- RLS ensures all data access is controlled by security policies
-- ============================================================

-- ============================================================
-- Enable RLS on categories table
-- Purpose: Control read/write access to categories
-- Without RLS: Anyone could access categories
-- With RLS: Only authenticated users with proper policies
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Enable RLS on transactions table
-- Purpose: Control read/write access to transactions
-- Without RLS: Anyone could access transactions
-- With RLS: Only authenticated users can access their own data
-- ============================================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Verify RLS is enabled
-- Purpose: Confirm RLS is active on both tables
-- ============================================================
DO $$
DECLARE
  categories_rls BOOLEAN;
  transactions_rls BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO categories_rls
  FROM pg_class
  WHERE relname = 'categories';

  SELECT relrowsecurity INTO transactions_rls
  FROM pg_class
  WHERE relname = 'transactions';

  RAISE NOTICE 'Categories RLS enabled: %', categories_rls;
  RAISE NOTICE 'Transactions RLS enabled: %', transactions_rls;

  IF categories_rls AND transactions_rls THEN
    RAISE NOTICE '✅ RLS successfully enabled on all tables';
  ELSE
    RAISE EXCEPTION '❌ RLS not enabled on all tables. Check output above.';
  END IF;
END $$;

-- ============================================================
-- Completed: RLS Enabled
-- Next: Run 03_create_rls_policies.sql to define access rules
-- ============================================================
