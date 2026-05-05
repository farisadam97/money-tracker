# MoneyTracker — Product Requirements Document

**Version 1.3 | March 2026**
Personal Finance Tracker with OCR Split Bill & AI Chat Agent

---

## 1. Product Overview

MoneyTracker is a personal finance mobile application for Android with a companion web dashboard. It enables users to track income and expenses, split bills using OCR receipt scanning, and query their transaction history using natural language AI chat.

### Target Users
- Individual users who want to manage personal finances
- Users who frequently split bills with friends or colleagues
- Users who want AI-powered insights from their spending history

### Platforms
- Android mobile app (React Native + Expo)
- Web dashboard (Vite + React)
- Landing page (Astro)

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile | React Native + Expo | Android only, Play Store publish |
| Web Dashboard | Vite + React + TanStack Query + TanStack Router + shadcn/ui | SPA |
| Landing Page | Astro | Static, SEO optimized |
| Backend | FastAPI (Python) | REST API |
| Database | Supabase (PostgreSQL) | Free tier, cloud hosted |
| Auth | Supabase Auth + Google OAuth | JWT based |
| Storage | Supabase Storage | Receipt images |
| OCR | Google MLKit (offline) / Qwen GLM API | Fallback to API if needed |
| AI Chat | Qwen/GLM via Alibaba Cloud | Multi-tool agent, Text-to-SQL |
| Edge Functions | Supabase Edge Functions (TypeScript/Deno) | AI chat agent handler |
| Analytics | PostHog Cloud | Free tier |
| Monitoring | Sentry | Error tracking, free tier |
| Hosting | Coolify on Alibaba VPS | FastAPI containers |
| Frontend Hosting | Cloudflare Pages | Dashboard + Landing page |
| CI/CD | GitHub Actions | Auto deploy on push |
| Domain & DNS | Cloudflare Registrar | SSL automatic |
| Icons | Lucide (lucide-react-native + lucide-react) | Consistent cross-platform |

### Domain Structure
```
yourapp.com          → Astro landing page (Cloudflare Pages)
app.yourapp.com      → Vite web dashboard (Cloudflare Pages)
api.yourapp.com      → FastAPI backend (Coolify VPS)
```

---

## 3. Database Schema

### auth.users
Managed entirely by Supabase Auth. All other tables reference `user_id` from this table.

### categories

| Column | Type | Description |
|---|---|---|
| id | uuid PK | Primary key |
| user_id | uuid FK nullable | NULL = master/global, user_id = custom per user |
| name | text | Category name e.g. Food, Transport |
| icon | text | Lucide icon name e.g. UtensilsCrossed |
| color | text | Hex color code |
| is_active | boolean | Soft delete flag |
| created_at | timestamptz | Creation timestamp |

**Rules:**
- `user_id = NULL` → master pre-seeded category, visible to all users, read-only
- `user_id = X` → custom category, only visible to that user, full CRUD access
- Query: `WHERE user_id = $current_user OR user_id IS NULL`

### transactions

| Column | Type | Description |
|---|---|---|
| id | uuid PK | Primary key |
| user_id | uuid FK | References auth.users |
| amount | numeric | Transaction amount |
| currency | text | Default USD |
| category_id | uuid FK | References categories |
| type | text | income or expense |
| note | text nullable | Optional description |
| date | date | Transaction date |
| source | text | manual or split_bill |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### split_bills

| Column | Type | Description |
|---|---|---|
| id | uuid PK | Primary key |
| created_by | uuid FK | References auth.users |
| title | text | e.g. Dinner at Restaurant X |
| total_amount | numeric | Total bill amount |
| receipt_image_url | text | Stored in Supabase Storage |
| ocr_raw_data | jsonb | Raw OCR output for debugging |
| date | date | Bill date |
| created_at | timestamptz | Creation timestamp |

### split_bill_items

| Column | Type | Description |
|---|---|---|
| id | uuid PK | Primary key |
| split_bill_id | uuid FK | References split_bills |
| name | text | Item name e.g. Nasi Goreng |
| amount | numeric | Item price |
| quantity | integer | Item quantity |

### split_bill_assignments

