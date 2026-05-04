# MoneyTracker — UI Design Brief
**For use with Google Stitch**
Version 1.2 | April 2026 | Aligned with PRD v1.3

---

## App Overview

MoneyTracker is a personal finance Android app for tracking income and expenses. Users manually enter transactions, categorize them, and view a monthly summary dashboard. Built with React Native + Expo.

- **Platform:** Android only
- **Navigation:** 5-tab bottom navigation
- **Mode:** Light mode only — no dark mode, ever
- **Icon set:** Lucide (lucide-react-native)
- **Font:** System default sans-serif

---

## Design System

### Color Palette — Plum + Tangerine

The app uses a warm parchment background (not pure white), deep plum as the primary brand color, and tangerine orange as a secondary accent. This combination is intentionally distinct from typical finance apps which default to blue. No dark mode.

#### Core Colors

| Token | Hex | Usage |
|---|---|---|
| Plum (primary) | `#3D1152` | Primary buttons, active tab, chips, headings, active states |
| Tangerine (accent) | `#FF6B2B` | Save button highlight, FAB icon, links, key CTAs |
| Parchment (background) | `#FAF7F5` | App background — warm off-white, NOT pure white |
| White (surface) | `#FFFFFF` | Card surfaces, bottom sheets, input backgrounds |
| Plum tint | `#EDE0F5` | Category icon backgrounds, selected fills, badges, chips |
| Orange tint | `#FFF0E8` | Tangerine accent backgrounds |
| Text primary | `#1C0F2E` | Headings, amounts, labels — near-black with purple undertone |
| Mauve (secondary) | `#8C7A9B` | Subtitles, hints, placeholders, secondary labels |
| Border | `#EAE3F0` | All borders, dividers, input outlines |

#### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| Income green | `#1A7A4A` | Income amounts, income card, income badges |
| Income tint | `#E6F5EE` | Income card background, income chip background |
| Expense red | `#C13333` | Expense amounts, expense card, delete actions |
| Expense tint | `#FCEAEA` | Expense card background, expense chip background |

### Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| Screen title | 20px | 500 medium | `#1C0F2E` |
| Section heading | 14px | 500 medium | `#1C0F2E` |
| Body / row labels | 14px | 400 regular | `#1C0F2E` |
| Secondary / hints | 12px | 400 regular | `#8C7A9B` |
| Amount large (Add screen) | 36–48px | 500 medium | Context: income/expense/primary |
| Amount (list row) | 14px | 500 medium | `#1A7A4A` income or `#C13333` expense |
| Caption / version | 11px | 400 regular | `#8C7A9B` |
| Button label | 14px | 500 medium | `#FFFFFF` white or `#3D1152` plum |

### Component Rules
- **Cards:** white bg, 0.5px border `#EAE3F0`, border-radius 12px, padding 16px
- **Primary button:** bg `#3D1152`, white text, border-radius 10px, full width for main actions
- **Accent:** tangerine `#FF6B2B` on save button text/highlight, FAB icon, key CTAs only — use sparingly
- **Category icon avatar:** colored circle bg, Lucide icon centered inside
- **Income amounts:** always `+` prefix, color `#1A7A4A`
- **Expense amounts:** always `−` prefix, color `#C13333`
- **Balance:** color `#3D1152`, turns `#C13333` if value is negative
- **Active tab:** `#3D1152` filled indicator dot/square
- **Chips / badges:** bg `#EDE0F5`, text `#3D1152`
- **Delete / destructive:** `#C13333` text + border only, never a filled red button
- **Bottom sheets:** white surface, 18px top radius, drag handle bar centered at top
- **Loading state:** skeleton bars in `#EAE3F0`, not spinners
- **Empty states:** simple illustration + mauve text + optional plum CTA button
- **Toast:** bottom of screen, auto-dismiss 3s — success `#1A7A4A`, error `#C13333`

### Category Icon Colors (Pre-seeded)

