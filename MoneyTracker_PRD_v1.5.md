# MoneyTracker — Product Requirements Document

**Version 1.5 | May 2026** Personal Finance Tracker with OCR Split Bill, AI Chat Agent & Email Auto-Import

---

## Changelog

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.3 | March 2026 | Initial full PRD |
| 1.4 | May 2026 | Added Phase 2.5 (Email Auto-Import); updated tech stack; updated transactions table; updated domain structure; updated phase table; updated onboarding flow |
| 1.5 | May 2026 | Added Section 16 (Privacy & Compliance — UU PDP); added Section 17 (Supabase RLS Policy Rules); added AI data disclosure to tech stack and Phase 2.5; removed raw email snippet storage from email_import_logs (PII reduction) |

---

## 1. Product Overview

MoneyTracker is a personal finance mobile application for Android with a companion web dashboard. It enables users to track income and expenses manually or automatically via email forwarding, split bills using OCR receipt scanning, and query their transaction history using natural language AI chat.

### Target Users

- Individual users who want to manage personal finances
- Users who want transactions recorded automatically from bank/e-wallet emails
- Users who frequently split bills with friends or colleagues
- Users who want AI-powered insights from their spending history

### Platforms

- Android mobile app (React Native + Expo)
- Web dashboard (Vite + React)
- Landing page (Astro)

---

## 2. Tech Stack

| Layer | Technology | Notes |
| :---- | :---- | :---- |
| Mobile | React Native + Expo | Android only, Play Store publish |
| Web Dashboard | Vite + React + TanStack Query + TanStack Router + shadcn/ui | SPA |
| Landing Page | Astro | Static, SEO optimized |
| Backend | FastAPI (Python) | REST API |
| Database | Supabase (PostgreSQL) | Free tier, cloud hosted |
| Auth | Supabase Auth + Google OAuth | JWT based |
| Storage | Supabase Storage | Receipt images |
| OCR | Google MLKit (offline) / Qwen GLM API | Fallback to API if needed |
| AI Chat | Qwen/GLM via Z.ai | Multi-tool agent, Text-to-SQL. Current plan: Z.ai, swap when better option found. User financial data is sent to this provider — disclosed in privacy policy. |
| Email Parsing LLM | Cloudflare Workers AI (Llama 3.1 8B) | Used only for email auto-import parsing. Email body content is processed by Cloudflare's infrastructure — disclosed in privacy policy. No data retained by Cloudflare Workers AI after inference. |
| Email Routing | Cloudflare Email Routing | Catch-all on intake subdomain |
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
yourapp.com               → Astro landing page (Cloudflare Pages)
app.yourapp.com           → Vite web dashboard (Cloudflare Pages)
api.yourapp.com           → FastAPI backend (Coolify VPS)
intake.yourapp.com        → Cloudflare Email Routing (Phase 2.5)
  *@intake.yourapp.com    → catch-all → Cloudflare Worker