| Column | Type | Description |
|---|---|---|
| id | uuid PK | Primary key |
| split_bill_id | uuid FK | References split_bills |
| item_id | uuid FK | References split_bill_items |
| person_name | text | Free text, no app account required |
| transaction_id | uuid FK nullable | NULL until recorded to tracker |
| amount | numeric | Assigned amount for this person |

### chat_sessions *(added Phase 4)*

| Column | Type | Description |
|---|---|---|
| id | uuid PK | Primary key |
| user_id | uuid FK | References auth.users |
| messages_json | jsonb | Full message history array |
| created_at | timestamptz | Session creation timestamp |
| updated_at | timestamptz | Last message timestamp |

### user_agent_prefs *(added Phase 4)*

| Column | Type | Description |
|---|---|---|
| user_id | uuid PK FK | References auth.users — one row per user |
| default_currency | text | User's preferred currency |
| common_categories | jsonb | Most used category IDs + names |
| spending_patterns | jsonb | Derived patterns e.g. avg monthly food spend |
| updated_at | timestamptz | Last updated timestamp |

---

## 4. Build Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | RN mobile app + Supabase, manual transaction entry + categories | **Start Here** |
| 2 | Vite web dashboard + FastAPI backend + sync | After Phase 1 |
| 3 | OCR + split bill feature | After Phase 2 |
| 4 | AI Chat Agent (multi-tool, memory, proactive insights) | After Phase 3 |
| 5 | Landing page + Play Store publish | After Phase 4 |
| 6 | Budgets feature (optional) | Future |

> **Key rule: Do not start Phase 2 until Phase 1 is fully working.**

---

## 5. Phase 1 — Mobile App + Manual Tracker

### 5.1 Goals
- Working Android app published via Expo
- Google OAuth login via Supabase
- Full transaction CRUD (income and expense)
- Category management (master + custom)
- Transaction list with search and filter
- Basic summary dashboard (total income, expense, balance — this month only)

### 5.2 Screens & Navigation

#### Auth Flow
- **Splash Screen** — app logo, auto-redirect if session exists
- **Login Screen** — Google Sign In button via Supabase OAuth

#### Main App — Bottom Tab Navigation (5 tabs)

| Tab | Screen | Type | Description |
|---|---|---|---|
| 1 — Home | Dashboard | Screen | Summary cards: Income, Expense, Balance (this month). Spending by category list. Recent 5 transactions. Tap transaction → Bottom Sheet Detail. |
| 2 — Transactions | Transaction List | Screen | Full list with search bar, filter by type/category/date range. Infinite scroll. Tap item → Bottom Sheet Detail. |
| 3 — Add (FAB) | Add Transaction | Full Screen | Dedicated screen: large amount input, income/expense toggle, category picker grid, date picker, currency selector, note field, save button. |
| 4 — Categories | Category List | Screen | Master categories section (view only). My categories section (CRUD). Add button → Bottom Sheet Form. |
| 5 — Profile | Profile | Screen | User avatar, name, email. Default currency selector. Logout button. App version. |

#### Overlay Screens

| Screen | Trigger | Contents |
|---|---|---|
| Transaction Bottom Sheet | Tap any transaction row | Full detail view. Edit button → Add Transaction Screen prefilled. Delete button → confirm dialog. |
| Category Bottom Sheet Form | Tap Add in Categories tab | Name input, Lucide icon picker grid, color picker. Save / Cancel. |
| Transaction Filter Bottom Sheet | Tap filter icon in Transaction List | Filter by type, category multiselect, date range. Apply / Reset. |

#### Full Screen Map
```
Splash → Login → Main App (Bottom Tabs)
Tab: Home → Transaction Bottom Sheet (edit → Add Transaction Screen)
Tab: Transactions → Transaction Bottom Sheet → Filter Bottom Sheet
Tab: Add (FAB) → Add Transaction Full Screen
Tab: Categories → Category Bottom Sheet Form
Tab: Profile → (no sub-screens)
```

### 5.3 Screen Detail

