# Phase 0: Setup Checklist

Use this checklist to track your progress through the setup phase. Once all items are complete, you'll be ready for Phase 1 implementation.

---

## Step 1: Get Supabase Credentials

### 1a. Retrieve Project URL

- [x] Go to Supabase Dashboard → Settings → API
- [x] Copy **Project URL** (format: `https://xyz.supabase.co`)
- [x] Save for Step 4

### 1b. Retrieve Anon Public Key

- [x] On same API Settings page, find **Project API keys** section
- [x] Copy **anon public** key (long string starting with `eyJ...`)
- [x] Save for Step 4

---

## Step 2: Create Database Tables in Supabase

### 2a. Create Phase 1 Tables

- [x] Open `sql/01_create_phase1_tables.sql`
- [x] Copy entire script content
- [x] Go to Supabase → SQL Editor → New query
- [x] Paste script and click "Run"
- [x] Verify: Should see "✅ Phase 1 Tables Created" message

### 2b. Enable Row Level Security

- [x] Open `sql/02_enable_rls.sql`
- [x] Copy script
- [x] Go to Supabase → SQL Editor → New query
- [x] Paste script and click "Run"
- [x] Verify: Should see "✅ RLS successfully enabled on all tables"

### 2c. Create RLS Policies

- [x] Open `sql/03_create_rls_policies.sql`
- [x] Copy script
- [x] Go to Supabase → SQL Editor → New query
- [x] Paste script and click "Run"
- [x] Verify: Should see "✅ All RLS policies created successfully"
- [x] Check: 4 policies for categories, 4 for transactions

### 2d. Seed Master Categories

- [x] Open `sql/04_seed_master_categories.sql`
- [x] Copy script
- [x] Go to Supabase → SQL Editor → New query
- [x] Paste script and click "Run"
- [x] Verify: Should see "✅ Master categories seeded successfully"
- [x] Check: Query returns 8 rows: `SELECT COUNT(*) FROM categories WHERE user_id IS NULL;`

### 2e. Verify in Dashboard (Optional)

- [x] Go to Supabase → Table Editor
- [x] Confirm `categories` and `transactions` tables exist
- [x] Open `categories` table → should show 8 master categories
- [x] Go to Authentication → Policies
- [x] Confirm 8 policies total (4 per table)

**Phase 1 Tables Only:**
This setup creates only the tables needed for Phase 1:

- `categories` (master + custom categories)
- `transactions` (income/expense records)

Phase 3 tables (split_bills, split_bill_items, split_bill_assignments) will be added when you start Phase 3.

**Detailed Documentation:**
See `sql/README.md` for complete documentation of all SQL scripts.

---

## Step 3: Set Up Google OAuth

### Part A: Create Google Cloud Project

- [x] Go to https://console.cloud.google.com
- [x] Create new project named `money-tracker-app`
- [x] Select the project from dropdown
- [x] Go to APIs & Services → Library
- [x] Enable "Google+ API" (or "Google Identity" API)

### Part B: Create OAuth 2.0 Credentials

#### B1. Configure OAuth Consent Screen

- [x] Go to APIs & Services → OAuth consent screen
- [x] Choose "External" → Create
- [x] Fill in:
  - App name: `MoneyTracker`
  - User support email: your email
  - Developer contact: your email
- [x] Click "SAVE AND CONTINUE" through all screens
- [x] Click "BACK TO DASHBOARD"

#### B2. Create OAuth 2.0 Client ID

- [x] Go to APIs & Services → Credentials
- [x] Click "CREATE CREDENTIALS" → "OAuth client ID"
- [x] Application type: **Web application**
- [x] Name: `MoneyTracker Supabase Auth`
- [x] Add authorized redirect URI:
  - `https://[SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback`
  - _Note: Replace [SUPABASE-PROJECT-ID] with your actual project ID_
- [x] Add authorized redirect URI for dev: `exp://127.0.0.1:19000/--/`
- [x] Click "CREATE"
- [x] Copy the **Client ID** (starts with numbers)
- [x] Download and save the JSON file

### Part C: Configure Google OAuth in Supabase

#### C1. Get Supabase Project ID

- [x] From Supabase URL `https://[PROJECT-ID].supabase.co`
- [x] Extract and save the `[PROJECT-ID]` part

#### C2. Enable Google Provider in Supabase

- [x] Go to Supabase → Authentication → Providers
- [x] Find "Google" and enable it
- [x] Paste Google **Client ID**
- [x] Paste Google **Client Secret** (from downloaded JSON)
- [x] Click "Save"

#### C3. Configure Site URL in Supabase

