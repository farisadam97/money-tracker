# Phase 1: Mobile App + Manual Tracker

Use this checklist to track progress through Phase 1 implementation. Complete each step in order — do not skip ahead.

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
- [ ] Verify client connects (test query in app or console)

### 3b. Auth Context
- [x] Create `src/contexts/auth-context.tsx` — session state + user object + guest mode flag
- [x] Create `src/hooks/use-auth.ts` — convenience hook wrapping context
- [x] Handle session persistence (auto-login on app reopen)
- [x] Track guest mode state: `isGuest` boolean (stored in AsyncStorage)

### 3c. Google OAuth Flow
- [x] Configure `expo-auth-session` with Google provider
- [ ] Configure redirect URIs for development (`exp://127.0.0.1:19000/--/`)
- [x] Implement sign-in flow using `expo-web-browser` + `expo-auth-session` + `supabase.auth.signInWithIdToken`
- [x] Implement sign-out flow
- [ ] Test: Google Sign In → session created → sign out → session cleared

### 3d. Guest Mode
- [x] Implement "Continue as Guest" — sets `isGuest = true` in AsyncStorage
- [x] Guest users skip Supabase auth entirely
- [x] Guest data stored locally in AsyncStorage (transactions + categories)
- [ ] Guest users see "Sign in to sync" prompt on Profile tab
- [x] Guest → Sign In flow: save local data, authenticate, migrate local data to Supabase

---

## Step 4: State Management + Query Setup

### 4a. TanStack Query Provider
- [ ] Create `src/providers/query-provider.tsx` — QueryClient wrapper
- [ ] Wrap app root with provider in `app/_layout.tsx`

### 4b. Zustand Stores
- [ ] Create `src/stores/user-preferences-store.ts` — default currency, etc.
- [ ] Create `src/stores/filter-store.ts` — transaction filter state (type, categories, date range)
- [ ] Create `src/stores/guest-data-store.ts` — local-only storage for guest transactions and categories
- [ ] Persist user preferences to AsyncStorage
- [ ] Persist guest data to AsyncStorage

### 4c. Data Hooks
- [ ] Create `src/hooks/use-categories.ts` — fetch, create, update, delete categories
- [ ] Create `src/hooks/use-transactions.ts` — fetch, create, update, delete transactions
- [ ] Create `src/hooks/use-summary.ts` — monthly income/expense/balance aggregation
- [ ] Test: fetch master categories (should return 8 rows)

---

## Step 5: Auth Screens

### 5a. Splash Screen
- [ ] Create `app/splash.tsx` — full screen, centered, bg `#FAF7F5`
- [ ] App logo centered, large (80–100px)
- [ ] App name "MoneyTracker" 24px weight 500 `#3D1152`
- [ ] Tagline "Track smart, spend wise" 14px `#8C7A9B`
- [ ] Small circular spinner `#3D1152` below tagline
- [ ] If session exists → redirect to main app
- [ ] If no session → redirect to login

### 5b. Login Screen
- [ ] Create `app/login.tsx` — full screen, bg `#FAF7F5`
- [ ] Top 45% branding: app logo, "MoneyTracker" 28px weight 500 `#3D1152`, tagline 14px `#8C7A9B`
- [ ] Center auth area: "Welcome back" 20px weight 500 `#1C0F2E`, subtitle "Sign in to continue tracking your finances" 14px `#8C7A9B`
- [ ] Google Sign In button: white bg, border 0.5px `#EAE3F0`, border-radius 10px, full width max 320px, padding 14px
  - Left: Google logo SVG 20px, center: "Continue with Google" 14px weight 500 `#1C0F2E`
  - Loading state: spinner replaces text during OAuth
- [ ] "Continue as Guest" button: outlined, border 0.5px `#EAE3F0`, border-radius 10px, full width max 320px, padding 14px
  - Text: "Continue as Guest" 14px weight 500 `#8C7A9B`, no icon
- [ ] Footer: "By continuing you agree to our Terms of Service and Privacy Policy" 11px `#8C7A9B`
  - "Terms of Service" and "Privacy Policy" underlined, color `#3D1152`
- [ ] Error state if OAuth fails

### 5c. Root Layout Update
- [ ] Update `app/_layout.tsx` — auth gate: redirect to login if no session
- [ ] Remove dark mode support (light mode only per PRD)