#### Dashboard (Home Tab)
- Period: This Month — fixed for Phase 1, no selector
- 3 summary cards at top: Total Income (green), Total Expense (red), Balance (plum)
- Spending by category: list with category icon, name, amount, percentage bar
- Recent transactions: last 5, each row shows icon, category, note, amount, date
- Tap any transaction row opens Transaction Bottom Sheet

#### Transaction List (Transactions Tab)
- Search bar at top: search by note text
- Filter bar below search: active filters shown as chips, tap to open Filter Bottom Sheet
- Grouped by date (Today, Yesterday, then date headers)
- Each row: colored circle avatar with Lucide category icon, category name, note preview, amount (red/green), date
- Infinite scroll with loading indicator
- Empty state illustration when no transactions

#### Add Transaction (FAB Full Screen)
- Large amount input at top with currency symbol — numeric keyboard auto-opens
- Income / Expense toggle below amount
- Category picker: grid of icons with names, scrollable
- Date picker: default today, tappable
- Currency selector: dropdown, default from profile preference
- Note: optional text input
- Save button at bottom — disabled until amount and category selected
- Same screen used for Edit (prefilled) with Delete option in header

#### Categories Tab
- Two sections: Master Categories (read-only) and My Categories (editable)
- Master section: grid of category cards, icon + name + color, no edit/delete
- My Categories section: same grid + Add button, long press or swipe to edit/delete
- Add/Edit opens Bottom Sheet Form: name input, icon picker (Lucide grid), color picker

#### Profile Tab
- User avatar (from Google account), display name, email
- Default currency preference selector
- Logout button with confirmation dialog
- App version number at bottom

### 5.4 Libraries

| Category | Library | Why |
|---|---|---|
| Framework | Expo SDK 51+ | Managed workflow, simplest Android build and APK signing |
| Navigation | Expo Router | File-based routing, familiar for React devs, supports deep links for Phase 4 |
| Server State | TanStack Query | Fetch, cache, sync Supabase data. Handles loading/error states. |
| UI State | Zustand | Local state: active filters, selected period, user preferences |
| Database & Auth | @supabase/supabase-js | Official Supabase SDK for DB queries and auth |
| Google OAuth | expo-web-browser + expo-auth-session | Required for OAuth redirect flow on Android |
| Icons | lucide-react-native | Consistent with web dashboard, same icon names |
| Bottom Sheet | @gorhom/bottom-sheet | Best React Native bottom sheet, actively maintained |
| Date Picker | react-native-date-picker | Native feel date picker, Expo compatible |
| Forms | react-hook-form + zod | Form validation, same ecosystem as web |
| Styling | NativeWind | Tailwind syntax in React Native — familiar for React devs |
| Async Storage | @react-native-async-storage/async-storage | Persist Zustand state across sessions |
| Safe Area | react-native-safe-area-context | Handle notch and gesture bar on Android |
| Gesture Handler | react-native-gesture-handler | Peer dep for Expo Router and bottom sheet |
| Animations | react-native-reanimated | Peer dep for bottom sheet, smooth animations |

#### Install Command
```bash
npx create-expo-app MoneyTracker --template blank-typescript
cd MoneyTracker

npx expo install expo-router @supabase/supabase-js \
  expo-web-browser expo-auth-session \
  lucide-react-native \
  @gorhom/bottom-sheet \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-safe-area-context \
  react-native-date-picker \
  @react-native-async-storage/async-storage \
  nativewind

npm install @tanstack/react-query zustand \
  react-hook-form zod @hookform/resolvers
```

#### Key Notes
- `@gorhom/bottom-sheet` requires `react-native-gesture-handler` and `react-native-reanimated` — install all three together
- `react-hook-form` works in RN but requires `Controller` wrapper for native inputs
- NativeWind requires minor setup: babel plugin + tailwind config
- Expo Router requires `main` entry point change in `package.json`

---

## 6. Phase 2 — Web Dashboard + FastAPI Backend

### 6.1 Goals
- Vite React dashboard accessible at app.yourapp.com
- FastAPI backend serving both mobile and web
- Data sync between mobile and web via API
- GitHub Actions CI/CD pipeline

### 6.2 Dashboard Screens

