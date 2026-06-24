# Phase 1: Mobile App + Manual Tracker

Use this checklist to track progress through Phase 1 implementation. Complete each step in order — do not skip ahead.

**Reference:** MoneyTracker PRD v1.5 (May 2026) — includes onboarding flow (Section 5.2), `source` field on transactions (Section 3), RLS rules (Section 17), and privacy compliance (Section 16).

---

## Step 1: Install Dependencies

### 1a. Core Dependencies

- [x] Install Supabase: `@supabase/supabase-js`
- [x] Install Expo auth deps: `expo-web-browser`, `expo-auth-session`, `expo-crypto`
- [x] Install NativeWind: `nativewind`
- [x] Install state management: `@tanstack/react-query`, `zustand`
- [x] Install icons: `lucide-react-native`
- [x] Install bottom sheet: `@gorhom/bottom-sheet`
- [x] Install date picker: `react-native-date-picker`
- [x] Install forms: `react-hook-form`, `zod`, `@hookform/resolvers`
- [x] Install async storage: `@react-native-async-storage/async-storage`

### 1b. Dev Dependencies

- [x] Install Tailwind CSS dev deps: `tailwindcss@3`

### 1c. Verify Installation

- [x] Build succeeds with no errors
- [x] All packages listed in `package.json`

---

## Step 2: NativeWind + Design System

### 2a. Configure NativeWind v4

- [x] Create `nativewind-env.d.ts` type declaration
- [x] Create/update `tailwind.config.js` with NativeWind v4 preset + custom PRD colors
- [x] Create/update `metro.config.js` — add NativeWind v4 metro plugin (not babel)
- [x] Update `app/(tabs)/_layout.tsx` to use NativeWind classes (test)
- [x] Verify NativeWind v4 renders correctly on Android (no babel plugin needed)

### 2b. Create Design Tokens

- [x] Create `src/constants/colors.ts` — all PRD colors:
  - Plum primary `#3D1152`
  - Tangerine accent `#FF6B2B`
  - Parchment background `#FAF7F5`
  - White surface `#FFFFFF`
  - Plum tint `#EDE0F5`
  - Orange tint `#FFF0E8`
  - Income green `#1A7A4A` + tint `#E6F5EE`
  - Expense red `#C13333` + tint `#FCEAEA`
  - Text primary `#1C0F2E`
  - Text secondary (mauve) `#8C7A9B`
  - Border `#EAE3F0`
- [x] Create `src/constants/categories.ts` — category-to-bg-color mapping
  - NOTE: DB `color` column stores icon color only. Background colors must be mapped in code:
    - Food & Drink: icon `#C13333`, bg `#FCEAEA`
    - Transport: icon `#1A7A4A`, bg `#E6F5EE`
    - Shopping: icon `#FF6B2B`, bg `#FFF0E8`
    - Health: icon `#B84080`, bg `#F5E6F0`
    - Entertainment: icon `#3D1152`, bg `#EDE0F5`
    - Bills & Utilities: icon `#8C7A9B`, bg `#F0EDF5`
    - Income: icon `#1A7A4A`, bg `#E6F5EE`
    - Other: icon `#8C7A9B`, bg `#F0EDF5`
  - Custom categories: derive bg color as lighter tint of icon color
- [x] Create `src/constants/typography.ts` — font sizes and weights per PRD Section 12.2
- [x] Verify NativeWind renders correctly on Android

### 2c. Clean Up Boilerplate

- [x] Delete unused components: `hello-wave.tsx`, `parallax-scroll-view.tsx`, `external-link.tsx`, `themed-text.tsx`, `themed-view.tsx`, `haptic-tab.tsx`
- [x] Delete unused hooks: `use-theme-color.ts`, `use-color-scheme.ts`, `use-color-scheme.web.ts`
- [x] Delete `constants/theme.ts` (replaced by NativeWind + colors.ts)
- [x] Delete `assets/images/` template images
- [x] Delete `app/modal.tsx`
- [x] Delete `app/(tabs)/explore.tsx`

---

## Step 3: Supabase Client + Auth

### 3a. Supabase Client

- [x] Create `src/lib/supabase.ts` — initialize client with env vars
- [x] Verify client connects (test query in app or console)

### 3b. Auth Context

- [x] Create `src/contexts/auth-context.tsx` — session state + user object
- [x] Create `src/hooks/use-auth.ts` — convenience hook wrapping context
- [x] Handle session persistence (auto-login on app reopen)
- [x] ~~Track guest mode state~~ — Removed in PRD v1.3 (guest mode deferred to future)

### 3c. Google OAuth Flow

- [x] Configure `expo-auth-session` with Google provider
- [ ] Configure redirect URIs for development (`exp://127.0.0.1:19000/--/`) — TD-3, needs real Google Cloud Console setup
- [x] Implement sign-in flow using `expo-web-browser` + `expo-auth-session` + `supabase.auth.signInWithIdToken`
- [x] Implement sign-out flow
- [x] Add dev-only email/password auth bypass (test user in Supabase)
- [ ] Test: Google Sign In → session created → sign out → session cleared — Pending real Google OAuth config

### 3d. ~~Guest Mode~~ — Removed in PRD v1.3

