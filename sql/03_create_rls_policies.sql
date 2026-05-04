-- ============================================================
-- Script 3: Create RLS Policies
-- Purpose: Define strict security policies for data access
-- All policies enforce user isolation and data integrity
-- ============================================================

-- ============================================================
-- SECTION: Categories Table Policies
-- ============================================================

-- ============================================================
-- Policy: categories_read_policy
-- Purpose: Users can view their own categories OR master categories
-- Rules:
--   - auth.uid() = user_id → User's custom categories
--   - user_id IS NULL → Master/global categories (visible to all)
-- This ensures users see both their custom categories and system defaults
-- ============================================================
CREATE POLICY "categories_read_policy"
ON categories FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR user_id IS NULL
);

-- ============================================================
-- Policy: categories_insert_policy
-- Purpose: Users can only insert their own custom categories
-- Rules:
--   - user_id must equal auth.uid()
--   - Cannot insert master categories (user_id = NULL)
-- This prevents users from creating global categories
-- ============================================================
CREATE POLICY "categories_insert_policy"
ON categories FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- ============================================================
-- Policy: categories_update_policy
-- Purpose: Users can only update their own custom categories
-- Rules:
--   - Current user_id must equal auth.uid()
--   - New user_id must also equal auth.uid()
-- This prevents users from modifying master categories
-- ============================================================
CREATE POLICY "categories_update_policy"
ON categories FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- ============================================================
-- Policy: categories_delete_policy
-- Purpose: Users can only delete their own custom categories
-- Rules:
--   - user_id must equal auth.uid()
-- Note: This is a hard delete. For soft delete, use UPDATE is_active = false
-- ============================================================
CREATE POLICY "categories_delete_policy"
ON categories FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);


-- ============================================================
-- SECTION: Transactions Table Policies
-- ============================================================

-- ============================================================
-- Policy: transactions_read_policy
-- Purpose: Users can only view their own transactions
-- Rules:
--   - user_id must equal auth.uid()
-- This ensures complete data isolation between users
-- ============================================================
CREATE POLICY "transactions_read_policy"
ON transactions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- ============================================================
-- Policy: transactions_insert_policy
-- Purpose: Users can only insert their own transactions
-- Rules:
--   - user_id must equal auth.uid()
-- This prevents users from creating transactions for others
-- ============================================================
CREATE POLICY "transactions_insert_policy"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- ============================================================
-- Policy: transactions_update_policy
-- Purpose: Users can only update their own transactions
-- Rules:
--   - Current user_id must equal auth.uid()
--   - New user_id must also equal auth.uid()
-- This prevents users from modifying others' transactions
-- ============================================================
CREATE POLICY "transactions_update_policy"
ON transactions FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- ============================================================
-- Policy: transactions_delete_policy
-- Purpose: Users can only delete their own transactions
-- Rules:
--   - user_id must equal auth.uid()
-- This prevents users from deleting others' transactions
-- ============================================================
CREATE POLICY "transactions_delete_policy"
ON transactions FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);

-- ============================================================
-- SECTION: Policy Verification
-- ============================================================

-- ============================================================
-- Verify: All policies created successfully
-- Purpose: Confirm each table has the required policies
-- ============================================================
DO $$
DECLARE
  categories_policies INT;
  transactions_policies INT;
BEGIN
  SELECT COUNT(*) INTO categories_policies
  FROM pg_policies
  WHERE tablename = 'categories';

  SELECT COUNT(*) INTO transactions_policies
  FROM pg_policies
  WHERE tablename = 'transactions';

  RAISE NOTICE 'Categories policies created: % (expected: 4)', categories_policies;
  RAISE NOTICE 'Transactions policies created: % (expected: 4)', transactions_policies;

  IF categories_policies = 4 AND transactions_policies = 4 THEN
    RAISE NOTICE '✅ All RLS policies created successfully';
  ELSE
    RAISE EXCEPTION '❌ Missing policies. Expected 4 each, found % and %',
      categories_policies, transactions_policies;
  END IF;
END $$;

-- ============================================================
-- Completed: RLS Policies Created
-- Summary:
--   - categories: 4 policies (read, insert, update, delete)
--   - transactions: 4 policies (read, insert, update, delete)
-- Next: Run 04_seed_master_categories.sql
-- ============================================================