| Screen | Description |
|---|---|
| Login | Google OAuth via Supabase, same account as mobile |
| Dashboard | Summary charts: spending by category (pie), income vs expense over time (bar/line), balance trend |
| Transactions | Full table with search, filter, pagination. Export to CSV. |
| Categories | Manage categories same as mobile |
| Profile | User settings, preferences |

### 6.3 FastAPI Endpoints
```
POST   /auth/verify
GET    /transactions
POST   /transactions
PUT    /transactions/{id}
DELETE /transactions/{id}
GET    /categories
POST   /categories
PUT    /categories/{id}
DELETE /categories/{id}
GET    /summary
```

### 6.4 CI/CD Pipelines

| Pipeline | Trigger | Steps |
|---|---|---|
| Dashboard Deploy | Push to main (dashboard/) | npm build → Cloudflare Pages deploy |
| Landing Deploy | Push to main (landing/) | astro build → Cloudflare Pages deploy |
| Backend Deploy | Push to main (backend/) | SSH to VPS → git pull → restart container via Coolify |
| Mobile Build | Manual or tag | EAS Build → generate AAB → Play Store upload |

---

## 7. Phase 3 — OCR + Split Bill

### 7.1 Goals
- Scan receipt via camera
- OCR extracts line items automatically
- User reviews and edits OCR results
- Assign items to people by name (free text)
- User's assigned share auto-records to transaction tracker

### 7.2 Flow

| Step | Action | Notes |
|---|---|---|
| 1 | User taps Split Bill | New bottom tab or button |
| 2 | Camera opens | expo-camera |
| 3 | Photo taken, sent to OCR | MLKit offline first, Qwen/GLM API as fallback |
| 4 | OCR results shown | List of items with name and price, editable |
| 5 | User edits if needed | Fix OCR errors, add/remove items |
| 6 | User assigns items to names | Tap item, type person name. Multiple people per item supported. |
| 7 | Review totals per person | Summary screen showing each person's total |
| 8 | Tap Record My Share | Creates transaction with source = split_bill |
| 9 | Split bill saved | Accessible in split bill history |

### 7.3 OCR Strategy
- Primary: Google MLKit (offline, bundled with APK, free)
- Fallback: Qwen/GLM OCR API via Alibaba Cloud (better accuracy for complex receipts)
- Raw OCR data stored as JSON in `ocr_raw_data` column for debugging
- Receipt image stored in Supabase Storage

---

## 8. Phase 4 — AI Chat Agent

### 8.1 Overview

A conversational AI agent that lets users query their finances in natural language and receive intelligent, actionable answers. Goes beyond basic Text-to-SQL by adding multi-tool execution, persistent memory, and proactive weekly insights.

**Why this approach over basic Text-to-SQL:**
- Multi-tool agent can combine multiple queries in a single response
- Memory means the agent improves with usage, remembering user preferences
- Proactive notifications add value without user-initiated queries
- Same agent architecture scales naturally — OCR tool, budgets tool, predictions can be added in future phases

**Cost estimate:** ~$0.50–5/month depending on usage via Qwen/GLM on Alibaba Cloud.

### 8.2 Core Capabilities

| Capability | Description |
|---|---|
| Natural language queries | "How much did I spend on food this month?" → SQL → formatted answer |
| Multi-tool execution | Agent selects and chains tools: search_transactions, get_summary, create_transaction |
| Persistent memory | Remembers conversation context and user preferences across sessions |
| Proactive insights | Weekly push notifications about spending trends and anomalies |
| Suggestion chips | Pre-built query suggestions shown in UI for common questions |
| Clickable results | Transaction results render as tappable cards with deep links |
| Safe execution | SQL validation layer — SELECT-only, user-scoped, forbidden keyword filter |

### 8.3 Example Queries
- "How much did I spend on food this month?"
- "Do I have any transactions in May around $300?"
- "What is my biggest expense this year?"
- "Show me all income from last quarter"
- "Compare my spending this month vs last month"
- "Am I spending more on transport lately?"

### 8.4 Architecture