- [x] ~~Implement "Continue as Guest"~~ — Deferred to future phase
- [x] Guest mode code exists in `src/stores/guest-data-store.ts` and `src/lib/migrate-guest.ts` but not required for Phase 1

---

## Step 4: State Management + Query Setup

### 4a. TanStack Query Provider

- [x] Create `src/providers/query-provider.tsx` — QueryClient wrapper
- [x] Wrap app root with provider in `app/_layout.tsx`

### 4b. Zustand Stores

- [x] Create `src/stores/user-preferences-store.ts` — default currency, onboarding flag
- [x] Create `src/stores/filter-store.ts` — transaction filter state (type, categories, date range)
- [x] ~~Create `src/stores/guest-data-store.ts`~~ — Removed (TD-1: guest mode code deleted)
- [x] Persist user preferences to AsyncStorage
- [x] ~~Persist guest data to AsyncStorage~~ — Removed (TD-1)

### 4c. Data Hooks

- [x] Create `src/hooks/use-categories.ts` — fetch, create, update, delete categories
- [x] Create `src/hooks/use-transactions.ts` — fetch, create, update, delete transactions
- [x] Create `src/hooks/use-summary.ts` — monthly income/expense/balance aggregation
- [x] Test: fetch master categories (should return 8 rows)

### 4d. Offline-First Layer (AR-7)

- [x] Install `@tanstack/query-async-storage-persister` + `@react-native-community/netinfo`
- [x] Create `src/stores/pending-writes-store.ts` — AsyncStorage-backed write queue
- [x] Create `src/providers/sync-provider.tsx` — drains queue on reconnect
- [x] All mutation hooks enqueue on failure

---

## Step 5: Auth Screens

### 5a. Splash Screen

- [x] Create `app/splash.tsx` — full screen, centered, bg `#FAF7F5`
- [x] App logo centered, large (80–100px)
- [x] App name "MoneyTracker" 24px weight 500 `#3D1152`
- [x] Tagline "Track smart, spend wise" 14px `#8C7A9B`
- [x] Small circular spinner `#3D1152` below tagline
- [x] If session exists → redirect to main app
- [x] If no session → redirect to login

### 5b. Login Screen

- [x] Create `app/login.tsx` — full screen, bg `#FAF7F5`
- [x] Top 45% branding: app logo, "MoneyTracker" 28px weight 500 `#3D1152`, tagline 14px `#8C7A9B`
- [x] Center auth area: "Welcome back" 20px weight 500 `#1C0F2E`, subtitle "Sign in to continue tracking your finances" 14px `#8C7A9B`
- [x] Google Sign In button: white bg, border 0.5px `#EAE3F0`, border-radius 10px, full width max 320px, padding 14px
  - Left: Google logo SVG 20px, center: "Continue with Google" 14px weight 500 `#1C0F2E`
  - Loading state: spinner replaces text during OAuth
- [x] ~~"Continue as Guest" button~~ — Removed in PRD v1.3 (guest mode deferred)
- [x] Footer: "By continuing you agree to our Terms of Service and Privacy Policy" 11px `#8C7A9B`
  - "Terms of Service" and "Privacy Policy" underlined, color `#3D1152`
- [x] Error state if OAuth fails

### 5c. Root Layout Update

- [x] Update `app/_layout.tsx` — auth gate: redirect to login if no session
- [x] Remove dark mode support (light mode only per PRD)

### 5d. Shared UI Components

- [x] Create `src/components/shared/confirm-dialog.tsx` — reusable modal overlay
  - Semi-transparent dark backdrop
  - White card centered, border-radius 14px, padding 20px
  - Title 16px weight 500 `#1C0F2E`, description 14px `#8C7A9B`
  - Two buttons: "Cancel" outlined `#3D1152`, "Confirm" filled (destructive: bg `#C13333`, white text)
- [x] Create `src/components/shared/toast.tsx` — bottom toast notifications
  - Bottom of screen, auto-dismiss 3 seconds
  - Success: bg `#1A7A4A`, white text
  - Error: bg `#C13333`, white text
- [x] Create `src/components/shared/skeleton-loader.tsx` — animated skeleton bars
  - Gray animated bars in `#EAE3F0`, not spinners
- [x] Create `src/components/shared/empty-state.tsx` — reusable empty state
  - Simple illustration + heading `#1C0F2E` + subtext `#8C7A9B` + optional CTA button in `#3D1152`
- [x] Create `src/components/shared/category-avatar.tsx` — colored circle with Lucide icon
  - Reusable across dashboard, transaction rows, category cards

---

## Step 5.5: Onboarding Flow (First Login Only)

Shown once immediately after first successful login, before reaching the main app. All three screens use bg `#FAF7F5`.

### 5.5a. Screen 1 — Welcome

- [x] Create `app/onboarding/welcome.tsx`
- [x] App logo centered, large
- [x] "Welcome to MoneyTracker" 24px weight 500 `#3D1152`
- [x] Subtitle: "Track your spending automatically or manually" 14px `#8C7A9B`
- [x] [ Get Started ] button — bg `#3D1152`, white text, border-radius 10px, full width
- [x] Tapping Get Started → navigate to Screen 2

### 5.5b. Screen 2 — Auto-Import Setup (Optional)