| Category | Lucide Icon | Circle bg | Icon color |
|---|---|---|---|
| Food & Drink | UtensilsCrossed | `#FCEAEA` | `#C13333` |
| Transport | Car | `#E6F5EE` | `#1A7A4A` |
| Shopping | ShoppingCart | `#FFF0E8` | `#FF6B2B` |
| Health | Heart | `#F5E6F0` | `#B84080` |
| Entertainment | Tv | `#EDE0F5` | `#3D1152` |
| Bills & Utilities | Receipt | `#F0EDF5` | `#8C7A9B` |
| Income | Wallet | `#E6F5EE` | `#1A7A4A` |
| Other | MoreHorizontal | `#F0EDF5` | `#8C7A9B` |

---

## Screen 1 — Splash

**Purpose:** Initial load screen shown while app checks for existing auth session.

**Layout:** Full screen, centered vertically and horizontally. Background `#FAF7F5`.

**Elements:**
- App logo — centered, large (80–100px)
- App name "MoneyTracker" — below logo, 24px, weight 500, color `#3D1152`
- Tagline — "Track smart, spend wise", 14px, color `#8C7A9B`
- Loading indicator — small circular spinner, color `#3D1152`, below tagline

**Behavior:**
- Auto-navigates to Login if no session found
- Auto-navigates to Dashboard if valid session exists

---

## Screen 2 — Login

**Purpose:** Single entry point. Google OAuth only, no email/password.

**Layout:** Full screen, background `#FAF7F5`. Top 45% branding, center auth, bottom legal.

**Elements:**

*Branding area (top):*
- App logo — centered
- App name "MoneyTracker" — 28px, weight 500, `#3D1152`
- Tagline — 14px, `#8C7A9B`

*Auth area (center):*
- Heading: "Welcome back" — 20px, weight 500, `#1C0F2E`
- Subtitle: "Sign in to continue tracking your finances" — 14px, `#8C7A9B`
- Google Sign In button — white bg, 0.5px border `#EAE3F0`, border-radius 10px, full width (max 320px), padding 14px
  - Left: Google logo SVG (standard Google colors, 20px)
  - Center text: "Continue with Google", 14px, weight 500, `#1C0F2E`
- Loading state: spinner replaces text while OAuth in progress
- **Continue as Guest button** — outlined, border 0.5px `#EAE3F0`, border-radius 10px, full width (max 320px), padding 14px
  - Center text: "Continue as Guest", 14px, weight 500, `#8C7A9B`
  - No icon

*Footer (bottom):*
- "By continuing you agree to our Terms of Service and Privacy Policy" — 11px, `#8C7A9B`, centered
- "Terms of Service" and "Privacy Policy" underlined, color `#3D1152`

---

## Screen 3 — Dashboard (Home Tab)

**Purpose:** Monthly financial summary. First screen after login.

**Layout:** Background `#FAF7F5`. Scrollable content below fixed header. Bottom tab always visible.

**Elements:**

*Header:*
- Left: "Good morning," 12px `#8C7A9B`, below it "[First Name]" 18px weight 500 `#1C0F2E`
- Right: BellRing icon 22px `#8C7A9B` — placeholder, no action Phase 1

*Period chip:*
- Pill: "This Month", bg `#EDE0F5`, text `#3D1152`, 12px, padding 4px 14px, border-radius 20px
- Static — not tappable in Phase 1

*Available Balance card:*
- Full width card, bg `#3D1152`, border-radius 14px, padding 20px
- Label "AVAILABLE BALANCE" 11px weight 500 `rgba(255,255,255,0.7)` letter-spacing 0.5px
- Amount 36px weight 500 `#FFFFFF` with currency symbol (e.g. "$1,250.00")
- Bottom left: Income icon TrendingUp `#1A7A4A` + "Income" label + amount in white
- Bottom right: Expense icon TrendingDown `#C13333` + "Expenses" label + amount in white
- Layout: balance amount centered, income/expense as a row at the bottom of the card

