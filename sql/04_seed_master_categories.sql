-- ============================================================
-- Script 4: Seed Master Categories
-- Purpose: Insert 8 pre-defined categories visible to all users
-- Rules:
--   - user_id = NULL → These are master/global categories
--   - is_active = true → All categories active by default
--   - Read-only for users (controlled by RLS policies)
-- ============================================================

-- ============================================================
-- Insert 8 Master Categories
-- Values sourced from PRD.md Section 13.1
-- Colors and icons follow the Plum + Tangerine design system
-- ============================================================
INSERT INTO categories (name, icon, color, is_active, user_id) VALUES
  -- Food & Drink - Red accent
  ('Food & Drink', 'UtensilsCrossed', '#C13333', true, NULL),

  -- Transport - Green accent
  ('Transport', 'Car', '#1A7A4A', true, NULL),

  -- Shopping - Orange accent (Tangerine)
  ('Shopping', 'ShoppingCart', '#FF6B2B', true, NULL),

  -- Health - Pink/Purple accent
  ('Health', 'Heart', '#B84080', true, NULL),

  -- Entertainment - Plum primary
  ('Entertainment', 'Tv', '#3D1152', true, NULL),

  -- Bills & Utilities - Mauve secondary
  ('Bills & Utilities', 'Receipt', '#8C7A9B', true, NULL),

  -- Income - Green accent (for income transactions)
  ('Income', 'Wallet', '#1A7A4A', true, NULL),

  -- Other - Mauve secondary
  ('Other', 'MoreHorizontal', '#8C7A9B', true, NULL);

-- ============================================================
-- Verify: Master categories inserted
-- Purpose: Confirm 8 categories exist with user_id = NULL
-- ============================================================
DO $$
DECLARE
  master_count INT;
  expected_count INT := 8;
BEGIN
  SELECT COUNT(*) INTO master_count
  FROM categories
  WHERE user_id IS NULL AND is_active = true;

  RAISE NOTICE 'Master categories inserted: % (expected: %)',
    master_count, expected_count;

  IF master_count = expected_count THEN
    RAISE NOTICE '✅ Master categories seeded successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'Categories seeded:';
    RAISE NOTICE '  1. Food & Drink (UtensilsCrossed, #C13333)';
    RAISE NOTICE '  2. Transport (Car, #1A7A4A)';
    RAISE NOTICE '  3. Shopping (ShoppingCart, #FF6B2B)';
    RAISE NOTICE '  4. Health (Heart, #B84080)';
    RAISE NOTICE '  5. Entertainment (Tv, #3D1152)';
    RAISE NOTICE '  6. Bills & Utilities (Receipt, #8C7A9B)';
    RAISE NOTICE '  7. Income (Wallet, #1A7A4A)';
    RAISE NOTICE '  8. Other (MoreHorizontal, #8C7A9B)';
  ELSE
    RAISE EXCEPTION '❌ Master categories seeding failed. Expected %, found %',
      expected_count, master_count;
  END IF;
END $$;

-- ============================================================
-- Display: All master categories
-- Purpose: Show what was inserted for manual verification
-- ============================================================
SELECT
  name AS "Category",
  icon AS "Lucide Icon",
  color AS "Color",
  is_active AS "Active",
  created_at AS "Created"
FROM categories
WHERE user_id IS NULL
ORDER BY created_at ASC;

-- ============================================================
-- Completed: Master Categories Seeded
-- Summary:
--   - 8 master categories inserted
--   - user_id = NULL (visible to all users)
--   - is_active = true (all active)
-- ============================================================

-- ============================================================
-- Phase 0 Setup Complete!
-- Next Steps:
--   1. Verify in Supabase Dashboard → Table Editor
--   2. Check Authentication → Policies section
--   3. Test with a test user account
--   4. Proceed to Phase 1: React Native Mobile App
-- ============================================================