- [x] Create `app/onboarding/auto-import.tsx`
- [x] Heading: "Want transactions recorded automatically?" 20px weight 500 `#1C0F2E`
- [x] Subtitle: "Forward your bank or e-wallet emails and we'll do the rest." 14px `#8C7A9B`
- [x] Show user's unique intake address (copyable, e.g. user_abc123@intake.yourapp.com) — read from API or generate
- [x] Keyword management: input field + add button, active keyword chips (e.g. gopay, bca) with X to remove
- [x] Expandable step-by-step Gmail filter setup guide (collapsed by default)
- [x] [ Set Up Later ] button — outlined `#3D1152`, skips to Screen 3 without penalty
- [x] [ Done ] button — bg `#3D1152`, white text, proceeds to Screen 3
- [x] Both buttons always visible — neither blocks the user

### 5.5c. Screen 3 — Manual Entry Intro

- [x] Create `app/onboarding/manual-entry.tsx`
- [x] Heading: "You can always add transactions manually" 20px weight 500 `#1C0F2E`
- [x] Subtitle: "Tap the + button anytime to record cash or any transaction" 14px `#8C7A9B`
- [x] [ Go to Dashboard ] button — bg `#3D1152`, white text, border-radius 10px, full width
- [x] Tapping Go to Dashboard → navigate to main app (bottom tabs), mark onboarding complete

### 5.5d. Onboarding Logic

- [x] Track onboarding completion per user (store flag in AsyncStorage or Supabase user metadata)
- [x] After login: check onboarding flag → if not completed, show onboarding flow; if completed, go to main app
- [x] Onboarding flow uses horizontal swipe or next/back buttons (consistent navigation)
- [x] User can always access auto-import setup later from Profile → Transaction Import section (Phase 2.5)
- [x] Both methods (auto + manual) available simultaneously — manual entry always available regardless of auto-import status

---

## Step 6: Tab Navigation

### 6a. Create 5-Tab Layout

- [x] Create `app/(tabs)/index.tsx` — Home tab (placeholder)
- [x] Create `app/(tabs)/transactions.tsx` — Transactions tab (placeholder)
- [x] Create `app/(tabs)/add.tsx` — Add tab (placeholder, will be FAB style)
- [x] Create `app/(tabs)/categories.tsx` — Categories tab (placeholder)
- [x] Create `app/(tabs)/profile.tsx` — Profile tab (placeholder)

### 6b. Tab Configuration

- [x] Update `app/(tabs)/_layout.tsx` — 5 tabs with Lucide icons
- [x] Tab icons (per StitchBrief): Home (House), Transactions (LayoutList), Add (CirclePlus), Categories (Tag), Profile (User)
- [x] Active tab: icon + label color `#3D1152`
- [x] Inactive tab: icon + label color `#8C7A9B`, label 11px below icon
- [x] Add tab (center): icon color `#FF6B2B`, slightly larger 28px, no label
- [x] Tab bar background: White `#FFFFFF`
- [x] Tab bar top border: 0.5px `#EAE3F0`

---

## Step 7: Categories Tab

### 7a. Category Display

- [x] Create `src/components/categories/category-card.tsx` — icon + name + color circle
- [x] Create `src/components/categories/master-categories-section.tsx`
  - Section label "Default Categories" 12px weight 500 `#8C7A9B`, count badge in `#EDE0F5` bg
  - 3-column grid: white card, border 0.5px `#EAE3F0`, border-radius 12px, padding 14px
  - Colored circle avatar 40px centered, category name 12px `#1C0F2E` below
  - No edit/delete affordance
- [x] Create `src/components/categories/my-categories-section.tsx`
  - Section label "My Categories" with count badge
  - Same card grid layout, each card has PencilLine icon 12px `#8C7A9B` bottom-right
  - Tap card: opens Category Form Bottom Sheet prefilled
  - "Add Category" card at end: dashed border `#EAE3F0`, Plus icon 20px, "Add Category" 12px `#8C7A9B`
  - Empty state: "No custom categories yet" `#8C7A9B` + "Add your first" button
- [x] Wire up `use-categories` hook to fetch data

### 7b. Category Bottom Sheet Form

- [x] Create `src/components/categories/category-form-sheet.tsx` — add/edit form
- [x] Handle + title: "New Category" or "Edit Category" 16px weight 500 `#1C0F2E`
- [x] Name input: label "Name" 12px `#8C7A9B`, full width text input, border 0.5px `#EAE3F0`, border-radius 8px, padding 12px, autofocus
- [x] Icon picker: label "Icon" 12px `#8C7A9B`, horizontally scrollable grid of Lucide icons (min 30 options)
  - Unselected: bg `#FAF7F5`, icon `#8C7A9B`
  - Selected: bg `#EDE0F5`, border 1.5px `#3D1152`, icon `#3D1152`
- [x] Color picker: label "Color" 12px `#8C7A9B`, row of 10 color swatches (circles 28px each)
  - Colors: `#C13333`, `#FF6B2B`, `#1A7A4A`, `#3D1152`, `#8C7A9B`, `#2E5FA3`, `#B84080`, `#C17F24`, `#1A7A7A`, `#555555`
  - Selected: white checkmark in center