*Spending by Category section:*
- Section header row: "Spending by Category" 14px weight 500 `#1C0F2E` left, "See all" 12px `#FF6B2B` right
- Up to 5 category rows
- Each row: colored circle avatar 32px with Lucide icon, category name 13px `#1C0F2E`, amount 13px weight 500 right-aligned
- Thin progress bar below full row: track bg `#EAE3F0`, fill = category icon color, height 3px, border-radius 2px
- Empty state: "No expenses this month" centered `#8C7A9B`

*Recent Transactions section:*
- Section header: "Recent Transactions" 14px weight 500 `#1C0F2E` left, "See all" 12px `#FF6B2B` right
- Last 5 transactions
- Each row:
  - Left: colored circle avatar 36px with Lucide category icon
  - Center: name/merchant 13px weight 500 `#1C0F2E` (e.g. "Osteria Gia" or transaction note)
  - Right: amount 13px weight 500 — `#C13333` with `−` prefix for expense, `#1A7A4A` with `+` prefix for income. Time 11px `#8C7A9B` below amount (e.g. "Today, 19:30"). Date 11px `#8C7A9B` below time if different day (e.g. "Oct 24, 14:15").
- Empty state: illustration + "No transactions yet" + "Add Transaction" button in `#3D1152`

---

## Screen 4 — Transaction List (Transactions Tab)

**Purpose:** Browse, search, and filter full transaction history.

**Layout:** Background `#FAF7F5`. Fixed header + fixed search bar. Scrollable list below.

**Elements:**

*Header:*
- Title "Transactions" 20px weight 500 `#1C0F2E`
- Right: SlidersHorizontal icon 22px `#8C7A9B` — tap opens Filter Bottom Sheet
- Filter icon shows filled tangerine `#FF6B2B` dot badge when any filter is active

*Search bar:*
- Full width input, bg white, border 0.5px `#EAE3F0`, border-radius 10px, padding 10px 14px
- Left: Search icon 16px `#8C7A9B`
- Placeholder: "Search transactions..." `#8C7A9B`
- Right: X (clear) button when text entered, color `#8C7A9B`

*Active filter chips (shown only when filters applied):*
- Horizontal scrollable row below search
- Each chip: bg `#EDE0F5`, text `#3D1152`, 12px, border-radius 20px, padding 4px 10px
- Each chip has small X on right to remove that individual filter

*Transaction list:*
- Grouped by date with sticky date headers: "Today", "Yesterday", then "Mon, 12 Jan 2026"
- Date header: 12px weight 500 `#8C7A9B`, bg `#FAF7F5`
- Each row:
  - Left: colored circle avatar 40px with Lucide category icon
  - Center: name/merchant 14px weight 500 `#1C0F2E` (e.g. "Osteria Gia" or transaction note)
  - Right: amount 14px weight 500 (red/green), time 11px `#8C7A9B` below (e.g. "Today, 19:30"), date 11px `#8C7A9B` below time if different day
- Row separator: 0.5px border `#EAE3F0`
- Swipe left on row: reveals red Delete button
- Tap row: opens Transaction Detail Bottom Sheet
- Loading: skeleton rows in `#EAE3F0` while fetching
- Empty state: illustration + "No transactions found" + "Clear filters" button if filters active

---

## Screen 5 — Add / Edit Transaction (Full Screen)

**Purpose:** Full screen form for creating or editing a transaction. Most frequently used screen.

**Layout:** Background `#FAF7F5`. Header at top. Large amount area. Type toggle. Form fields. Save button pinned at bottom.

**Elements:**

*Header:*
- Left: ChevronLeft icon 22px `#1C0F2E` — back
- Center: "Add Transaction" or "Edit Transaction" 16px weight 500 `#1C0F2E`
- Right: Trash2 icon 20px `#C13333` — visible in Edit mode only, tap opens confirm dialog

*Amount area (top, prominent):*
- Currency symbol left — 24px `#8C7A9B`
- Amount value — 48px weight 500 `#1C0F2E`
- Blinking cursor — 3px wide, color `#FF6B2B`, animated blink
- Placeholder "0.00" in `#8C7A9B` when empty
- Numeric keyboard auto-opens on screen load

