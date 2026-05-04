# Phase 0 SQL Scripts

This directory contains all SQL scripts required to set up the database for Phase 1 of the MoneyTracker app.

---

## Overview

These scripts create the database schema, enable security policies, and seed initial data.

### Scripts

| Script | Purpose | Order |
|--------|---------|-------|
| `01_create_phase1_tables.sql` | Create categories and transactions tables | 1️⃣ |
| `02_enable_rls.sql` | Enable Row Level Security | 2️⃣ |
| `03_create_rls_policies.sql` | Create security policies | 3️⃣ |
| `04_seed_master_categories.sql` | Insert 8 master categories | 4️⃣ |

---

## Execution Instructions

### Option A: Supabase SQL Editor (Recommended for setup)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New query**
5. Copy and paste each script below
6. Click **Run** for each script in order

### Option B: Supabase CLI (Recommended for automation)

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_ID

# Run scripts in order
npx supabase db push
```

---

## Script Details

### 1. Create Tables (`01_create_phase1_tables.sql`)

**Creates:**
- `categories` table
  - UUID primary key
  - Foreign key to `auth.users`
  - Name, icon, color fields
  - Soft delete flag (`is_active`)
  - Timestamps

- `transactions` table
  - UUID primary key
  - Foreign key to `auth.users` and `categories`
  - Amount, currency, type, note fields
  - Source tracking (manual/split_bill)
  - Date and timestamps

**Also creates:**
- Indexes for performance
- Auto-update trigger for `updated_at`

---

### 2. Enable RLS (`02_enable_rls.sql`)

**Enables Row Level Security** on both tables to prevent unauthorized access.

Without RLS, anyone could access data. With RLS, only authenticated users with proper policies can access their data.

---

### 3. Create RLS Policies (`03_create_rls_policies.sql`)

**Creates strict security policies:**

#### Categories Policies (4 policies)
- **Read**: Users see their own categories OR master categories (`user_id = NULL`)
- **Insert**: Users can only insert their own categories
- **Update**: Users can only update their own categories
- **Delete**: Users can only delete their own categories

#### Transactions Policies (4 policies)
- **Read**: Users can only read their own transactions
- **Insert**: Users can only insert their own transactions
- **Update**: Users can only update their own transactions
- **Delete**: Users can only delete their own transactions

---

### 4. Seed Master Categories (`04_seed_master_categories.sql`)

**Inserts 8 pre-defined categories:**

| Name | Icon | Color | Purpose |
|------|------|-------|---------|
| Food & Drink | UtensilsCrossed | #C13333 | Food expenses |
| Transport | Car | #1A7A4A | Transportation |
| Shopping | ShoppingCart | #FF6B2B | Shopping expenses |
| Health | Heart | #B84080 | Healthcare |
| Entertainment | Tv | #3D1152 | Entertainment |
| Bills & Utilities | Receipt | #8C7A9B | Recurring bills |
| Income | Wallet | #1A7A4A | Income transactions |
| Other | MoreHorizontal | #8C7A9B | Other expenses |

All have `user_id = NULL` (master categories, visible to all users).

---

## Verification

After running all scripts, verify in Supabase Dashboard:

### 1. Check Tables
- Go to **Table Editor** (left sidebar)
- Confirm `categories` and `transactions` tables exist
- Open `categories` table → should see 8 rows (master categories)

### 2. Check RLS Policies
- Go to **Authentication** → **Policies** (left sidebar)
- Confirm 4 policies for `categories`
- Confirm 4 policies for `transactions`

### 3. Test with Test User
- Create a test user in Supabase Auth
- Try to query as that user:
  ```sql
  -- Should return 8 master categories
  SELECT * FROM categories WHERE user_id IS NULL;

  -- Should return 0 (user has no custom categories yet)
  SELECT * FROM categories WHERE user_id = auth.uid();

  -- Should return 0 (user has no transactions yet)
  SELECT * FROM transactions WHERE user_id = auth.uid();
  ```

---

## Troubleshooting

### Error: `extension "uuid-ossp" already exists`
This is safe to ignore. The script uses `IF NOT EXISTS`.

### Error: `relation "auth.users" does not exist`
Make sure Supabase Auth is enabled in your project.

### Error: Policies not working
1. Check RLS is enabled: `SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('categories', 'transactions');`
2. Check policies exist: `SELECT * FROM pg_policies WHERE tablename IN ('categories', 'transactions');`
3. Verify you're authenticated: `SELECT auth.uid();`

---

## Future Scripts (Phase 3+)

When you reach Phase 3 (OCR + Split Bill), you'll need additional scripts:

- `05_create_split_bills_tables.sql` - Split bill related tables
- `06_enable_rls_split_bills.sql` - RLS for split bill tables
- `07_create_policies_split_bills.sql` - Security policies for split bills

These will be created when you start Phase 3.

---

## Related Files

- `PRD.md` - Complete database schema documentation
- `SETUP_CHECKLIST.md` - Step-by-step setup guide
- `AGENTS.md` - Agent instructions for this project

---

*Created: March 2026*
*For: MoneyTracker App Phase 0 Setup*