### 5d. Shared UI Components
- [ ] Create `src/components/shared/confirm-dialog.tsx` — reusable modal overlay
  - Semi-transparent dark backdrop
  - White card centered, border-radius 14px, padding 20px
  - Title 16px weight 500 `#1C0F2E`, description 14px `#8C7A9B`
  - Two buttons: "Cancel" outlined `#3D1152`, "Confirm" filled (destructive: bg `#C13333`, white text)
- [ ] Create `src/components/shared/toast.tsx` — bottom toast notifications
  - Bottom of screen, auto-dismiss 3 seconds
  - Success: bg `#1A7A4A`, white text
  - Error: bg `#C13333`, white text
- [ ] Create `src/components/shared/skeleton-loader.tsx` — animated skeleton bars
  - Gray animated bars in `#EAE3F0`, not spinners
- [ ] Create `src/components/shared/empty-state.tsx` — reusable empty state
  - Simple illustration + heading `#1C0F2E` + subtext `#8C7A9B` + optional CTA button in `#3D1152`
- [ ] Create `src/components/shared/category-avatar.tsx` — colored circle with Lucide icon
  - Reusable across dashboard, transaction rows, category cards

---

## Step 6: Tab Navigation

### 6a. Create 5-Tab Layout
- [ ] Create `app/(tabs)/index.tsx` — Home tab (placeholder)
- [ ] Create `app/(tabs)/transactions.tsx` — Transactions tab (placeholder)
- [ ] Create `app/(tabs)/add.tsx` — Add tab (placeholder, will be FAB style)
- [ ] Create `app/(tabs)/categories.tsx` — Categories tab (placeholder)
- [ ] Create `app/(tabs)/profile.tsx` — Profile tab (placeholder)

### 6b. Tab Configuration
- [ ] Update `app/(tabs)/_layout.tsx` — 5 tabs with Lucide icons
- [ ] Tab icons (per StitchBrief): Home (House), Transactions (LayoutList), Add (CirclePlus), Categories (Tag), Profile (User)
- [ ] Active tab: icon + label color `#3D1152`
- [ ] Inactive tab: icon + label color `#8C7A9B`, label 11px below icon
- [ ] Add tab (center): icon color `#FF6B2B`, slightly larger 28px, no label
- [ ] Tab bar background: White `#FFFFFF`
- [ ] Tab bar top border: 0.5px `#EAE3F0`

---

## Step 7: Categories Tab

### 7a. Category Display
- [ ] Create `src/components/categories/category-card.tsx` — icon + name + color circle
- [ ] Create `src/components/categories/master-categories-section.tsx`
  - Section label "Default Categories" 12px weight 500 `#8C7A9B`, count badge in `#EDE0F5` bg
  - 3-column grid: white card, border 0.5px `#EAE3F0`, border-radius 12px, padding 14px
  - Colored circle avatar 40px centered, category name 12px `#1C0F2E` below
  - No edit/delete affordance
- [ ] Create `src/components/categories/my-categories-section.tsx`
  - Section label "My Categories" with count badge
  - Same card grid layout, each card has PencilLine icon 12px `#8C7A9B` bottom-right
  - Tap card: opens Category Form Bottom Sheet prefilled
  - "Add Category" card at end: dashed border `#EAE3F0`, Plus icon 20px, "Add Category" 12px `#8C7A9B`
  - Empty state: "No custom categories yet" `#8C7A9B` + "Add your first" button
- [ ] Wire up `use-categories` hook to fetch data

### 7b. Category Bottom Sheet Form
- [ ] Create `src/components/categories/category-form-sheet.tsx` — add/edit form
- [ ] Handle + title: "New Category" or "Edit Category" 16px weight 500 `#1C0F2E`
- [ ] Name input: label "Name" 12px `#8C7A9B`, full width text input, border 0.5px `#EAE3F0`, border-radius 8px, padding 12px, autofocus
- [ ] Icon picker: label "Icon" 12px `#8C7A9B`, horizontally scrollable grid of Lucide icons (min 30 options)
  - Unselected: bg `#FAF7F5`, icon `#8C7A9B`
  - Selected: bg `#EDE0F5`, border 1.5px `#3D1152`, icon `#3D1152`
- [ ] Color picker: label "Color" 12px `#8C7A9B`, row of 10 color swatches (circles 28px each)
  - Colors: `#C13333`, `#FF6B2B`, `#1A7A4A`, `#3D1152`, `#8C7A9B`, `#2E5FA3`, `#B84080`, `#C17F24`, `#1A7A7A`, `#555555`
  - Selected: white checkmark in center
