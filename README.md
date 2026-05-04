# MoneyTracker

Personal finance tracker for Android with OCR receipt scanning, bill splitting, and AI-powered spending insights.

## Features

- **Transaction Tracking** — Log income and expenses with categories, notes, and dates
- **Category Management** — 8 default categories + unlimited custom categories
- **Dashboard** — Balance overview, spending breakdown by category, recent transactions
- **Bill Splitting** — Scan receipts with OCR, assign items to people, record your share
- **AI Chat** — Ask questions about your spending in natural language (Text-to-SQL)
- **Guest Mode** — Try the app without signing in; data stored locally, migrate when ready

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo |
| Styling | NativeWind (Tailwind CSS) |
| Navigation | Expo Router |
| State | Zustand + TanStack Query |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Auth | Google OAuth via Supabase |
| Web Dashboard | Vite + React (Phase 2) |
| API | FastAPI (Phase 2) |
| OCR | Google MLKit + Qwen/GLM API (Phase 3) |
| AI Chat | Qwen/GLM Text-to-SQL (Phase 4) |

## Build Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Mobile app + manual transaction tracking | In Progress |
| 2 | Web dashboard + FastAPI backend | Planned |
| 3 | OCR receipt scanning + bill splitting | Planned |
| 4 | AI chat (natural language queries) | Planned |
| 5 | Landing page + Play Store publish | Planned |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Expo Go on a physical device
- Supabase project with Phase 1 tables (see `sql/`)

### Setup

1. Clone and install dependencies:

```bash
git clone https://github.com/farisadam97/money-tracker.git
cd money-tracker
npm install
```

2. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

3. Run the SQL migration scripts in Supabase SQL Editor (in order):

```bash
sql/01_create_phase1_tables.sql
sql/02_enable_rls.sql
sql/03_create_rls_policies.sql
sql/04_seed_master_categories.sql
```

4. Start the development server:

```bash
npx expo start
```

### Environment Setup (detailed)

For full setup instructions including Supabase, Google OAuth, and database configuration, see [`SETUP_CHECKLIST.md`](SETUP_CHECKLIST.md).

## Project Structure

```
app/                    # Expo Router pages
  (tabs)/               # Bottom tab navigation
src/
  components/           # Reusable UI components
  constants/            # Design tokens (colors, categories, typography)
  contexts/             # React contexts (auth)
  hooks/                # Custom hooks
  lib/                  # Utilities (Supabase client, guest migration)
  stores/               # Zustand stores
  types/                # TypeScript type definitions
sql/                    # Database migration and seed scripts
design-draft/           # UI design mockups
```

## Design System

Light mode only with a Plum + Tangerine color palette. See the full design spec in [`MoneyTracker_StitchBrief_v1.1.md`](MoneyTracker_StitchBrief_v1.1.md).

| Role | Color |
|---|---|
| Primary (Plum) | `#3D1152` |
| Accent (Tangerine) | `#FF6B2B` |
| Background | `#FAF7F5` |
| Income | `#1A7A4A` |
| Expense | `#C13333` |

## Documentation

- [`MoneyTracker_PRD_v1.2.md`](MoneyTracker_PRD_v1.2.md) — Full product requirements
- [`MoneyTracker_StitchBrief_v1.1.md`](MoneyTracker_StitchBrief_v1.1.md) — UI design specification
- [`PHASE1_CHECKLIST.md`](PHASE1_CHECKLIST.md) — Phase 1 implementation progress
- [`SETUP_CHECKLIST.md`](SETUP_CHECKLIST.md) — Phase 0 setup checklist
- [`sql/README.md`](sql/README.md) — Database schema documentation

## License

Private project — all rights reserved.