*Type toggle:*
- Pill container: bg `#EAE3F0`, border-radius 24px, padding 3px
- Two options: "Expense" and "Income"
- Expense active: bg `#C13333`, text white
- Income active: bg `#1A7A4A`, text white
- Inactive: transparent bg, text `#8C7A9B`

*Form fields (vertical list):*
- Each row: left icon (20px in colored circle 28px), label 14px `#8C7A9B`, value right 14px weight 500 `#1C0F2E`, ChevronRight 16px `#8C7A9B`
- Row separator: 0.5px border `#EAE3F0`
- **Category row:** icon circle bg `#EDE0F5`, shows selected category icon + name, tap → Category Picker Screen
- **Date row:** CalendarDays icon, shows date e.g. "Today" or "Mon, 17 Mar 2026", tap → native date picker
- **Currency row:** Globe icon, shows currency code e.g. "USD", tap → currency selector
- **Note row:** FileText icon, multiline text input, placeholder "Add a note (optional)" `#8C7A9B`, no chevron

*Save button (pinned bottom):*
- Full width, bg `#3D1152`, text white weight 500
- Button text: "Save Transaction" with "Transaction" word in tangerine `#FF6B2B`
- Disabled state: bg `#EAE3F0`, text `#8C7A9B` — when amount is 0 or no category selected
- Loading state: spinner in button while saving
- Pinned with safe area padding

---

## Screen 5B — Category Picker (Pushed from Add Transaction)

**Purpose:** Full screen to select a category for the current transaction.

**Elements:**
- Header: back arrow + "Select Category" title
- Section header "Default Categories" — 12px weight 500 `#8C7A9B`
- Grid 3 columns: each cell = white card, colored circle avatar 40px, category name 12px `#1C0F2E` below
- Selected state: card border 2px `#3D1152`, checkmark overlay top-right in `#3D1152`
- Section header "My Categories"
- Same grid for custom categories
- Last cell: dashed border, Plus icon, "Add New" label `#8C7A9B` — tap → Category Form Bottom Sheet

---

## Screen 6 — Categories Tab

**Purpose:** View default categories and manage custom categories.

**Layout:** Background `#FAF7F5`. Header with title and add button. Two sections in scrollable content.

**Elements:**

*Header:*
- Title "Categories" 20px weight 500 `#1C0F2E`
- Right: Plus icon 22px `#3D1152` — tap opens Category Form Bottom Sheet

*Default Categories section:*
- Section label "Default Categories" 12px weight 500 `#8C7A9B`, count badge e.g. "8" in `#EDE0F5` bg `#3D1152` text
- 3-column grid of category cards: white bg, border 0.5px `#EAE3F0`, border-radius 12px, padding 14px
  - Colored circle avatar 40px centered with Lucide icon
  - Category name 12px `#1C0F2E` centered below
- No edit/delete affordance

*My Categories section:*
- Section label "My Categories" with count badge
- Same card grid layout
- Each custom category card has small PencilLine icon 12px `#8C7A9B` bottom-right corner
- Tap card: opens Category Form Bottom Sheet prefilled
- "Add Category" card at end: dashed border `#EAE3F0`, Plus icon 20px `#8C7A9B`, "Add Category" 12px `#8C7A9B`
- Empty state: "No custom categories yet" `#8C7A9B` + "Add your first" button

---

## Screen 7 — Category Form (Bottom Sheet)

**Purpose:** Add a new custom category or edit an existing one.

**Layout:** Bottom sheet overlay, white bg `#FFFFFF`, border-radius 18px 18px 0 0. Drag handle at top.

**Elements:**

*Handle and title:*
- Drag handle: 32px wide, 4px tall, bg `#EAE3F0`, border-radius 2px, centered, margin-top 12px
- Title: "New Category" or "Edit Category" — 16px weight 500 `#1C0F2E`