- [ ] Edit mode only: "Delete Category" full width, `#C13333` text + border, above main buttons
- [ ] Two buttons side by side: "Cancel" outlined `#3D1152` and "Save" filled bg `#3D1152` white text

### 7c. Category CRUD
- [ ] Create new custom category → inserts with `user_id = auth.uid()`
- [ ] Edit custom category → updates name/icon/color
- [ ] Delete custom category → confirm dialog → hard delete (or soft delete via `is_active`)
- [ ] Cannot edit/delete master categories (enforced by RLS)

---

## Step 8: Add Transaction Screen

### 8a. Full Screen Layout
- [ ] Create `app/add-transaction.tsx` — full screen modal
- [ ] Header: back arrow (ChevronLeft), title "Add Transaction" or "Edit Transaction", Trash2 icon (edit only)
- [ ] Large amount input at top: currency symbol 24px `#8C7A9B`, amount 48px weight 500 `#1C0F2E`
- [ ] Blinking cursor: 3px wide, color `#FF6B2B`, animated blink
- [ ] Placeholder "0.00" in `#8C7A9B` when empty
- [ ] Numeric keyboard auto-opens on screen load
- [ ] Income / Expense toggle: pill container bg `#EAE3F0`, active expense bg `#C13333`, active income bg `#1A7A4A`, inactive text `#8C7A9B`
- [ ] Form fields as tappable rows: icon in colored circle 28px, label, value, chevron
  - Category row → pushes to Category Picker Screen
  - Date row (CalendarDays icon) → native date picker, default today
  - Currency row (Globe icon) → currency selector, default from profile
  - Note row (FileText icon) → multiline text input, no chevron
- [ ] Save button pinned at bottom: full width bg `#3D1152`, text "Save Transaction" with "action" in tangerine `#FF6B2B`
- [ ] Save disabled state: bg `#EAE3F0`, text `#8C7A9B` (when amount is 0 or no category)

### 8b. Category Picker Screen (StitchBrief Screen 5B)
- [ ] Create `app/category-picker.tsx` — full screen pushed from Add Transaction
- [ ] Header: back arrow + "Select Category" title
- [ ] "Default Categories" section header 12px weight 500 `#8C7A9B`
- [ ] 3-column grid: white card, colored circle avatar 40px, category name 12px `#1C0F2E`
- [ ] Selected state: card border 2px `#3D1152`, checkmark overlay top-right
- [ ] "My Categories" section with same grid
- [ ] Last cell: dashed border, Plus icon, "Add New" label `#8C7A9B` → opens Category Form Bottom Sheet

### 8b. Form Validation
- [ ] Validate amount > 0
- [ ] Validate category selected
- [ ] Validate date is valid
- [ ] Show validation errors inline

### 8c. Edit Mode
- [ ] Same screen used for editing (prefilled with transaction data)
- [ ] Delete button in header (only in edit mode)
- [ ] Delete confirmation dialog

### 8d. Save Transaction
- [ ] Insert new transaction via `use-transactions` hook
- [ ] Optimistic update on TanStack Query cache
- [ ] Navigate back after save
- [ ] Show toast on success/error

---

## Step 9: Home Dashboard

### 9a. Dashboard Header
- [ ] Left: greeting "Good morning," 12px `#8C7A9B`, below it "[First Name]" 18px weight 500 `#1C0F2E`
- [ ] Right: BellRing icon 22px `#8C7A9B` — placeholder, no action Phase 1
- [ ] Period chip: "This Month" pill, bg `#EDE0F5`, text `#3D1152`, 12px, padding 4px 14px, border-radius 20px (not tappable Phase 1)

### 9b. Available Balance Card
- [ ] Create `src/components/home/balance-card.tsx` — full width card
- [ ] Card: bg `#3D1152`, border-radius 14px, padding 20px
- [ ] Label "AVAILABLE BALANCE" 11px weight 500 `rgba(255,255,255,0.7)` letter-spacing 0.5px
- [ ] Amount 36px weight 500 `#FFFFFF` with currency symbol
- [ ] Bottom row: Income (TrendingUp icon `#1A7A4A` + label + amount in white) left, Expenses (TrendingDown icon `#C13333` + label + amount in white) right