```
Mobile Chat UI (React Native)
        ↓ HTTPS + JWT
Supabase Edge Function (TypeScript/Deno)
        ↓
  ┌─────────────────────────────────┐
  │         Agent Orchestrator      │
  │  - Parse user intent            │
  │  - Select tool(s)               │
  │  - Build prompt with context    │
  │  - Call Qwen/GLM                │
  │  - Execute validated SQL        │
  │  - Format response              │
  └─────────────────────────────────┘
        ↓                    ↓
Supabase PostgreSQL    Qwen/GLM API
(execute SQL)          (Alibaba Cloud)
```

**Why Supabase Edge Function over FastAPI for the agent:**
- Runs closer to the database — lower latency for SQL execution
- Shares the same Supabase JWT auth automatically
- Keeps AI logic separate from REST API concerns in FastAPI
- FastAPI still handles all standard CRUD endpoints

### 8.5 Agent Tools

Three tools available in Phase 4.1, expandable in later sub-phases.

#### Tool 1: `search_transactions`
```typescript
// Input
{
  filters: {
    date_from?: string,       // ISO date
    date_to?: string,
    category_ids?: string[],
    type?: 'income' | 'expense',
    amount_min?: number,
    amount_max?: number,
    keyword?: string          // searches note field
  },
  limit?: number              // default 20, max 100
}

// Output
{
  transactions: Transaction[],
  total_count: number,
  total_amount: number
}
```

#### Tool 2: `get_summary`
```typescript
// Input
{
  period: 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom',
  date_from?: string,
  date_to?: string,
  group_by?: 'category' | 'type' | 'week' | 'month'
}

// Output
{
  total_income: number,
  total_expense: number,
  balance: number,
  breakdown: { label: string, amount: number, percentage: number }[]
}
```

#### Tool 3: `create_transaction` *(Phase 4.2+)*
```typescript
// Input
{
  amount: number,
  type: 'income' | 'expense',
  category_id: string,
  note?: string,
  date?: string,              // default today
  currency?: string           // default user preference
}

// Output
{
  transaction: Transaction,
  confirmation_message: string
}
```

> **Note:** `create_transaction` requires explicit user confirmation in the UI before execution. The agent proposes the transaction, user taps "Confirm", then it executes.

### 8.6 Supabase Edge Function — Technical Spec

**File:** `supabase/functions/chat-agent/index.ts`

**High-level flow:**
```typescript
Deno.serve(async (req) => {
  // 1. Verify Supabase JWT from Authorization header
  const user = await verifyJWT(req)

  // 2. Parse request body
  const { message, session_id } = await req.json()

  // 3. Load chat history from chat_sessions (last 20 messages)
  const history = await loadChatHistory(session_id, user.id)

  // 4. Load user agent preferences
  const prefs = await loadUserPrefs(user.id)

  // 5. Build system prompt with schema + user context
  const systemPrompt = buildSystemPrompt(prefs)

  // 6. Call Qwen/GLM with tools + history + new message
  const agentResponse = await callQwenWithTools(systemPrompt, history, message)

  // 7. If tool_call in response → validate → execute → call LLM again with result
  const finalResponse = await executeToolLoop(agentResponse, user.id)

  // 8. Save updated history to chat_sessions
  await saveChatHistory(session_id, user.id, message, finalResponse)

  // 9. Return formatted response
  return Response.json({
    message: finalResponse.text,
    transaction_ids: finalResponse.transaction_ids,
    suggested_actions: finalResponse.suggested_actions
  })
})
```

**System prompt structure:**
```
You are a personal finance assistant for MoneyTracker.

User context:
- Default currency: {currency}
- Common categories: {categories}
- Spending patterns: {patterns}

Database schema:
{transactions table schema}
{categories table schema}

Rules:
- Only generate SELECT queries
- Always filter by user_id = '{user_id}'
- Never use: INSERT, UPDATE, DELETE, DROP, ALTER, GRANT, TRUNCATE
- Return transaction IDs for any referenced transactions
- Keep answers concise and friendly
- Use the user's currency in all amounts
```

### 8.7 SQL Safety Validation Layer

All SQL generated by the LLM passes through a validation layer before execution. Non-negotiable.