```

---

## 3. Database Schema

### auth.users

Managed entirely by Supabase Auth. All other tables reference `user_id` from this table.

### categories

| Column | Type | Description |
| :---- | :---- | :---- |
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
| :---- | :---- | :---- |
| id | uuid PK | Primary key |
| user_id | uuid FK | References auth.users |
| amount | numeric | Transaction amount |
| currency | text | Default IDR |
| category_id | uuid FK | References categories |
| type | text | income or expense |
| note | text nullable | Optional description |
| date | date | Transaction date |
| source | text | manual, split_bill, or email |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

**Note:** `source = 'email'` added in Phase 2.5 for auto-imported transactions.

### split_bills

| Column | Type | Description |
| :---- | :---- | :---- |
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
| :---- | :---- | :---- |
| id | uuid PK | Primary key |
| split_bill_id | uuid FK | References split_bills |
| name | text | Item name e.g. Nasi Goreng |
| amount | numeric | Item price |
| quantity | integer | Item quantity |

### split_bill_assignments

| Column | Type | Description |
| :---- | :---- | :---- |
| id | uuid PK | Primary key |
| split_bill_id | uuid FK | References split_bills |
| item_id | uuid FK | References split_bill_items |
| person_name | text | Free text, no app account required |
| transaction_id | uuid FK nullable | NULL until recorded to tracker |
| amount | numeric | Assigned amount for this person |

### user_intake_addresses *(added Phase 2.5)*

| Column | Type | Description |
| :---- | :---- | :---- |
| id | uuid PK | Primary key |
| user_id | uuid FK | References auth.users |
| intake_slug | text unique | e.g. user_abc123 — used as email prefix |
| intake_address | text | e.g. user_abc123@intake.yourapp.com |
| created_at | timestamptz | Creation timestamp |

### email_filters *(added Phase 2.5)*

| Column | Type | Description |
| :---- | :---- | :---- |
| id | uuid PK | Primary key |
| user_id | uuid FK | References auth.users |
| keyword | text | e.g. gopay, bca, mandiri |
| is_active | boolean | Soft disable without deleting |
| created_at | timestamptz | Creation timestamp |

### email_import_logs *(added Phase 2.5)*

| Column | Type | Description |
| :---- | :---- | :---- |
| id | uuid PK | Primary key |
| user_id | uuid FK | References auth.users |
| parsed_data | jsonb | Structured data extracted by LLM (amount, merchant, date, type only — no raw email content) |
| status | text | success, unclassified, or failed |
| transaction_id | uuid FK nullable | Linked transaction if successful |
| created_at | timestamptz | Creation timestamp |

**Notes:**
- Raw email body is never stored. Only the structured parsed output is logged.
- `email_import_logs` rows auto-purged after 30 days via Supabase scheduled job.
- This minimizes PII surface area in compliance with UU PDP.

### chat_sessions *(added Phase 4)*

| Column | Type | Description |
| :---- | :---- | :---- |
| id | uuid PK | Primary key |
| user_id | uuid FK | References auth.users |
| messages_json | jsonb | Full message history array |
| created_at | timestamptz | Session creation timestamp |
| updated_at | timestamptz | Last message timestamp |

### user_agent_prefs *(added Phase 4)*

| Column | Type | Description |
| :---- | :---- | :---- |
| user_id | uuid PK FK | References auth.users — one row per user |
| default_currency | text | User's preferred currency |
| common_categories | jsonb | Most used category IDs + names |
| spending_patterns | jsonb | Derived patterns e.g. avg monthly food spend |
| updated_at | timestamptz | Last updated timestamp |

---

## 4. Build Phases

| Phase | Scope | Status |
| :---- | :---- | :---- |
| 1 | RN mobile app + Supabase, manual transaction entry + categories | Start Here |
| 2 | Vite web dashboard + FastAPI backend + sync | After Phase 1 |
| 2.5 | Email auto-import via Cloudflare Email Routing + Workers AI | After Phase 2 |
| 3 | OCR + split bill feature | After Phase 2.5 |
| 4 | AI Chat Agent (multi-tool, memory, proactive insights) | After Phase 3 |
| 5 | Landing page + Play Store publish | After Phase 4 |
| 6 | Budgets feature (optional) | Future |

**Key rule: Do not start the next phase until the current phase is fully working.**

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

#### Onboarding Flow (first login only)

Shown once immediately after first successful login, before reaching the main app.

**Screen 1 — Welcome**
- App logo, "Welcome to MoneyTracker"
- Subtitle: "Track your spending automatically or manually"
- [ Get Started ] button

**Screen 2 — Auto-Import Setup (optional)**
- Heading: "Want transactions recorded automatically?"
- Subtitle: "Forward your bank or e-wallet emails and we'll do the rest."
- Shows user's unique intake address (copyable, e.g. user_abc123@intake.yourapp.com)
- Add keywords: input field + add button, shows active keyword chips (e.g. gopay, bca)
- Expandable step-by-step Gmail filter setup guide
- [ Set Up Later ] button (skips without penalty)
- [ Done ] button (proceeds to Screen 3)

**Screen 3 — Manual Entry intro**
- Heading: "You can always add transactions manually"
- Subtitle: "Tap the + button anytime to record cash or any transaction"
- [ Go to Dashboard ] button

**Note:** Auto-import setup on Screen 2 is fully optional. User can always access it later from Settings. Both methods (auto + manual) can be used simultaneously — manual entry is always available regardless of auto-import status.

#### Main App — Bottom Tab Navigation (5 tabs)

| Tab | Screen | Type | Description |
| :---- | :---- | :---- | :---- |
| 1 — Home | Dashboard | Screen | Summary cards: Income, Expense, Balance (this month). Spending by category list. Recent 5 transactions. Tap transaction → Bottom Sheet Detail. |
| 2 — Transactions | Transaction List | Screen | Full list with search bar, filter by type/category/date range. Infinite scroll. Tap item → Bottom Sheet Detail. |
| 3 — Add (FAB) | Add Transaction | Full Screen | Dedicated screen: large amount input, income/expense toggle, category picker grid, date picker, currency selector, note field, save button. |
| 4 — Categories | Category List | Screen | Master categories section (view only). My categories section (CRUD). Add button → Bottom Sheet Form. |
| 5 — Profile | Profile | Screen | User avatar, name, email. Default currency selector. Transaction Import settings. Logout button. App version. |

#### Overlay Screens

| Screen | Trigger | Contents |
| :---- | :---- | :---- |
| Transaction Bottom Sheet | Tap any transaction row | Full detail view. Edit button → Add Transaction Screen prefilled. Delete button → confirm dialog. |
| Category Bottom Sheet Form | Tap Add in Categories tab | Name input, Lucide icon picker grid, color picker. Save / Cancel. |
| Transaction Filter Bottom Sheet | Tap filter icon in Transaction List | Filter by type, category multiselect, date range. Apply / Reset. |

#### Full Screen Map

```
Splash → Login → Onboarding (first login only) → Main App (Bottom Tabs)

Tab: Home → Transaction Bottom Sheet (edit → Add Transaction Screen)
Tab: Transactions → Transaction Bottom Sheet → Filter Bottom Sheet
Tab: Add (FAB) → Add Transaction Full Screen
Tab: Categories → Category Bottom Sheet Form
Tab: Profile → Transaction Import Settings
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
- Email-imported transactions show a small email icon badge
- Unclassified email transactions show an orange warning badge — tap to edit
- Infinite scroll with loading indicator
- Empty state illustration when no transactions

#### Add Transaction (FAB Full Screen)

- Large amount input at top with currency symbol — numeric keyboard auto-opens
- Income / Expense toggle below amount
- Category picker: grid of icons with names, scrollable
- Date picker: default today, tappable
- Currency selector: dropdown, default from profile preference. **Multi-currency note (Phase 1):** transactions in foreign currencies are stored correctly but excluded from dashboard monthly totals. Dashboard shows a small footnote: "N transactions in other currencies not included." FX rate aggregation deferred to Phase 2+.
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
- Transaction Import section (see Phase 2.5 for detail)
- Logout button with confirmation dialog
- App version number at bottom

### 5.4 Libraries