- [x] Edit mode only: "Delete Category" full width, `#C13333` text + border, above main buttons
- [x] Two buttons side by side: "Cancel" outlined `#3D1152` and "Save" filled bg `#3D1152` white text

### 7c. Category CRUD

- [x] Create new custom category → inserts with `user_id = auth.uid()`
- [x] Edit custom category → updates name/icon/color
- [x] Delete custom category → confirm dialog → hard delete (or soft delete via `is_active`)
- [x] Cannot edit/delete master categories (enforced by RLS)

---

## Step 8: Add Transaction Screen

### 8a. Full Screen Layout

- [x] Create `app/add-transaction.tsx` — full screen modal
- [x] Header: back arrow (ChevronLeft), title "Add Transaction" or "Edit Transaction", Trash2 icon (edit only)
- [x] Large amount input at top: currency symbol 24px `#8C7A9B`, amount 48px weight 500 `#1C0F2E`
- [x] Blinking cursor: 3px wide, color `#FF6B2B`, animated blink
- [x] Placeholder "0.00" in `#8C7A9B` when empty
- [x] Numeric keyboard auto-opens on screen load
- [x] Income / Expense toggle: pill container bg `#EAE3F0`, active expense bg `#C13333`, active income bg `#1A7A4A`, inactive text `#8C7A9B`
- [x] Form fields as tappable rows: icon in colored circle 28px, label, value, chevron
  - Category row → pushes to Category Picker Screen
  - Date row (CalendarDays icon) → native date picker, default today
  - Currency row (Globe icon) → currency selector, default from profile
  - Note row (FileText icon) → multiline text input, no chevron
- [x] Save button pinned at bottom: full width bg `#3D1152`, text "Save Transaction" with "action" in tangerine `#FF6B2B`
- [x] Save disabled state: bg `#EAE3F0`, text `#8C7A9B` (when amount is 0 or no category)

### 8b. Category Picker Screen (StitchBrief Screen 5B)

- [x] Create `app/category-picker.tsx` — full screen pushed from Add Transaction
- [x] Header: back arrow + "Select Category" title
- [x] "Default Categories" section header 12px weight 500 `#8C7A9B`
- [x] 3-column grid: white card, colored circle avatar 40px, category name 12px `#1C0F2E`
- [x] Selected state: card border 2px `#3D1152`, checkmark overlay top-right
- [x] "My Categories" section with same grid
- [x] Last cell: dashed border, Plus icon, "Add New" label `#8C7A9B` → opens Category Form Bottom Sheet

### 8b. Form Validation

- [x] Validate amount > 0
- [x] Validate category selected
- [x] Validate date is valid
- [x] Show validation errors inline

### 8c. Edit Mode

- [x] Same screen used for editing (prefilled with transaction data)
- [x] Delete button in header (only in edit mode)
- [x] Delete confirmation dialog

### 8d. Save Transaction

- [x] Insert new transaction via `use-transactions` hook
- [x] Set `source = 'manual'` by default on all new transactions (PRD v1.5 Section 3 — transactions.source)
- [x] Optimistic update on TanStack Query cache
- [x] Navigate back after save
- [x] Show toast on success/error

---

## Step 9: Home Dashboard

### 9a. Dashboard Header

- [x] Period: "This Month" — fixed for Phase 1, no selector

### 9b. Summary Cards

- [x] Create `src/components/home/summary-cards.tsx` — 3 cards at top
- [x] Total Income card — green `#1A7A4A` accent
- [x] Total Expense card — red `#C13333` accent
- [x] Balance card — plum `#3D1152`

### 9c. Spending by Category

- [x] Create `src/components/home/spending-by-category.tsx`
- [x] Section header: "Spending by Category" left, "See all" 12px `#FF6B2B` right
- [x] Up to 5 category rows: colored circle avatar 32px, category name 13px `#1C0F2E`, amount 13px weight 500 right-aligned
- [x] Thin progress bar: track bg `#EAE3F0`, fill = category icon color, height 3px, border-radius 2px
- [x] Empty state: "No expenses this month" centered `#8C7A9B`

### 9d. Recent Transactions

- [x] Create `src/components/home/recent-transactions.tsx`
- [x] Section header: "Recent Transactions" left, "See all" 12px `#FF6B2B` right
- [x] Last 5 transactions, each row: colored circle avatar 36px, name/merchant 13px weight 500, amount with `+`/`−` prefix
- [x] Time below amount: 11px `#8C7A9B` (e.g. "Today, 19:30"), date below time if different day
- [x] Empty state: illustration + "No transactions yet" + "Add Transaction" button in `#3D1152`
- [x] Tap row → open Transaction Bottom Sheet

### 9e. Transaction Bottom Sheet

- [ ] Create `src/components/transactions/transaction-detail-sheet.tsx`
- [ ] Handle + category icon circle 52px centered, colored bg, Lucide icon 24px
- [ ] Category name 13px `#8C7A9B` centered below icon
- [ ] Amount 32px weight 500 centered, `#C13333` expense or `#1A7A4A` income, with currency symbol and prefix
- [ ] Type badge: Expense bg `#FCEAEA` text `#C13333` or Income bg `#E6F5EE` text `#1A7A4A`, border-radius 20px
- [ ] Divider: full width 0.5px border `#EAE3F0`
- [ ] Detail rows (label left `#8C7A9B`, value right weight 500 `#1C0F2E`): Date, Time, Note (or "—"), Source ("Manual entry" or "Split bill: [title]")
- [ ] Edit button: full width outlined border `#3D1152`, PencilLine icon, navigates to Edit Transaction screen
- [ ] Delete button: full width outlined border `#C13333`, Trash2 icon, opens confirm dialog