```typescript
function validateSQL(sql: string, userId: string): ValidationResult {
  const upperSQL = sql.toUpperCase().trim()

  // Rule 1: Must start with SELECT
  if (!upperSQL.startsWith('SELECT')) {
    return { valid: false, reason: 'Only SELECT queries allowed' }
  }

  // Rule 2: Forbidden keywords
  const forbidden = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER',
    'GRANT', 'TRUNCATE', 'EXECUTE', 'EXEC', '--', ';--'
  ]
  for (const keyword of forbidden) {
    if (upperSQL.includes(keyword)) {
      return { valid: false, reason: `Forbidden keyword: ${keyword}` }
    }
  }

  // Rule 3: Must contain user_id filter
  if (!sql.includes(userId)) {
    return { valid: false, reason: 'Missing user_id scope' }
  }

  return { valid: true }
}
```

**Additional safeguards:**
- Query timeout: 5 seconds max
- Result row limit: 500 rows max regardless of query
- Rate limiting: 30 chat messages per user per hour
- All validation failures logged to Sentry

### 8.8 React Native Chat UI

**Placement:** New 6th tab "Chat" (MessageCircle icon) added to bottom navigation, or accessible via FAB on Dashboard. Final placement decided during Phase 4 UI design.

**Chat screen layout:**
```
Header: "AI Assistant"               [Clear history icon]
────────────────────────────────────────
Suggestion chips (horizontal scroll):
[This month summary] [Biggest expense] [Food spending] [Compare months]
────────────────────────────────────────
Chat messages (scrollable, newest at bottom):

  [User bubble — right aligned, bg #EDE0F5]
  "How much did I spend on food this month?"

  [Agent typing indicator — left, animated 3 dots]

  [Agent text bubble — left, white card]
  "You spent $342 on Food & Drink this month
   across 18 transactions — 28% of total expenses."

  [Transaction cards — tappable, left aligned]
  ┌──────────────────────────────┐
  │ 🍜 Food & Drink    −$24.00  │  → tap → Transaction Detail
  │ Lunch at warung    Jan 17   │
  └──────────────────────────────┘

  [Confirm action card — for create_transaction]
  ┌──────────────────────────────┐
  │ Record this transaction?     │
  │ −$24 · Food & Drink · Today  │
  │  [Cancel]      [Confirm ✓]   │
  └──────────────────────────────┘

────────────────────────────────────────
[ Type a question...              ] [↑]
```

**Message types:**

| Type | Alignment | Style |
|---|---|---|
| `user` | Right | bg `#EDE0F5`, text `#1C0F2E`, border-radius 12px 12px 2px 12px |
| `agent_text` | Left | white card, text `#1C0F2E`, border-radius 2px 12px 12px 12px |
| `agent_transactions` | Left | list of tappable transaction cards (same style as Transaction List rows) |
| `agent_confirm` | Left | white card, action title, transaction preview, Cancel + Confirm buttons |
| `agent_loading` | Left | animated 3-dot typing indicator, bg white card |
| `agent_error` | Left | error text `#C13333` + "Retry" button |

**Default suggestion chips:**
- "This month summary"
- "Biggest expense this month"
- "Food spending trend"
- "Compare this vs last month"
- "Recent transactions"

Chips update based on `user_agent_prefs.common_categories` after Phase 4.2.

### 8.9 Persistent Memory — Phase 4.2

**Chat history (`chat_sessions`):**
- Each session stored as `messages_json` array
- Format: `[{ role: 'user' | 'assistant', content: string, timestamp: string }]`
- Last 20 messages included in each LLM call as context window
- Sessions older than 30 days: `messages_json` cleared, metadata row kept

**User agent preferences (`user_agent_prefs`):**
- Updated automatically after each chat session
- `common_categories` — top 5 categories by transaction count, derived from DB
- `spending_patterns` — avg monthly spend per category, recomputed weekly
- Used to personalise system prompt and suggestion chips
- Never exposed directly to user — internal agent use only

### 8.10 Proactive Insights — Phase 4.3

**Trigger:** Supabase `pg_cron` job runs every Monday at 9:00 AM (UTC, adjust for user timezone stored in `user_agent_prefs`).

**Insight types:**