| Category | Library | Why |
| :---- | :---- | :---- |
| Framework | Expo SDK 51+ | Managed workflow, simplest Android build and APK signing |
| Navigation | Expo Router | File-based routing, familiar for React devs, supports deep links for Phase 4 |
| Server State | TanStack Query | Fetch, cache, sync Supabase data. Handles loading/error states. |
| UI State | Zustand | Local state: active filters, selected period, user preferences |
| Database & Auth | @supabase/supabase-js | Official Supabase SDK for DB queries and auth |
| Secure Storage | expo-secure-store | Encrypted session token storage (Android Keystore). Required for finance app — never use AsyncStorage for auth. |
| Google OAuth | expo-web-browser + expo-auth-session | Required for OAuth redirect flow on Android |
| Icons | lucide-react-native | Consistent with web dashboard, same icon names |
| Bottom Sheet | @gorhom/bottom-sheet | Best React Native bottom sheet, actively maintained |
| Date Picker | react-native-date-picker | Native feel date picker, Expo compatible |
| Forms | react-hook-form + zod | Form validation, same ecosystem as web |
| Styling | NativeWind | Tailwind syntax in React Native — familiar for React devs |
| Async Storage | @react-native-async-storage/async-storage | Persist non-sensitive Zustand state (user prefs, filters) across sessions |
| List Rendering | @shopify/flash-list | Drop-in FlatList replacement, ~5× faster for long transaction lists |
| Offline Reads | @tanstack/query-async-storage-persister | Persists query cache to AsyncStorage so lists render offline |
| Offline Writes | @react-native-community/netinfo + custom Zustand queue | Detects reconnect, drains pending writes queue to Supabase |
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
| :---- | :---- |
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
| :---- | :---- | :---- |
| Dashboard Deploy | Push to main (dashboard/) | npm build → Cloudflare Pages deploy |
| Landing Deploy | Push to main (landing/) | astro build → Cloudflare Pages deploy |
| Backend Deploy | Push to main (backend/) | SSH to VPS → git pull → restart container via Coolify |
| Mobile Build | Manual or tag | EAS Build → generate AAB → Play Store upload |

---

## 7. Phase 2.5 — Email Auto-Import

### 7.1 Goals

- User's bank/e-wallet transaction emails automatically parsed and saved as transactions
- Zero ongoing friction after one-time Gmail filter setup
- Support multiple keyword filters per user (e.g. gopay, bca, mandiri)
- Both auto-import and manual entry available simultaneously
- Failed parses saved as unclassified transactions, user can fix manually
- No raw email content stored at any point — parsed JSON only

### 7.2 Infrastructure Setup

1. Buy domain on Cloudflare (~$10/year)
2. Enable Cloudflare Email Routing on `intake.yourapp.com`
3. Set catch-all rule: `*@intake.yourapp.com` → Cloudflare Worker
4. Deploy Cloudflare Worker (email receiver + keyword check + LLM parser)
5. Add FastAPI endpoint: `POST /email-import`

### 7.3 Full Flow

```
1. User signs up (Phase 1 or 2)
   → Backend generates unique slug (first 8 chars of uuid v4, e.g. user_abc123)
   → Saves to user_intake_addresses table
   → Intake address: user_abc123@intake.yourapp.com

2. Onboarding Screen 2 (or Settings later)
   → User sees their intake address (copyable)
   → User adds keywords: gopay, bca, mandiri, etc.
   → Step-by-step Gmail filter guide shown in-app:
       a. Gmail → Settings → See all settings → Filters and Blocked Addresses
       b. Create filter: from contains "gopay" OR subject contains "gopay"
       c. Action: Forward to user_abc123@intake.yourapp.com
       d. Confirm forwarding address (one-time Gmail verification email)
       e. Repeat for each keyword

3. Transaction email arrives (e.g. GoPay receipt)
   → Gmail matches filter → forwards to user_abc123@intake.yourapp.com
   → Cloudflare Email Routing catches it
   → Triggers Cloudflare Worker

4. Cloudflare Worker
   → Extracts "to" field → gets slug (user_abc123)
   → Looks up user in Supabase via slug
   → If user not found → discard silently
   → Extracts plain text email body
   → Checks body against user's active email_filters keywords
   → If no keyword match → discard silently
   → Calls Cloudflare Workers AI (Llama 3.1 8B) with parsing prompt
   → POSTs parsed JSON result to FastAPI: POST /email-import
   → Email body is NOT forwarded to FastAPI — only the parsed output

5. FastAPI /email-import
   → Validates internal API key
   → If LLM parse successful → save to transactions (source = "email")
   → If parse failed → retry once (re-calls Worker AI)
   → If retry also fails → save with status = "unclassified", category = "Other"
   → Log parsed_data + status to email_import_logs (no raw email stored)
   → Return 200

6. Mobile app
   → TanStack Query invalidates transactions cache on next poll
   → New transaction appears automatically
   → Unclassified transactions show orange warning badge
   → User taps unclassified → edit screen prefilled with partial data
```

### 7.4 LLM Parsing

**Model:** Cloudflare Workers AI — `@cf/meta/llama-3.1-8b-instruct`

**Why this model over cheaper options:**
- 1B parameter models are unreliable for structured JSON output with mixed-language Indonesian emails
- 8B gives consistent JSON output — critical since wrong parse = wrong transaction data
- Still within free tier (10,000 Neurons/day) at expected volume
- Cloudflare Workers AI does not retain data after inference

**Parsing prompt:**

```
You are a transaction email parser for Indonesian users.
Extract transaction details and return ONLY valid JSON, no explanation, no markdown, no backticks.
If no transaction found, return {"found": false}.

JSON format:
{
  "found": true,
  "amount": 25000,
  "currency": "IDR",
  "merchant": "Kopi Kenangan",
  "date": "2026-05-19",
  "type": "debit",
  "description": "GoPay payment"
}

Email:
---
{email_body}
---
```