- [x] Go to Authentication → URL Configuration
- [x] Site URL: `exp://127.0.0.1:19000/--/`
- [x] Add redirect URL: `exp://127.0.0.1:19000/--/`
- [x] Add redirect URL: `https://[SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback`
- [x] Click "Save"

---

## Step 4: Create Environment File

### 4a. Create `.env` File

- [x] Create file named `.env` in project root
- [x] Add Supabase URL and anon key

### 4b. Verify Content

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

- [x] Replace `https://your-project-id.supabase.co` with actual URL
- [x] Replace `your-anon-public-key-here` with actual key
- [x] **Note:** File created with placeholders - replace with actual values from Supabase Dashboard → Settings → API

### 4c. Verify .gitignore

- [x] Check that `.gitignore` includes `.env`
- [x] Ensure secrets won't be committed

---

## Optional: Install Supabase CLI (Recommended)

### CLI Installation

- [x] ~~Install Supabase CLI~~ — Skipped (not needed)
- [x] Generate types — Hand-written in `src/types/database.ts`

---

## Optional: Set Up Dev Auth Bypass (Recommended for Development)

These options let you test the app **without configuring Google OAuth**. All are dev-only (`__DEV__` flag) and disappear in production builds (`eas build`).

### Option A: Email/Password Test User (Recommended)

- [ ] Go to Supabase Dashboard → Authentication → Users
- [ ] Click "Add user" → "Create new user"
- [ ] Email: `test@moneytracker.dev` (or any email you want)
- [ ] Password: `testpass123` (or any password)
- [ ] Check "Auto Confirm User" (so you don't need email verification)
- [ ] Click "Create user"
- [ ] In the app login screen, tap **"Dev: Sign in with email"**
- [ ] Enter the email and password you set
- [ ] You're in — real UUID, real session, real RLS access, real CRUD

### Option B: Anonymous Auth

- [ ] Go to Supabase Dashboard → Authentication → Providers
- [ ] Find "Anonymous" → toggle **ON** → Save
- [ ] In the app login screen, tap **"Skip (Dev Only)"**
- [ ] Creates a real anonymous user with real UUID — no credentials needed
- [ ] RLS works normally; data persists under this user

### Option C: Skip (No Data)

- [ ] No setup needed
- [ ] Tap "Skip (Dev Only)" — if anonymous auth is NOT enabled, falls back to a fake user
- [ ] UI-only testing — Supabase reads/writes will fail (RLS blocks unauthenticated)
- [ ] Good for testing layouts and navigation, not CRUD operations

### Notes

- All three options are gated by `__DEV__` and **automatically disappear** in production builds
- Option A (email/password) is the recommended dev workflow — full CRUD testing with real data
- After Google OAuth is properly configured (Step 3), these dev options remain available but are not needed

---

## Final Verification

Before marking as complete, verify each:

### Database Verification

Run these queries in Supabase SQL Editor:

```sql
-- Check master categories (should return 8)
SELECT COUNT(*) FROM categories WHERE user_id IS NULL;

-- Check policies (should return 8 total)
SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('categories', 'transactions');

-- Check RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('categories', 'transactions');
```

- [x] Master categories seeded (8 rows with user_id IS NULL)
- [x] RLS policies created (8 total: 4 for categories, 4 for transactions)
- [x] RLS enabled on both tables
- [x] Tables visible in Table Editor

**Database verification confirmed:** 8 master categories seeded, 8 RLS policies created

### OAuth & Environment

- [x] Google OAuth client created in Google Cloud Console
- [x] Google OAuth enabled and configured in Supabase
- [x] `.env` file exists with correct values
- [x] `.env` is in `.gitignore`

---

## Ready for Phase 1

When all items above are checked:

1. **Reply**: "Phase 0 complete!"
2. **Include**:
   - Did you install Supabase CLI? (Yes/No)
   - Any issues encountered?
3. **I will then**: Begin Phase 1 implementation

---

## Quick Reference

| What You Need        | Location                                     |
| -------------------- | -------------------------------------------- |
| Supabase Project URL | Supabase → Settings → API                    |
| Supabase Anon Key    | Supabase → Settings → API                    |
| Supabase Project ID  | From URL: `https://[PROJECT-ID].supabase.co` |
| Google Client ID     | Google Cloud → Credentials                   |
| Google Client Secret | Google Cloud → Download JSON file            |
| SQL Scripts          | `sql/` directory in project root             |
| SQL Documentation    | `sql/README.md`                              |

---

_Created: March 2026_
_Updated: March 2026 - Phase 0 complete! All steps finished (Supabase CLI skipped, types hand-written)_
_For: MoneyTracker App Phase 0 Setup_