*Form fields:*
- **Name input:** label "Name" 12px `#8C7A9B` above, full width text input, border 0.5px `#EAE3F0`, border-radius 8px, padding 12px, autofocus
- **Icon picker:** label "Icon" 12px `#8C7A9B`, horizontally scrollable grid of Lucide icons (min 30 options)
  - Each icon cell: 44px circle
  - Unselected: bg `#FAF7F5`, icon `#8C7A9B`
  - Selected: bg `#EDE0F5`, border 1.5px `#3D1152`, icon `#3D1152`
- **Color picker:** label "Color" 12px `#8C7A9B`, row of 10 color swatches (circles 28px each)
  - Suggested colors: `#C13333`, `#FF6B2B`, `#1A7A4A`, `#3D1152`, `#8C7A9B`, `#2E5FA3`, `#B84080`, `#C17F24`, `#1A7A7A`, `#555555`
  - Selected swatch: white checkmark in center

*Buttons:*
- Edit mode only: "Delete Category" full width, `#C13333` text, 0.5px `#C13333` border, above main buttons
- Two buttons side by side: "Cancel" (outlined `#3D1152`) and "Save" (filled bg `#3D1152`, white text)

---

## Screen 8 — Transaction Detail (Bottom Sheet)

**Purpose:** View full transaction details. Opened by tapping any transaction row.

**Layout:** Bottom sheet on top of current screen. White surface, border-radius 18px 18px 0 0. Non-scrollable.

**Elements:**

*Handle and icon:*
- Drag handle: same style as Category Form
- Category icon circle — 52px centered, colored bg, Lucide icon 24px inside
- Category name — 13px `#8C7A9B` centered below icon

*Amount and badge:*
- Amount — 32px weight 500 centered, `#C13333` for expense, `#1A7A4A` for income, includes currency symbol and prefix
- Type badge centered below amount:
  - Expense: bg `#FCEAEA`, text `#C13333`, "Expense", border-radius 20px, padding 3px 12px, 12px
  - Income: bg `#E6F5EE`, text `#1A7A4A`, "Income"

*Divider:* full width 0.5px border `#EAE3F0`

*Detail rows (label left, value right):*
- Each row: label 13px `#8C7A9B`, value 13px weight 500 `#1C0F2E`
- **Date:** full date e.g. "Monday, 17 March 2026"
- **Time:** e.g. "14:30"
- **Note:** full note text, or "—" if empty
- **Source:** "Manual entry" or "Split bill: [title]"

*Action buttons:*
- Edit button — full width, outlined border 0.5px `#3D1152`, text `#3D1152`, PencilLine icon left — navigates to Edit Transaction screen
- Delete button — full width, outlined border 0.5px `#C13333`, text `#C13333`, Trash2 icon left — opens confirm dialog
- Gap 8px between buttons

---

## Screen 9 — Filter Bottom Sheet

**Purpose:** Filter the Transaction List by type, category, and date range.

**Layout:** Bottom sheet, white bg, ~60% screen height. Handle bar at top. Scrollable content. Apply button pinned at bottom.

**Elements:**

*Header row:*
- "Filter Transactions" 16px weight 500 `#1C0F2E` left
- "Reset" text button right — 14px `#FF6B2B` — clears all filters

*Type filter:*
- Label "Type" 12px weight 500 `#8C7A9B`
- 3 toggle chips: "All", "Income", "Expense" — single select
- Active: bg `#3D1152`, text white
- Inactive: bg `#FAF7F5`, border 0.5px `#EAE3F0`, text `#8C7A9B`

*Category filter:*
- Label "Category" 12px weight 500 `#8C7A9B`
- Scrollable grid of category chips (icon circle + name) — multiselect
- Selected: bg `#EDE0F5`, border 1px `#3D1152`, text `#3D1152`
- Unselected: bg `#FAF7F5`, border 0.5px `#EAE3F0`, text `#8C7A9B`