---

## Step 10: Transaction List

### 10a. List Header + Display

- [x] Header: title "Transactions" 20px weight 500 `#1C0F2E`, right: SlidersHorizontal icon 22px `#8C7A9B`
- [x] Filter icon shows filled tangerine `#FF6B2B` dot badge when any filter is active
- [x] Create `src/components/transactions/transaction-row.tsx`
- [x] Each row: colored circle avatar 40px with Lucide category icon
- [x] Name/merchant 14px weight 500 `#1C0F2E` (primary label — note or merchant name)
- [x] Amount 14px weight 500 right (red `#C13333` with `−` or green `#1A7A4A` with `+`)
- [x] Time 11px `#8C7A9B` below amount (e.g. "Today, 19:30"), date below time if different day
- [x] Row separator: 0.5px border `#EAE3F0`

### 10b. Search + Filter Chips

- [x] Search bar: full width input, bg white, border 0.5px `#EAE3F0`, border-radius 10px, Search icon left `#8C7A9B`, clear X button when text entered
- [ ] Active filter chips: horizontal scrollable row below search
- [ ] Each chip: bg `#EDE0F5`, text `#3D1152`, 12px, border-radius 20px, small X to remove
- [ ] Tap filter icon → open Filter Bottom Sheet

### 10c. Filter Bottom Sheet

- [ ] Create `src/components/transactions/filter-sheet.tsx`
- [ ] Header row: "Filter Transactions" 16px weight 500 `#1C0F2E` left, "Reset" 14px `#FF6B2B` right
- [ ] Type filter: 3 toggle chips (All / Income / Expense), active bg `#3D1152` white text, inactive bg `#FAF7F5` border `#EAE3F0`
- [ ] Category filter: scrollable grid of category chips (icon + name), multiselect
- [ ] Date range: two fields side by side ("From" / "To"), CalendarDays icon left, tap opens native date picker
- [ ] Apply button pinned bottom: bg `#3D1152`, label "Apply Filters" or "Apply (N filters)"

### 10d. Date Grouping + Interactions

- [x] Group transactions by date with sticky headers: "Today", "Yesterday", then "Mon, 12 Jan 2026"
- [x] Date header: 12px weight 500 `#8C7A9B`, bg `#FAF7F5`
- [ ] Infinite scroll with loading indicator
- [ ] Swipe left on row: reveals red Delete button
- [ ] Tap row: opens Transaction Detail Bottom Sheet
- [ ] Loading: skeleton rows in `#EAE3F0`
- [ ] Empty state: illustration + "No transactions found" + "Clear filters" button if filters active

---

## Step 11: Profile Tab

### 11a. Profile Screen

- [x] Header: title "Profile" 20px weight 500 `#1C0F2E`
- [x] User card (white card, border-radius 12px, padding 16px):
  - **Signed-in users:** Circle avatar 64px from Google photo, fallback initials bg `#EDE0F5` text `#3D1152`
  - Display name 16px weight 500 `#1C0F2E`, email 13px `#8C7A9B`
- [x] Preferences section: label "Preferences" 12px weight 500 `#8C7A9B`
  - White card with row: Globe icon `#8C7A9B`, "Default Currency" `#1C0F2E`, current value e.g. "USD" `#3D1152`, ChevronRight `#8C7A9B`
- [x] Account section: label "Account" 12px weight 500 `#8C7A9B`
  - **Signed-in:** LogOut icon `#C13333`, "Sign Out" 14px `#C13333` → confirm dialog
- [x] Footer: "MoneyTracker v1.0.0" 11px `#8C7A9B` centered at bottom

---

## Step 12: Final Polish

### 12a. Navigation Refinements

- [ ] Transaction Bottom Sheet: edit → Add Transaction (prefilled) → save → refresh list
- [ ] Home recent transaction tap → Transaction Bottom Sheet
- [ ] Dashboard "See all" links → navigate to Transactions tab / Categories tab
- [ ] Back navigation works correctly from all screens
- [ ] Add tab (center) navigates to Add Transaction full screen

### 12b. Error Handling

- [ ] Network error states (Supabase unreachable)
- [ ] Empty states for all lists using shared `empty-state.tsx` component
- [ ] Loading skeletons using shared `skeleton-loader.tsx` (animated bars `#EAE3F0`, not spinners)
- [ ] Toast notifications for save/delete/error using shared `toast.tsx`
- [ ] All confirm dialogs use shared `confirm-dialog.tsx`

### 12c. Visual Polish

- [ ] All colors match PRD Section 12 + StitchBrief design system
- [ ] All cards: white bg, 0.5px border `#EAE3F0`, border-radius 12px, padding 16px
- [ ] All bottom sheets: white surface, 18px top border-radius, drag handle bar
- [ ] Income amounts: `+` prefix, green `#1A7A4A` always
- [ ] Expense amounts: `−` prefix, red `#C13333` always
- [ ] Balance: `#3D1152`, turns `#C13333` if negative
- [ ] No dark mode (light only, bg always `#FAF7F5`)
- [ ] Active tab indicator: plum `#3D1152`
- [ ] Destructive actions (delete): `#C13333` text and border only, never filled red button