### 9c. Spending by Category
- [ ] Create `src/components/home/spending-by-category.tsx`
- [ ] Section header: "Spending by Category" left, "See all" 12px `#FF6B2B` right
- [ ] Up to 5 category rows: colored circle avatar 32px, category name 13px `#1C0F2E`, amount 13px weight 500 right-aligned
- [ ] Thin progress bar: track bg `#EAE3F0`, fill = category icon color, height 3px, border-radius 2px
- [ ] Empty state: "No expenses this month" centered `#8C7A9B`

### 9d. Recent Transactions
- [ ] Create `src/components/home/recent-transactions.tsx`
- [ ] Section header: "Recent Transactions" left, "See all" 12px `#FF6B2B` right
- [ ] Last 5 transactions, each row: colored circle avatar 36px, name/merchant 13px weight 500, amount with `+`/`−` prefix
- [ ] Time below amount: 11px `#8C7A9B` (e.g. "Today, 19:30"), date below time if different day
- [ ] Empty state: illustration + "No transactions yet" + "Add Transaction" button in `#3D1152`
- [ ] Tap row → open Transaction Bottom Sheet

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
- [ ] Header: title "Transactions" 20px weight 500 `#1C0F2E`, right: SlidersHorizontal icon 22px `#8C7A9B`
- [ ] Filter icon shows filled tangerine `#FF6B2B` dot badge when any filter is active
- [ ] Create `src/components/transactions/transaction-row.tsx`
- [ ] Each row: colored circle avatar 40px with Lucide category icon
- [ ] Name/merchant 14px weight 500 `#1C0F2E` (primary label — note or merchant name)
- [ ] Amount 14px weight 500 right (red `#C13333` with `−` or green `#1A7A4A` with `+`)
- [ ] Time 11px `#8C7A9B` below amount (e.g. "Today, 19:30"), date below time if different day
- [ ] Row separator: 0.5px border `#EAE3F0`

### 10b. Search + Filter Chips
- [ ] Search bar: full width input, bg white, border 0.5px `#EAE3F0`, border-radius 10px, Search icon left `#8C7A9B`, clear X button when text entered
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
- [ ] Group transactions by date with sticky headers: "Today", "Yesterday", then "Mon, 12 Jan 2026"
- [ ] Date header: 12px weight 500 `#8C7A9B`, bg `#FAF7F5`
- [ ] Infinite scroll with loading indicator
- [ ] Swipe left on row: reveals red Delete button
- [ ] Tap row: opens Transaction Detail Bottom Sheet
- [ ] Loading: skeleton rows in `#EAE3F0`
- [ ] Empty state: illustration + "No transactions found" + "Clear filters" button if filters active

---

## Step 11: Profile Tab

### 11a. Profile Screen
- [ ] Header: title "Profile" 20px weight 500 `#1C0F2E`
- [ ] User card (white card, border-radius 12px, padding 16px):
  - **Guest users:** User icon 64px bg `#EDE0F5` `#3D1152`, name "Guest", "Sign in to sync your data" 13px `#FF6B2B` with ChevronRight → Login
  - **Signed-in users:** Circle avatar 64px from Google photo, fallback initials bg `#EDE0F5` text `#3D1152`
  - Display name 16px weight 500 `#1C0F2E`, email 13px `#8C7A9B`
- [ ] Preferences section: label "Preferences" 12px weight 500 `#8C7A9B`
  - White card with row: Globe icon `#8C7A9B`, "Default Currency" `#1C0F2E`, current value e.g. "USD" `#3D1152`, ChevronRight `#8C7A9B`
- [ ] Account section: label "Account" 12px weight 500 `#8C7A9B`
  - **Guest:** LogIn icon `#3D1152`, "Sign In" 14px `#3D1152` → Login screen
  - **Signed-in:** LogOut icon `#C13333`, "Sign Out" 14px `#C13333` → confirm dialog
- [ ] Footer: "MoneyTracker v1.0.0" 11px `#8C7A9B` centered at bottom

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

## Verification

Before marking Phase 1 complete, verify each:

- [ ] Google OAuth login works (login screen → dashboard)
- [ ] Splash screen auto-redirects correctly (with/without session)
- [ ] "Continue as Guest" works — app usable without sign-in, data stored locally
- [ ] Guest user sees "Sign in to sync" on Profile, can sign in to migrate data
- [ ] Can create, edit, delete transactions
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

*Created: April 2026*
*Updated: April 2026 — merged design draft: guest login, balance-first dashboard, merchant-style transaction rows. Aligned with PRD v1.3 + StitchBrief v1.2*
*For: MoneyTracker App Phase 1 Implementation*