*Date range:*
- Label "Date Range" 12px weight 500 `#8C7A9B`
- Two tappable fields side by side: "From" and "To"
- Each field: white bg, border 0.5px `#EAE3F0`, border-radius 8px, padding 10px 12px, CalendarDays icon left
- Placeholder: "Start date" / "End date" in `#8C7A9B`
- Tap opens native Android date picker

*Apply button (pinned bottom):*
- Full width, bg `#3D1152`, white text, border-radius 10px
- Label: "Apply Filters" when no active filters, "Apply (N filters)" when filters selected

---

## Screen 10 — Profile Tab

**Purpose:** User account info and app preferences.

**Layout:** Background `#FAF7F5`. Header, user card, settings sections.

**Elements:**

*Header:*
- Title "Profile" 20px weight 500 `#1C0F2E`

*User card (white card, border-radius 12px, padding 16px):*
- **Guest users:** User icon placeholder 64px, bg `#EDE0F5`, icon `#3D1152`. Display name "Guest". Below: "Sign in to sync your data" 13px `#FF6B2B` with ChevronRight → navigates to Login
- **Signed-in users:** Circle avatar 64px — from Google account photo, fallback to initials circle bg `#EDE0F5` text `#3D1152`
- Display name — 16px weight 500 `#1C0F2E`
- Email address — 13px `#8C7A9B`

*Preferences section:*
- Section label "Preferences" 12px weight 500 `#8C7A9B`
- White card with rows
- Row: Globe icon `#8C7A9B`, "Default Currency" `#1C0F2E`, current value right e.g. "USD" `#3D1152`, ChevronRight `#8C7A9B` — tap opens currency picker

*Account section:*
- Section label "Account" 12px weight 500 `#8C7A9B`
- White card
- **Guest users:** Row: LogIn icon `#3D1152`, "Sign In" 14px `#3D1152` — tap navigates to Login screen
- **Signed-in users:** Row: LogOut icon `#C13333`, "Sign Out" 14px `#C13333` — tap opens confirm dialog: "Are you sure you want to sign out?" with Cancel + Sign Out buttons

*Footer:*
- "MoneyTracker v1.0.0" — 11px `#8C7A9B` centered at bottom

---

## Global Components

### Bottom Tab Bar
- 5 tabs: Home (House icon), Transactions (LayoutList icon), Add (CirclePlus icon — center), Categories (Tag icon), Profile (User icon)
- Background white, top border 0.5px `#EAE3F0`
- Active tab: icon + label color `#3D1152`
- Inactive tab: icon + label color `#8C7A9B`
- Add tab (center): icon color `#FF6B2B`, slightly larger 28px, no label
- Label below each icon except Add: 11px

### Confirm Dialog
- Modal overlay with semi-transparent dark backdrop
- White card centered, border-radius 14px, padding 20px
- Title 16px weight 500 `#1C0F2E`
- Description 14px `#8C7A9B`
- Two buttons side by side: "Cancel" outlined `#3D1152`, "Confirm" filled (destructive: bg `#C13333`, white text)

### Amount Display Rules
- Always show currency symbol before amount
- Expense: `−` prefix, color `#C13333`
- Income: `+` prefix, color `#1A7A4A`
- Balance: no prefix, color `#3D1152`, turns `#C13333` if negative
- Large amounts on Add screen: no prefix — type toggle conveys direction

### Empty States
- Every list has an empty state: simple illustration + heading `#1C0F2E` + optional subtext `#8C7A9B` + optional CTA button in `#3D1152`

### Loading States
- Skeleton loaders: gray animated bars in `#EAE3F0`, not spinners
- Used for all list screens while data loads

### Error States
- Inline error message with retry button
- Not full screen takeover

### Toast Notifications
- Bottom of screen, auto-dismiss after 3 seconds
- Success: bg `#1A7A4A`, white text
- Error: bg `#C13333`, white text

---

*End of Brief — MoneyTracker UI Design Brief v1.2 — Aligned with PRD v1.3 — For use with Google Stitch*