---

## Step 13: Release Readiness (Pre-Play Store)

These are not Phase 1 features, but they are the gate between "Phase 1 done" and "Phase 1 shipped." Complete before submitting to Google Play.

### 13a. Android Packaging

- [ ] Create `eas.json` with `preview` (APK) and `production` (AAB) profiles
- [ ] Set `android.package` in `app.json` (e.g. `com.yourdomain.moneytracker`)
- [ ] Set `android.versionCode` in `app.json`
- [ ] Run first `eas build --profile preview` to catch native linking issues (NativeWind, date-picker, bottom-sheet)
- [ ] Store secrets in EAS Environment Variables (`eas env:create`), not committed `.env`

### 13b. Store Policy Compliance

- [ ] Account deletion: Supabase Edge Function using service role key (cascade delete across all tables per PRD §16.4)
- [ ] Account deletion: in-app button in Profile tab with confirm dialog
- [ ] Account deletion: web-hosted fallback page (Google requires both in-app + web option since April 2023)
- [ ] Privacy policy hosted at public URL (Cloudflare Pages or GitHub Pages) — content mapped in PRD §16.5
- [ ] Data safety form filled in Play Console (maps 1:1 to PRD §16.1 data table)
- [ ] Declare app does NOT handle payments or store payment instruments (avoid financial-app extra scrutiny)

### 13c. OAuth Hardening

- [ ] Add explicit `redirectUri` per platform in Google auth request (current code relies on Expo Go defaults, breaks in standalone)
- [ ] Configure per-platform Google OAuth client IDs in Google Cloud Console (Android, iOS, Web)
- [ ] Test full Google Sign In flow on a production APK build, not just Expo Go

### 13d. Observability

- [ ] Add `@sentry/react-native` dependency (listed in PRD §2 but not in package.json)
- [ ] Configure Sentry DSN via EAS env var
- [ ] Verify crash reports arrive from a staging build

### 13e. Store Listing Assets

- [ ] App icon 512×512 PNG
- [ ] Feature graphic 1024×500 PNG
- [ ] 4–8 screenshots (use `react-native-view-shot` or manual emulator captures)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Content rating questionnaire completed in Play Console

---

## Verification

Before marking Phase 1 complete, verify each:

- [ ] Google OAuth login works (login screen → dashboard)
- [ ] Splash screen auto-redirects correctly (with/without session)
- [ ] ~~"Continue as Guest" works~~ — Removed in PRD v1.3
- [ ] Onboarding flow shown on first login only (3 screens: Welcome → Auto-Import → Manual Entry)
- [ ] Onboarding skipped on subsequent logins
- [ ] Can create, edit, delete transactions
- [ ] New transactions have `source = 'manual'` by default
- [ ] Can create, edit, delete custom categories
- [ ] Master categories visible, read-only (no edit/delete affordance)
- [ ] Category picker screen works from Add Transaction
- [ ] Home dashboard shows correct summary for current month
- [ ] Dashboard greeting shows user's first name
- [ ] Transaction list with search and filter works
- [ ] Filter badge shows on filter icon when active
- [ ] Swipe to delete works on transaction rows
- [ ] Profile shows user avatar, info, logout works
- [ ] Toast notifications appear for save/delete/error
- [ ] Confirm dialog used for all destructive actions
- [ ] All colors match PRD Section 12 + StitchBrief design system
- [ ] All bottom sheets have correct styling (18px radius, drag handle)
- [ ] Loading skeletons shown (not spinners)
- [ ] Empty states shown for all lists
- [ ] No console errors
- [ ] App runs on Android device or emulator

---

_Created: April 2026_
_Updated: May 2026 — aligned with PRD v1.5 (guest mode removed, onboarding flow added, source field added, privacy/RLS sections noted). Guest mode code retained but not required for Phase 1._
_For: MoneyTracker App Phase 1 Implementation_

---

## Tech Debt (Fix Before Phase 1 Complete)

Shortcuts or incorrect code that already exists in the codebase. These violate project conventions and should be fixed — not just documented.

### TD-1: Dead guest-mode code in auth context

- **File:** `src/contexts/auth-context.tsx`
- **Issue:** `signInAsGuest`, `isGuest`, `GUEST_KEY`, and `migrateGuestDataToSupabase()` call still present. Guest mode was removed in PRD v1.3 (see Step 3d). Code is dead surface area that will confuse Play Store review.
- **Convention violated:** `rules/common/coding-style.md` — no dead code / backwards-compat hacks
- **Fix:** Remove guest state, methods, storage key, and the migrate-guest import/call. Also delete `src/stores/guest-data-store.ts` and `src/lib/migrate-guest.ts` if no longer referenced.

### TD-2: Android adaptive icon uses wrong background color

- **File:** `app.json` (line ~17)
- **Issue:** `adaptiveIcon.backgroundColor` is `#E6F4FE` (generic Expo light blue). Violates locked PRD palette.
- **Convention violated:** PRD §13 / §15 — palette is locked (Parchment `#FAF7F5` or Plum `#3D1152`)
- **Fix:** Change `#E6F4FE` → `#FAF7F5`