| Insight | Condition | Example notification |
|---|---|---|
| Weekly summary | Every week | "Last week: $240 spent across 12 transactions" |
| Overspend alert | Category > 120% of 4-week rolling average | "Food spending is 40% higher than usual this week" |
| Unusual transaction | Single transaction > 3× category average | "Large transport expense detected: $85 on Jan 17" |
| Positive trend | Category spend down > 20% vs previous month | "Great job — transport spending down 25% this month" |

**Delivery:** Expo push notifications via `expo-notifications`. User can disable in Profile settings.

**Cron job flow:**
```
pg_cron triggers weekly → Supabase Edge Function
→ Query each user's transactions from past 7 days
→ Compare against 4-week averages in user_agent_prefs
→ Generate insight text via Qwen/GLM
→ Send push notification via Expo Push API
→ Update user_agent_prefs.spending_patterns
```

### 8.11 Implementation Sub-phases

| Sub-phase | Scope |
|---|---|
| 4.1 | Core chat: 3 tools (search + summary + create), SQL generation, basic UI, safety layer |
| 4.2 | Memory: chat history persistence, user_agent_prefs, personalised suggestions |
| 4.3 | Proactive: weekly cron insights, push notifications, spending pattern detection |

### 8.12 Future Agent Tools (Post Phase 4)
- `scan_receipt` — OCR tool bridging Phase 3 + Phase 4 agent
- `set_budget` — budget tool when Phase 6 is built
- `predict_spending` — ML-based forecast from spending history
- `export_data` — generate CSV/PDF from natural language request

---

## 9. Phase 5 — Landing Page + Play Store

### 9.1 Landing Page (Astro)
- Hero: app name, tagline, app screenshots
- Features section: tracker, split bill, AI chat
- Download button: Google Play Store link
- Dashboard login link
- SEO optimized static HTML
- Deployed to Cloudflare Pages at yourapp.com

### 9.2 Play Store Requirements
- App signing keystore (generate once, keep safe — never lose this)
- App icon: 512×512 PNG
- Feature graphic: 1024×500 PNG
- Screenshots: minimum 2, recommended 4–8
- Short description: 80 chars max
- Full description: 4000 chars max
- Privacy policy URL (required, host on landing page)
- Content rating questionnaire
- EAS Build (Expo Application Services) for APK/AAB generation

---

## 10. Phase 6 — Budgets (Optional, Future)

Deferred to future phase. Not in initial scope.

### 10.1 Planned Features
- Set spending limit per category per period (monthly/weekly)
- Progress bar showing spent vs budget
- Push notification when approaching or exceeding budget
- Budget summary on dashboard

### 10.2 Schema Addition
- New table: `budgets` (id, user_id, category_id, amount, period, created_at)
- No changes to existing tables required

---

## 11. Infrastructure & DevOps

### 11.1 Current VPS Constraint

Current Alibaba Cloud VPS is 1GB RAM / 1 CPU. Only FastAPI + lightweight Postgres can run here. All other services use cloud free tiers.

| Service | Current | Future (upgraded VPS) |
|---|---|---|
| Database | Supabase Cloud (free tier) | Self-hosted Supabase on Coolify |
| Analytics | PostHog Cloud (free tier) | Self-hosted PostHog on Coolify |
| Auth | Supabase Cloud | Self-hosted Supabase |
| Storage | Supabase Cloud | Self-hosted Supabase |
| Backend | Coolify VPS | Same |
| Frontend | Cloudflare Pages | Same |

### 11.2 Migration Path
- Supabase is open source — export Postgres dump, import to self-hosted
- PostHog is open source — data export available
- Upgrade VPS to minimum 4GB RAM before self-hosting either service
- Migrate only when free tier limits are actually hit

---

## 12. Design System

### 12.1 Color Palette — Plum + Tangerine

**Theme:** Light mode only. No dark mode. Warm parchment background, deep plum primary, tangerine orange accent. Intentionally distinct from typical blue finance apps.