**Failure handling:**
1. Parse attempt 1 → if valid JSON with `found: true` → save as transaction
2. Parse attempt 1 returns `found: false` or invalid JSON → retry once
3. Retry also fails → save as unclassified (category: Other, note: "Unclassified import — please review")

### 7.5 Cloudflare Worker (outline)

```javascript
export default {
  async email(message, env) {
    // 1. Extract recipient slug from "to" field
    const slug = message.to.split("@")[0] // "user_abc123"

    // 2. Look up user in Supabase
    const user = await getUser(slug, env.SUPABASE_URL, env.SUPABASE_KEY)
    if (!user) return

    // 3. Extract plain text body
    const rawEmail = await new Response(message.raw).text()
    const body = extractPlainText(rawEmail)

    // 4. Check against user's keyword filters
    const filters = await getUserFilters(user.id, env)
    const matched = filters.some(f =>
      body.toLowerCase().includes(f.keyword.toLowerCase())
    )
    if (!matched) return

    // 5. Parse with Workers AI
    const parsed = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Parse this email:\n---\n${body}\n---` }
      ]
    })

    // 6. POST only parsed output to FastAPI — NOT the raw email body
    await fetch(`${env.API_URL}/email-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": env.INTERNAL_API_KEY
      },
      body: JSON.stringify({
        user_id: user.id,
        parsed: parsed.response
        // raw email body intentionally excluded
      })
    })
  }
}
```

### 7.6 FastAPI Endpoint (outline)

```python
@router.post("/email-import")
async def email_import(
    payload: EmailImportPayload,
    x_internal_key: str = Header(...)
):
    # 1. Validate internal API key
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=401)

    # 2. Parse LLM response
    try:
        data = json.loads(payload.parsed)
    except:
        data = {"found": False}

    # 3. Save transaction or mark unclassified
    if data.get("found"):
        transaction = await save_transaction(payload.user_id, data, source="email")
        status = "success"
    else:
        transaction = await save_unclassified(payload.user_id, source="email")
        status = "unclassified"

    # 4. Log parsed data only — no raw email content
    await log_import(payload.user_id, data, status, transaction.id)

    return {"status": status, "transaction_id": str(transaction.id)}
```

### 7.7 New FastAPI Endpoints (Phase 2.5 additions)

```
POST   /email-import              → internal, called by Cloudflare Worker
GET    /email-import/filters      → get user's keyword filters
POST   /email-import/filters      → add keyword filter
DELETE /email-import/filters/{id} → remove keyword filter
GET    /email-import/logs         → get import history (last 30)
GET    /user/intake-address       → get user's unique intake address
```

### 7.8 Mobile App Changes

#### Profile Tab — Transaction Import Section

```
Transaction Import
├── Auto-Import
│   ├── Your intake address: user_abc123@intake.yourapp.com  [Copy]
│   ├── Keywords: [ gopay ] [ bca ] [ mandiri ] [ + Add ]
│   ├── Setup Guide (expandable step-by-step Gmail filter instructions)
│   └── Import History (last 10: status, merchant, amount, date)
└── Manual Entry
    └── Quick guide: how to use the Add Transaction screen
```

#### Transaction List Changes

- `source = "email"` transactions: small mail icon (Mail, Lucide) badge on row
- `status = "unclassified"` transactions: orange warning badge
- Tap unclassified → Add Transaction screen prefilled with partial data + banner: "This transaction needs review"

#### Onboarding Changes (Screen 2)

- Shows intake address (copyable)
- Keyword add/remove UI
- Expandable Gmail setup guide
- [ Set Up Later ] always visible — never blocks user
- [ Done ] proceeds to Screen 3

### 7.9 Security

- Cloudflare Worker → FastAPI uses internal API key (`X-Internal-Key` header), not user JWT
- Raw email body never leaves Cloudflare Worker — only parsed structured JSON is sent to FastAPI
- `email_import_logs` stores parsed JSON only, never raw email content
- `email_import_logs` auto-purged after 30 days
- User can delete their intake address and generate a new one anytime (invalidates old address immediately)
- Keyword matching is server-side in Worker — emails not matching any keyword are discarded before any processing

### 7.10 Implementation Steps (ordered)

```
1. Buy domain on Cloudflare
2. Configure Email Routing + catch-all on intake.yourapp.com
3. Create Supabase tables: user_intake_addresses, email_filters, email_import_logs
4. Update transactions table: add source = 'email' as valid value
5. FastAPI: slug generation on user signup
6. FastAPI: POST /email-import + /email-import/filters + /user/intake-address endpoints
7. Cloudflare Worker: email receiver + keyword check + Workers AI + FastAPI POST
8. Mobile: onboarding Screen 2 (intake address + keyword setup + Gmail guide)
9. Mobile: Profile tab Transaction Import section
10. Mobile: email badge + unclassified badge on transaction rows
11. Mobile: unclassified transaction edit flow
12. End-to-end test with real GoPay/BCA email
```

---

## 8. Phase 3 — OCR + Split Bill

### 8.1 Goals

- Scan receipt via camera
- OCR extracts line items automatically
- User reviews and edits OCR results
- Assign items to people by name (free text)
- User's assigned share auto-records to transaction tracker

### 8.2 Flow

| Step | Action | Notes |
| :---- | :---- | :---- |
| 1 | User taps Split Bill | New bottom tab or button |
| 2 | Camera opens | expo-camera |
| 3 | Photo taken, sent to OCR | MLKit offline first, Qwen/GLM API as fallback |
| 4 | OCR results shown | List of items with name and price, editable |
| 5 | User edits if needed | Fix OCR errors, add/remove items |
| 6 | User assigns items to names | Tap item, type person name. Multiple people per item supported. |
| 7 | Review totals per person | Summary screen showing each person's total |
| 8 | Tap Record My Share | Creates transaction with source = split_bill |
| 9 | Split bill saved | Accessible in split bill history |

### 8.3 OCR Strategy

- Primary: Google MLKit (offline, bundled with APK, free)
- Fallback: Qwen/GLM OCR API via Z.ai (better accuracy for complex receipts)
- Raw OCR data stored as JSON in `ocr_raw_data` column for debugging
- Receipt image stored in Supabase Storage

---

## 9. Phase 4 — AI Chat Agent

### 9.1 Overview

A conversational AI agent that lets users query their finances in natural language and receive intelligent, actionable answers. Goes beyond basic Text-to-SQL by adding multi-tool execution, persistent memory, and proactive weekly insights.

**Why this approach over basic Text-to-SQL:**

- Multi-tool agent can combine multiple queries in a single response
- Memory means the agent improves with usage, remembering user preferences
- Proactive notifications add value without user-initiated queries
- Same agent architecture scales naturally — OCR tool, budgets tool, predictions can be added in future phases

**LLM:** Qwen/GLM via Z.ai (current plan). Swap provider when better cost/performance option found.

**Cost estimate:** ~$0.50–5/month depending on usage.

### 9.2 Core Capabilities

| Capability | Description |
| :---- | :---- |
| Natural language queries | "How much did I spend on food this month?" → SQL → formatted answer |
| Multi-tool execution | Agent selects and chains tools: search_transactions, get_summary, create_transaction |
| Persistent memory | Remembers conversation context and user preferences across sessions |
| Proactive insights | Weekly push notifications about spending trends and anomalies |
| Suggestion chips | Pre-built query suggestions shown in UI for common questions |
| Clickable results | Transaction results render as tappable cards with deep links |
| Safe execution | SQL validation layer — SELECT-only, user-scoped, forbidden keyword filter |

### 9.3 Example Queries

- "How much did I spend on food this month?"
- "Do I have any transactions in May around Rp300.000?"
- "What is my biggest expense this year?"
- "Show me all income from last quarter"
- "Compare my spending this month vs last month"
- "Am I spending more on transport lately?"

### 9.4 Architecture

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
(execute SQL)          (Z.ai)
```

**Why Supabase Edge Function over FastAPI for the agent:**

- Runs closer to the database — lower latency for SQL execution
- Shares the same Supabase JWT auth automatically
- Keeps AI logic separate from REST API concerns in FastAPI
- FastAPI still handles all standard CRUD endpoints

### 9.5 Agent Tools

Three tools available in Phase 4.1, expandable in later sub-phases.

#### Tool 1: `search_transactions`

```javascript
// Input
{
  filters: {
    date_from?: string,
    date_to?: string,
    category_ids?: string[],
    type?: 'income' | 'expense',
    amount_min?: number,
    amount_max?: number,
    keyword?: string
  },
  limit?: number  // default 20, max 100
}

// Output
{
  transactions: Transaction[],
  total_count: number,
  total_amount: number
}
```

#### Tool 2: `get_summary`

```javascript
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

```javascript
// Input
{
  amount: number,
  type: 'income' | 'expense',
  category_id: string,
  note?: string,
  date?: string,
  currency?: string
}

// Output
{
  transaction: Transaction,
  confirmation_message: string
}
```

**Note:** `create_transaction` requires explicit user confirmation in the UI before execution.

### 9.6 Supabase Edge Function — Technical Spec

**File:** `supabase/functions/chat-agent/index.ts`

```typescript
Deno.serve(async (req) => {
  const user = await verifyJWT(req)
  const { message, session_id } = await req.json()
  const history = await loadChatHistory(session_id, user.id)
  const prefs = await loadUserPrefs(user.id)
  const systemPrompt = buildSystemPrompt(prefs)
  const agentResponse = await callQwenWithTools(systemPrompt, history, message)
  const finalResponse = await executeToolLoop(agentResponse, user.id)
  await saveChatHistory(session_id, user.id, message, finalResponse)
  return Response.json({
    message: finalResponse.text,
    transaction_ids: finalResponse.transaction_ids,
    suggested_actions: finalResponse.suggested_actions
  })
})
```

### 9.7 SQL Safety Validation Layer

All SQL generated by the LLM passes through a validation layer before execution. Non-negotiable.

```typescript
function validateSQL(sql: string, userId: string): ValidationResult {
  const upperSQL = sql.toUpperCase().trim()
  if (!upperSQL.startsWith('SELECT')) {
    return { valid: false, reason: 'Only SELECT queries allowed' }
  }
  const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'GRANT', 'TRUNCATE', 'EXECUTE', 'EXEC', '--', ';--']
  for (const keyword of forbidden) {
    if (upperSQL.includes(keyword)) {
      return { valid: false, reason: `Forbidden keyword: ${keyword}` }
    }
  }
  if (!sql.includes(userId)) {
    return { valid: false, reason: 'Missing user_id scope' }
  }
  return { valid: true }
}
```

**Additional safeguards:**
- Query timeout: 5 seconds max
- Result row limit: 500 rows max
- Rate limiting: 30 chat messages per user per hour
- All validation failures logged to Sentry

### 9.8 React Native Chat UI

**Placement:** New 6th tab "Chat" (MessageCircle icon) or FAB on Dashboard. Final placement decided during Phase 4 UI design.

**Message types:**

| Type | Alignment | Style |
| :---- | :---- | :---- |
| user | Right | bg #EDE0F5, text #1C0F2E, border-radius 12px 12px 2px 12px |
| agent_text | Left | white card, text #1C0F2E, border-radius 2px 12px 12px 12px |
| agent_transactions | Left | list of tappable transaction cards |
| agent_confirm | Left | white card, Cancel + Confirm buttons |
| agent_loading | Left | animated 3-dot typing indicator |
| agent_error | Left | error text #C13333 + Retry button |

**Default suggestion chips:**
- "This month summary"
- "Biggest expense this month"
- "Food spending trend"
- "Compare this vs last month"
- "Recent transactions"

### 9.9 Persistent Memory — Phase 4.2

- Last 20 messages per session included in LLM context window
- Sessions older than 30 days: `messages_json` cleared, metadata row kept
- `user_agent_prefs` updated after each session — never exposed to user directly

### 9.10 Proactive Insights — Phase 4.3

**Trigger:** Supabase `pg_cron` runs every Monday at 9:00 AM UTC.

| Insight | Condition | Example |
| :---- | :---- | :---- |
| Weekly summary | Every week | "Last week: Rp240.000 spent across 12 transactions" |
| Overspend alert | Category > 120% of 4-week rolling average | "Food spending is 40% higher than usual" |
| Unusual transaction | Single transaction > 3× category average | "Large transport expense: Rp85.000 on May 17" |
| Positive trend | Category spend down > 20% vs previous month | "Transport spending down 25% this month" |

**Delivery:** Expo push notifications via `expo-notifications`. User can disable in Profile.

### 9.11 Implementation Sub-phases

| Sub-phase | Scope |
| :---- | :---- |
| 4.1 | Core chat: 3 tools, SQL generation, basic UI, safety layer |
| 4.2 | Memory: chat history persistence, user_agent_prefs, personalised suggestions |
| 4.3 | Proactive: weekly cron insights, push notifications, spending pattern detection |

### 9.12 Future Agent Tools (Post Phase 4)

- `scan_receipt` — OCR tool bridging Phase 3 + Phase 4 agent
- `set_budget` — budget tool when Phase 6 is built
- `predict_spending` — ML-based forecast from spending history
- `export_data` — generate CSV/PDF from natural language request

---

## 10. Phase 5 — Landing Page + Play Store

### 10.1 Landing Page (Astro)

- Hero: app name, tagline, app screenshots
- Features section: tracker, email auto-import, split bill, AI chat
- Download button: Google Play Store link
- Dashboard login link
- Privacy Policy page (required — hosted on this domain)
- SEO optimized static HTML
- Deployed to Cloudflare Pages at yourapp.com

### 10.2 Play Store Requirements

- App signing keystore (generate once, keep safe — never lose this)
- App icon: 512×512 PNG
- Feature graphic: 1024×500 PNG
- Screenshots: minimum 2, recommended 4–8
- Short description: 80 chars max
- Full description: 4000 chars max
- Privacy policy URL: yourapp.com/privacy (required)
- Content rating questionnaire
- EAS Build (Expo Application Services) for APK/AAB generation

---

## 11. Phase 6 — Budgets (Optional, Future)

Deferred to future phase. Not in initial scope.

### 11.1 Planned Features

- Set spending limit per category per period (monthly/weekly)
- Progress bar showing spent vs budget
- Push notification when approaching or exceeding budget
- Budget summary on dashboard

### 11.2 Schema Addition

- New table: `budgets` (id, user_id, category_id, amount, period, created_at)
- No changes to existing tables required

---

## 12. Infrastructure & DevOps

### 12.1 Current VPS Constraint

Current Alibaba Cloud VPS is 1GB RAM / 1 CPU. Only FastAPI + lightweight Postgres can run here. All other services use cloud free tiers.

| Service | Current | Future (upgraded VPS) |
| :---- | :---- | :---- |
| Database | Supabase Cloud (free tier) | Self-hosted Supabase on Coolify |
| Analytics | PostHog Cloud (free tier) | Self-hosted PostHog on Coolify |
| Auth | Supabase Cloud | Self-hosted Supabase |
| Storage | Supabase Cloud | Self-hosted Supabase |
| Backend | Coolify VPS | Same |
| Frontend | Cloudflare Pages | Same |

### 12.2 Migration Path

- Supabase is open source — export Postgres dump, import to self-hosted
- PostHog is open source — data export available
- Upgrade VPS to minimum 4GB RAM before self-hosting either service
- Migrate only when free tier limits are actually hit

---

## 13. Design System

### 13.1 Color Palette — Plum + Tangerine

**Theme:** Light mode only. No dark mode. Warm parchment background, deep plum primary, tangerine orange accent. Intentionally distinct from typical blue finance apps.

| Role | Hex | Usage |
| :---- | :---- | :---- |
| Plum (primary) | #3D1152 | Primary buttons, active tab, period chip, header accents |
| Tangerine (accent) | #FF6B2B | Save button highlight, FAB, links, call-to-action elements |
| Parchment (background) | #FAF7F5 | App background — warm off-white, not pure white |
| White (surface) | #FFFFFF | Cards, bottom sheets, input fields |
| Plum tint | #EDE0F5 | Category icon backgrounds, selected state fills, badges |
| Orange tint | #FFF0E8 | Tangerine accent backgrounds, hover states |
| Income green | #1A7A4A | All income amounts, income summary card, income badge |
| Income green tint | #E6F5EE | Income card background, income chip background |
| Expense red | #C13333 | All expense amounts, expense summary card, delete actions |
| Expense red tint | #FCEAEA | Expense card background, expense chip background |
| Text primary | #1C0F2E | Headings, amounts, labels — near-black with purple undertone |
| Text secondary (mauve) | #8C7A9B | Subtitles, hints, secondary labels |
| Border | #EAE3F0 | All borders, dividers, input outlines |

### 13.2 Typography

| Element | Size | Weight | Color |
| :---- | :---- | :---- | :---- |
| Screen title | 20px | 500 | #1C0F2E |
| Section heading | 14px | 500 | #1C0F2E |
| Body / labels | 14px | 400 | #1C0F2E |
| Secondary text | 12px | 400 | #8C7A9B |
| Amount (large) | 36–48px | 500 | Income / Expense / Text primary |
| Amount (list row) | 14px | 500 | Income green or Expense red |
| Caption / hint | 11px | 400 | #8C7A9B |
| Button text | 14px | 500 | #FFFFFF white or #3D1152 plum |

### 13.3 Component Rules

- All cards: white background, 0.5px border #EAE3F0, border-radius 12px, padding 16px
- Primary button: background #3D1152, text white, border-radius 10px, full width for main actions
- Accent highlight: tangerine #FF6B2B used on save button text, FAB icon, key CTAs
- Bottom sheets: white surface, 18px top border-radius, drag handle bar
- Category icons: colored circle avatar, Lucide icon inside
- Income amounts: always + prefix, color #1A7A4A
- Expense amounts: always − prefix, color #C13333
- Balance: color #3D1152, turns #C13333 if negative
- Active tab indicator: plum #3D1152 filled square/dot
- Chips and badges: plum tint background #EDE0F5, plum text #3D1152
- Destructive actions (delete): #C13333 text and border, never filled red button
- Empty states: simple illustration, mauve secondary text, optional plum CTA button
- Loading skeletons: #EAE3F0 animated bars, not spinners
- Toast notifications: bottom of screen, 3 second auto-dismiss — success uses income green, error uses expense red

---

## 14. Pre-seed Master Data

### 14.1 Default Categories

| Name | Icon (Lucide) | Icon Color | bg |
| :---- | :---- | :---- | :---- |
| Food & Drink | UtensilsCrossed | #C13333 | #FCEAEA |
| Transport | Car | #1A7A4A | #E6F5EE |
| Shopping | ShoppingCart | #FF6B2B | #FFF0E8 |
| Health | Heart | #B84080 | #F5E6F0 |
| Entertainment | Tv | #3D1152 | #EDE0F5 |
| Bills & Utilities | Receipt | #8C7A9B | #F0EDF5 |
| Income | Wallet | #1A7A4A | #E6F5EE |
| Other | MoreHorizontal | #8C7A9B | #F0EDF5 |

---

## 15. Key Principles

- Build one phase at a time. Do not start the next phase until the current one is fully working.
- Use cloud free tiers now. Migrate to self-hosted only when limits are hit.
- Keep scope tight. Every feature added increases time to completion.
- Do not over-engineer. This is a hobby project first.
- Both auto-import (email) and manual entry are always available simultaneously.
- Wallets/accounts feature is intentionally deferred. Add in future if needed.
- Budgets feature is intentionally deferred to Phase 6.
- No dark mode. Light mode only for all phases.
- Color palette is locked: Plum #3D1152 + Tangerine #FF6B2B. Do not deviate without updating this document.
- AI LLM split: Cloudflare Workers AI (Llama 3.1 8B) for email parsing only; Qwen/GLM for AI chat agent.
- Never store raw email content. Parsed JSON only.
- Auth session tokens stored in `expo-secure-store` (encrypted), never AsyncStorage.
- Multi-currency (Phase 1): per-transaction currency selector is available, but dashboard totals only sum transactions in the user's default currency. Foreign-currency transactions are counted but excluded from totals. FX rate table deferred to Phase 2+.
- Offline-first (Phase 1): TanStack Query cache persisted to AsyncStorage for reads (24h max age). Failed writes queued in AsyncStorage and drained via NetInfo listener on reconnect. Max 5 retries per write, last-write-wins conflict resolution. Multi-device sync (PowerSync or similar) deferred to Phase 2.

---

## 16. Privacy & Compliance — UU PDP

MoneyTracker handles personal financial data of Indonesian users. Compliance with **Undang-Undang Pelindungan Data Pribadi (UU PDP) No. 27 Tahun 2022** is required before public launch (Phase 5).

### 16.1 Data Collected

| Data Type | Source | Stored Where | Retention |
| :---- | :---- | :---- | :---- |
| Google account (name, email, avatar) | Google OAuth | Supabase Auth | Until account deleted |
| Transaction data (amount, category, date, note) | User input / email parsing | Supabase (transactions table) | Until user deletes or account deleted |
| Category data | User input | Supabase (categories table) | Until user deletes or account deleted |
| Email import logs (parsed JSON only) | Auto-import | Supabase (email_import_logs) | 30 days, then auto-purged |
| Receipt images | OCR scan | Supabase Storage | Until split bill deleted |
| Chat history | AI chat | Supabase (chat_sessions) | 30 days, then messages cleared |
| Spending patterns | Derived from transactions | Supabase (user_agent_prefs) | Until account deleted |

### 16.2 Third-Party Data Processors

User data passes through these third-party services. All must be disclosed in the privacy policy.

| Processor | What data | Why | Retention by processor |
| :---- | :---- | :---- | :---- |
| Supabase (hosted on AWS) | All user data | Database, auth, storage | Per user account lifetime |
| Cloudflare Workers AI | Email body content (in transit only) | LLM parsing for email auto-import | Not retained after inference |
| Qwen/GLM via Z.ai | Transaction query context, chat messages | AI chat agent | Per Z.ai terms — disclose in privacy policy |
| Google (OAuth) | Google account info | Authentication | Per Google's privacy policy |
| PostHog | Usage analytics (anonymized) | Product analytics | Per PostHog free tier terms |
| Sentry | Error logs (may contain partial data) | Error monitoring | 90 days per Sentry free tier |

### 16.3 User Rights (UU PDP obligations)

| Right | Implementation |
| :---- | :---- |
| Right to access | User can view all their data in the app |
| Right to rectify | User can edit transactions, categories, profile |
| Right to delete | Account deletion removes all user data from Supabase. Must be implemented before Phase 5 launch. |
| Right to withdraw consent | User can disable auto-import and delete intake address anytime |
| Right to data portability | Export to CSV via web dashboard (Phase 2) |

### 16.4 Account Deletion Requirements

Account deletion must be implemented before Phase 5 (Play Store publish). On deletion:

1. Delete all rows in: `transactions`, `categories` (user-owned), `split_bills`, `split_bill_items`, `split_bill_assignments`, `user_intake_addresses`, `email_filters`, `email_import_logs`, `chat_sessions`, `user_agent_prefs`
2. Delete receipt images from Supabase Storage
3. Delete Supabase Auth user record
4. Return confirmation to user

### 16.5 Privacy Policy Requirements

A privacy policy page must exist at `yourapp.com/privacy` before Play Store submission. Must cover:

- What data is collected and why
- List of third-party processors (Section 16.2)
- How long data is retained
- User rights and how to exercise them (including account deletion request)
- Contact email for privacy requests
- Disclosure that financial email content is processed by Cloudflare Workers AI for parsing
- Disclosure that chat messages are sent to Qwen/GLM (Z.ai) for AI responses

### 16.6 Data Security

- All data in transit: HTTPS enforced across all endpoints (Cloudflare SSL)
- All data at rest: Supabase encrypts at rest by default (AES-256)
- Raw email content never stored — only parsed structured output
- Supabase Row Level Security enforced on all tables (see Section 17)

---

## 17. Supabase Row Level Security (RLS)

RLS must be enabled and enforced on all tables before Phase 1 launch. These are the required policies per table. Implement actual SQL during Phase 1 setup.

**Global rule:** All policies use `auth.uid()` to scope to the currently authenticated user. No user can read or write another user's data under any circumstance.

### categories
- **SELECT:** Allow if `user_id = auth.uid()` OR `user_id IS NULL` (master categories visible to all)
- **INSERT:** Allow if `user_id = auth.uid()` (user can only create their own categories)
- **UPDATE:** Allow if `user_id = auth.uid()` (user can only edit their own categories)
- **DELETE:** Allow if `user_id = auth.uid()` (user can only delete their own categories)
- Master categories (`user_id IS NULL`) are read-only for all users — no INSERT/UPDATE/DELETE allowed on them

### transactions
- **SELECT:** Allow if `user_id = auth.uid()`
- **INSERT:** Allow if `user_id = auth.uid()`
- **UPDATE:** Allow if `user_id = auth.uid()`
- **DELETE:** Allow if `user_id = auth.uid()`

### split_bills
- **SELECT:** Allow if `created_by = auth.uid()`
- **INSERT:** Allow if `created_by = auth.uid()`
- **UPDATE:** Allow if `created_by = auth.uid()`
- **DELETE:** Allow if `created_by = auth.uid()`

### split_bill_items
- **SELECT:** Allow if the parent `split_bill_id` belongs to `auth.uid()` (join check)
- **INSERT:** Allow if the parent `split_bill_id` belongs to `auth.uid()`
- **UPDATE:** Allow if the parent `split_bill_id` belongs to `auth.uid()`
- **DELETE:** Allow if the parent `split_bill_id` belongs to `auth.uid()`

### split_bill_assignments
- **SELECT:** Allow if the parent `split_bill_id` belongs to `auth.uid()`
- **INSERT:** Allow if the parent `split_bill_id` belongs to `auth.uid()`
- **UPDATE:** Allow if the parent `split_bill_id` belongs to `auth.uid()`
- **DELETE:** Allow if the parent `split_bill_id` belongs to `auth.uid()`

### user_intake_addresses
- **SELECT:** Allow if `user_id = auth.uid()`
- **INSERT:** Allow if `user_id = auth.uid()`
- **UPDATE:** Allow if `user_id = auth.uid()`
- **DELETE:** Allow if `user_id = auth.uid()`

### email_filters
- **SELECT:** Allow if `user_id = auth.uid()`
- **INSERT:** Allow if `user_id = auth.uid()`
- **UPDATE:** Allow if `user_id = auth.uid()`
- **DELETE:** Allow if `user_id = auth.uid()`

### email_import_logs
- **SELECT:** Allow if `user_id = auth.uid()`
- **INSERT:** Service role only (FastAPI backend inserts via service role key, not user JWT)
- **UPDATE:** Deny all
- **DELETE:** Allow if `user_id = auth.uid()` (for account deletion flow)

### chat_sessions
- **SELECT:** Allow if `user_id = auth.uid()`
- **INSERT:** Allow if `user_id = auth.uid()`
- **UPDATE:** Allow if `user_id = auth.uid()`
- **DELETE:** Allow if `user_id = auth.uid()`

### user_agent_prefs
- **SELECT:** Allow if `user_id = auth.uid()`
- **INSERT:** Allow if `user_id = auth.uid()`
- **UPDATE:** Allow if `user_id = auth.uid()`
- **DELETE:** Allow if `user_id = auth.uid()`

### Implementation Notes
- Enable RLS on every table: `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;`
- FastAPI backend uses Supabase **service role key** only for: `email_import_logs` INSERT and account deletion. All other operations use the user's JWT (passed from mobile/web).
- Never expose the service role key to the frontend or mobile app.
- Test RLS policies before Phase 1 launch by attempting cross-user data access and confirming it is blocked.

---

*End of Document — MoneyTracker PRD v1.5 — May 2026*