### TD-3: Google OAuth missing explicit redirect URIs

- **File:** `src/contexts/auth-context.tsx` (lines ~33-38)
- **Issue:** `Google.useAuthRequest` passes only `clientId` with no `redirectUri`. Works in Expo Go, breaks in standalone production builds. Also uses a single client ID — production needs per-platform client IDs (Android, iOS, Web).
- **Convention violated:** Production readiness; Phase 1 Verification requires Google Sign In to work end-to-end
- **Fix:** Add explicit `redirectUri` per platform using `AuthSession.makeRedirectUri()`. Configure separate Google OAuth client IDs per platform in Google Cloud Console.

### TD-4: Insecure auth session storage (AsyncStorage)

- **File:** `src/lib/supabase.ts` (line 14)
- **Issue:** Supabase client uses default storage (AsyncStorage) for auth session tokens. AsyncStorage is unencrypted and readable by anyone with device access. Unacceptable for a finance app handling transaction data.
- **Convention violated:** `rules/common/security.md` — security-first; finance app baseline
- **Fix:** Install `expo-secure-store`, pass a SecureStore-backed storage adapter to `createClient()`:
  ```typescript
  const storage = {
    getItem: SecureStore.getItemAsync,
    setItem: SecureStore.setItemAsync,
    removeItem: SecureStore.deleteItemAsync,
  };
  createClient(url, key, {
    auth: { storage, autoRefreshToken: true, persistSession: true },
  });
  ```

### TD-5: `source` CHECK constraint missing 'email' value

- **File:** `sql/01_create_phase1_tables.sql` (line 62)
- **Issue:** Column defined as `CHECK (source IN ('manual', 'split_bill'))` but PRD §3 requires enum `manual | split_bill | email`. When Phase 2.5 email auto-import ships, every INSERT with `source = 'email'` will fail at the DB level.
- **Convention violated:** PRD §3 schema definition; forward compatibility
- **Fix:** Update constraint to `CHECK (source IN ('manual', 'split_bill', 'email'))`. Run as a migration before any data accumulates. Also update `src/types/database.ts` to match.

### TD-6: Currency default 'USD' instead of 'IDR'

- **File:** `sql/01_create_phase1_tables.sql` (line 53)
- **Issue:** `DEFAULT 'USD'` — the app is for Indonesian users (UU PDP compliance, GoPay/BCA/Mandiri, IDR). StitchBrief even shows "$1,250.00" examples that should be "Rp1.250.000" formatting. Wrong default currency breaks every new transaction.
- **Convention violated:** PRD target market (Indonesia); UX correctness
- **Fix:** Change `DEFAULT 'USD'` → `DEFAULT 'IDR'`. Update StitchBrief currency format examples to use Rp prefix and Indonesian thousand separators.

### TD-7: Zero test infrastructure despite 80% coverage requirement

- **Files:** `package.json`, entire `src/` and `app/` directories
- **Issue:** AGENTS.md and `rules/common/testing.md` require 80%+ test coverage (unit + integration + E2E). There is **no testing framework installed** — no Jest, Vitest, React Native Testing Library, or Playwright in dependencies. No test files exist anywhere. This is the single biggest gap blocking Phase 1 completion.
- **Convention violated:** `rules/common/testing.md` — 80% minimum; AGENTS.md Core Principle #2 (Test-Driven)
- **Fix:** Set up before continuing Step 4:

  ```bash
  npm install -D jest @testing-library/react-native @testing-library/jest-native @types/jest
  npm install -D jest-expo  # Expo-specific Jest preset
  ```

  - Add `jest.config.js` with `preset: 'jest-expo'`
  - Add `"test": "jest"` script to package.json
  - Create `src/__tests__/` directory
  - Write tests for existing code first: `auth-context`, `supabase` client, `colors`/`categories`/`typography` constants
  - All new Step 4+ code must be test-first per `tdd-workflow` skill

---

## Architecture Recommendations (For Review)

These are not bugs or tech debt — they're design decisions worth reconsidering before committing to the current PRD scope. Each needs a decision (accept / reject / defer) before the affected phase begins.

### AR-1: Re-scope FastAPI backend (affects Phase 2)

- **Current plan:** Full FastAPI backend duplicating `/transactions`, `/categories`, `/summary` CRUD ([PRD §6.3](./MoneyTracker_PRD_v1.5.md)).
- **Recommendation:** Supabase already provides PostgREST auto-API + RLS. The Vite web dashboard can call Supabase directly with the user's JWT. FastAPI is only needed for operations requiring the service role key or third-party secrets:
  - ✅ `/email-import` (needs service role + Cloudflare Worker auth)
  - ✅ Account deletion (needs service role for cascade delete)
  - ✅ Future AI chat agent proxy (needs API keys)
  - ❌ `/transactions` CRUD — use Supabase client + RLS directly
  - ❌ `/categories` CRUD — use Supabase client + RLS directly
  - ❌ `/summary` aggregation — use Supabase RPC (Postgres function) directly
- **Impact:** Cuts Phase 2 backend scope by ~50%. Less infra to host, monitor, secure.
- **Decision needed:** Before Phase 2 planning.