| Role | Hex | Usage |
|---|---|---|
| Plum (primary) | `#3D1152` | Primary buttons, active tab, period chip, header accents |
| Tangerine (accent) | `#FF6B2B` | Save button highlight, FAB, links, call-to-action elements |
| Parchment (background) | `#FAF7F5` | App background — warm off-white, not pure white |
| White (surface) | `#FFFFFF` | Cards, bottom sheets, input fields |
| Plum tint | `#EDE0F5` | Category icon backgrounds, selected state fills, badges |
| Orange tint | `#FFF0E8` | Tangerine accent backgrounds, hover states |
| Income green | `#1A7A4A` | All income amounts, income summary card, income badge |
| Income green tint | `#E6F5EE` | Income card background, income chip background |
| Expense red | `#C13333` | All expense amounts, expense summary card, delete actions |
| Expense red tint | `#FCEAEA` | Expense card background, expense chip background |
| Text primary | `#1C0F2E` | Headings, amounts, labels — near-black with purple undertone |
| Text secondary (mauve) | `#8C7A9B` | Subtitles, hints, secondary labels |
| Border | `#EAE3F0` | All borders, dividers, input outlines |

### 12.2 Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| Screen title | 20px | 500 | `#1C0F2E` |
| Section heading | 14px | 500 | `#1C0F2E` |
| Body / labels | 14px | 400 | `#1C0F2E` |
| Secondary text | 12px | 400 | `#8C7A9B` |
| Amount (large) | 36–48px | 500 | Income / Expense / Text primary |
| Amount (list row) | 14px | 500 | Income green or Expense red |
| Caption / hint | 11px | 400 | `#8C7A9B` |
| Button text | 14px | 500 | `#FFFFFF` white or `#3D1152` plum |

### 12.3 Component Rules
- All cards: white background, 0.5px border `#EAE3F0`, border-radius 12px, padding 16px
- Primary button: background `#3D1152`, text white, border-radius 10px, full width for main actions
- Accent highlight: tangerine `#FF6B2B` used on save button text, FAB icon, key CTAs
- Bottom sheets: white surface, 18px top border-radius, drag handle bar
- Category icons: colored circle avatar, Lucide icon inside
- Income amounts: always `+` prefix, color `#1A7A4A`
- Expense amounts: always `−` prefix, color `#C13333`
- Balance: color `#3D1152`, turns `#C13333` if negative
- Active tab indicator: plum `#3D1152` filled square/dot
- Chips and badges: plum tint background `#EDE0F5`, plum text `#3D1152`
- Destructive actions (delete): `#C13333` text and border, never filled red button
- Empty states: simple illustration, mauve secondary text, optional plum CTA button
- Loading skeletons: `#EAE3F0` animated bars, not spinners
- Toast notifications: bottom of screen, 3 second auto-dismiss — success uses income green, error uses expense red

---

## 13. Pre-seed Master Data

### 13.1 Default Categories

| Name | Icon (Lucide) | Icon Color | bg |
|---|---|---|---|
| Food & Drink | UtensilsCrossed | `#C13333` | `#FCEAEA` |
| Transport | Car | `#1A7A4A` | `#E6F5EE` |
| Shopping | ShoppingCart | `#FF6B2B` | `#FFF0E8` |
| Health | Heart | `#B84080` | `#F5E6F0` |
| Entertainment | Tv | `#3D1152` | `#EDE0F5` |
| Bills & Utilities | Receipt | `#8C7A9B` | `#F0EDF5` |
| Income | Wallet | `#1A7A4A` | `#E6F5EE` |
| Other | MoreHorizontal | `#8C7A9B` | `#F0EDF5` |

---

## 14. Key Principles
- Build one phase at a time. Do not start Phase 2 until Phase 1 is fully working.
- Use cloud free tiers now. Migrate to self-hosted only when limits are hit.
- Keep scope tight. Every feature added increases time to completion.
- Do not over-engineer. This is a hobby project first.
- Wallets/accounts feature is intentionally deferred. Add in future if needed.
- Budgets feature is intentionally deferred to Phase 6.
- No dark mode. Light mode only for all phases.
- Color palette is locked: Plum `#3D1152` + Tangerine `#FF6B2B`. Do not deviate without updating this document.

---

*End of Document — MoneyTracker PRD v1.3 — March 2026*