### AR-2: Add `@shopify/flash-list` for transaction lists (Phase 1)

- **Issue:** StitchBrief Screen 4 specifies infinite scroll transaction list. Stock `FlatList` janks above ~200 items. Retrofitting later means rewriting every list component.
- **Recommendation:** Install now, use in all list components from day one.
- **Impact:** Drop-in replacement for FlatList, ~5× faster, same API.
- **Decision needed:** Before Step 9 (Home Dashboard) and Step 10 (Transaction List).

### AR-3: Add recurring transactions feature (Phase 1 or 2)

- **Gap:** Most users have ~10 recurring expenses (rent, phone, subscriptions). Without recurring transactions, they manually re-enter every month and churn. This is higher user value than OCR or AI chat.
- **Recommendation:** Add before Phase 3 (OCR) / Phase 4 (AI). Schema is minimal:
  - New table: `recurring_transactions` (id, user_id, amount, category_id, type, frequency, next_date, is_active)
  - Supabase `pg_cron` job materializes due recurring transactions into `transactions` table
- **Impact:** Significantly reduces user churn; small implementation cost.
- **Decision needed:** Whether to add to Phase 1 (scope creep) or make it Phase 2 priority.

### AR-4: Move email auto-import setup out of onboarding (Phase 2.5)

- **Issue:** PRD §5.2 Screen 2 puts email auto-import setup in onboarding. Two problems:
  1. Users haven't seen app value yet — won't configure Gmail filters for an app they just opened
  2. Setup is 5+ steps with Gmail verification — massive drop-off
- **Recommendation:** Move email setup to Profile → Transaction Import (already planned in §7.8). Replace onboarding Screen 2 with a one-line teaser: _"Want transactions imported automatically? Set up later in Profile."_
- **Impact:** Higher onboarding completion rate; lower churn.
- **Decision needed:** Before Step 5.5 (Onboarding Flow) implementation.
- **Status:** ✅ DECIDED — Build teaser version. One-screen summary ("Track automatically, too — set up anytime in Profile"), no copyable intake address, no keyword form, no Gmail guide. Full setup moves to Profile → Transaction Import in Phase 2.5 when backend exists. User confirmed: curiosity-driven discovery > forced form.

### AR-5: Drop per-transaction currency selector (Phase 1)

- **Issue:** StitchBrief Screen 5 puts a currency selector on every transaction. Most users have one currency (IDR). Per-transaction currency adds complexity (FX rates, multi-currency totals) you don't need.
- **Recommendation:** Profile-level default currency only. Remove currency row from Add Transaction screen. Schema `currency` column stays (always = user's default) for future flexibility, but no UI.
- **Impact:** Simpler UX, less scope, fewer edge cases.
- **Decision needed:** Before Step 8 (Add Transaction Screen) implementation.
- **Status:** ✅ DECIDED — KEEP selector per PRD; defer FX aggregation. Selector stays in UI (defaults to user preference), but dashboard Phase 1 totals only sum transactions in the user's default currency. Foreign-currency transactions are stored correctly but excluded from monthly summary with a small footnote ("N transactions in other currencies not included"). FX rate table deferred to Phase 2+.

### AR-6: Add CSV export in Phase 1 (UU PDP legal requirement)

- **Issue:** PRD §16.3 lists "Right to data portability" as a UU PDP obligation, mapped to "Export to CSV via web dashboard (Phase 2)." But you can't ship to Play Store without fulfilling data portability — it's a legal right, not a feature.
- **Recommendation:** Add basic CSV export in Phase 1 Profile tab before Play Store submission. ~30 lines of code using a simple CSV builder + `expo-sharing` or `expo-file-system`.
- **Impact:** Legal compliance for Phase 5 launch; unblocks Play Store submission.
- **Decision needed:** Whether to add to Phase 1 scope or accept launch delay until Phase 2.

### AR-7: Offline-first data layer (Option 1: TanStack Query persist + write queue)

- **Issue:** Finance apps are used in low-connectivity places (markets, parking, food courts). Without offline support, `INSERT`/`UPDATE` calls fail immediately and data is lost. The app also can't render previously-fetched lists when offline.
- **Recommendation:** Implement lightweight offline-first using:
  - **Reads:** `@tanstack/query-async-storage-persister` persists the query cache to AsyncStorage so lists render from cache even with no connection. 24h max age.
  - **Writes:** Custom Zustand store (`pending-writes-store.ts`) holds failed mutations in AsyncStorage. Dedupes by `tempId` so offline edit-twice on the same row doesn't create conflicts.
  - **Sync:** `SyncProvider` listens via `@react-native-community/netinfo`. On reconnect, drains the queue → executes against Supabase → removes on success → max 5 retries → prunes failed writes.
  - **Conflict resolution:** Last-write-wins (acceptable for Phase 1 single-user single-device; upgrade to PowerSync in Phase 2 for multi-device).
- **Impact:** Users can record transactions offline; queued writes sync when back online; reads work from cache.
- **Status:** ✅ IMPLEMENTED — installed in Step 4 alongside data hooks. Affects: `query-provider.tsx`, `pending-writes-store.ts`, `sync-provider.tsx`, all mutation hooks in `use-categories.ts` and `use-transactions.ts`.
