# MoneyTracker — Agent Instructions

Agent, skill, and rule index for the **MoneyTracker** project (a personal finance mobile app). This file is the entry point — it lists what exists and how to use it.

**Project:** MoneyTracker — React Native + Expo (Android), Supabase (Postgres + Auth + RLS), NativeWind v4, Zustand + TanStack Query, TypeScript. Currently **Phase 1** in progress. See [MoneyTracker_PRD_v1.5.md](./MoneyTracker_PRD_v1.5.md) and [PHASE1_CHECKLIST.md](./PHASE1_CHECKLIST.md) for full product scope and current work.

---

## Core Principles

1. **Plan Before Execute** — Use the `planner` agent for non-trivial features. Break work into phases; don't start Phase N+1 until Phase N is done.
2. **Test-Driven** — Write tests first. **80%+ coverage required** (unit + integration + E2E).
3. **Security-First** — Supabase RLS is mandatory. Never hardcode secrets. Validate all inputs (Zod schemas). Comply with UU PDP (Section 16 of PRD).
4. **Immutability** — Always return new objects via spread; never mutate state in place.
5. **Phase Discipline** — One phase at a time. PRD `Section 4` is the build order; PRD `Section 15` lists the locked design constraints (palette, no dark mode, etc.).

---

## Available Agents

Located in [`agents/`](./agents/). Each agent has a YAML frontmatter describing its tools, model, and trigger conditions.

| Agent                                                    | Model   | Purpose                                    | When to Use                                    |
| -------------------------------------------------------- | ------- | ------------------------------------------ | ---------------------------------------------- |
| [planner](./agents/planner.md)                           | glm-5.2 | Implementation planning                    | Complex features, refactoring, multi-step work |
| [architect](./agents/architect.md)                       | glm-5.2 | System design, scalability, ADRs           | Architectural decisions, system design         |
| [tdd-guide](./agents/tdd-guide.md)                       | glm-5.2 | Test-driven development, 80%+ coverage     | New features, bug fixes, refactoring           |
| [code-reviewer](./agents/code-reviewer.md)               | glm-5.2 | Quality + security review (CRITICAL → LOW) | Immediately after writing/modifying code       |
| [security-reviewer](./agents/security-reviewer.md)       | glm-5.2 | OWASP Top 10, secrets, RLS                 | After auth/RLS/API code, before commit         |
| [build-error-resolver](./agents/build-error-resolver.md) | glm-5.2 | TypeScript / build errors, minimal diffs   | When `tsc` or `expo` build fails               |
| [doc-updater](./agents/doc-updater.md)                   | glm-5.2 | Codemaps, README/PRD maintenance           | After architecture or API changes              |

### Agent Orchestration

- **Proactive use** — Don't wait for a user prompt to invoke `code-reviewer` or `tdd-guide`.
- **Parallel execution** — Launch independent agents in a single message (e.g. security + code review on the same diff).
- **Routing rules:**
  - Complex feature request → `planner` first
  - Code just written → `code-reviewer` next
  - RLS/auth/API/sensitive code → `security-reviewer` in parallel with `code-reviewer`
  - Build/type failure → `build-error-resolver`
  - Architectural decision → `architect` (consider creating an ADR)
  - Documentation drift → `doc-updater`

---

## Available Skills

Located in [`skills/`](./skills/). Skills provide on-demand domain knowledge.

| Skill                                                                                               | Use For                                                                            |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [search-first](./skills/search-first/SKILL.md)                                                      | Before writing any new utility — search npm, MCP, GitHub, existing repo code first |
| [coding-standards](./skills/coding-standards/SKILL.md)                                              | Universal TS/JS/React/Node conventions (naming, async, type safety)                |
| [frontend-patterns](./skills/frontend-patterns/SKILL.md)                                            | React patterns, hooks, state management, performance, accessibility                |
| [api-design](./skills/api-design/SKILL.md)                                                          | REST conventions: resource naming, status codes, pagination, versioning, errors    |
| [backend-patterns](./skills/backend-patterns/SKILL.md)                                              | Repository/service layers, queries, caching, error handling, rate limiting         |
| [database-migrations](./skills/database-migrations/SKILL.md)                                        | Safe Postgres schema changes, expand-contract pattern, zero-downtime               |
| [deployment-patterns](./skills/deployment-patterns/SKILL.md)                                        | CI/CD, Docker, health checks, rollback, production readiness                       |
| [tdd-workflow](./skills/tdd-workflow/SKILL.md)                                                      | TDD cycle, Playwright E2E patterns, mocking Supabase                               |
| [security-review](./skills/security-review/SKILL.md)                                                | OWASP checklist, Supabase RLS, secrets, CSRF, rate limiting                        |
| [security-review / cloud-infrastructure](./skills/security-review/cloud-infrastructure-security.md) | Cloud-specific security (Cloudflare, Supabase, VPS) — relevant for Phase 2/2.5     |

---

## Available Rules

Located in [`rules/`](./rules/). Rules are **always-applied guidelines** for this project.

### [Common rules](./rules/common/) — apply to all code

- [agents.md](./rules/common/agents.md) — agent orchestration and parallel execution
- [coding-style.md](./rules/common/coding-style.md) — immutability, file size, error handling, validation
- [development-workflow.md](./rules/common/development-workflow.md) — research → plan → TDD → review → commit
- [git-workflow.md](./rules/common/git-workflow.md) — conventional commits, PR workflow
- [hooks.md](./rules/common/hooks.md) — hook types, TodoWrite best practices
- [patterns.md](./rules/common/patterns.md) — skeleton projects, repository pattern, API envelope
- [performance.md](./rules/common/performance.md) — model selection, context window management
- [security.md](./rules/common/security.md) — pre-commit security checklist, secret management
- [testing.md](./rules/common/testing.md) — 80% coverage minimum, TDD workflow, test types

### [TypeScript rules](./rules/typescript/) — apply to `.ts`/`.tsx`/`.js`/`.jsx`

- [coding-style.md](./rules/typescript/coding-style.md) — types vs interfaces, avoid `any`, React props, Zod, no `console.log`
- [hooks.md](./rules/typescript/hooks.md) — Prettier + `tsc` PostToolUse hooks, console.log audit
- [patterns.md](./rules/typescript/patterns.md) — `ApiResponse<T>` envelope, `useDebounce`, repository interface
- [security.md](./rules/typescript/security.md) — env vars for secrets
- [testing.md](./rules/typescript/testing.md) — Playwright for E2E

---

## Project Structure

```
agents/          — 7 specialized subagents (planner, architect, tdd-guide, code-reviewer, security-reviewer, build-error-resolver, doc-updater)
skills/          — 9 workflow skills (search-first, coding-standards, frontend/backend/api-design, database-migrations, deployment-patterns, tdd-workflow, security-review + cloud)
rules/           — 14 always-follow guidelines (9 common + 5 typescript)
sql/             — Supabase migrations + README (Phase 1 RLS already applied)
app/             — Expo Router screens (auth, onboarding, 5-tab main app, overlays)
src/
  constants/     — colors, categories, typography (Plum + Tangerine palette)
  contexts/      — auth-context.tsx
  hooks/         — use-auth.ts
  lib/           — supabase.ts, migrate-guest.ts
  stores/        — guest-data-store.ts (Zustand)
  types/         — database.ts (hand-written, matches Supabase schema)
```

---

## Tech Stack (Quick Reference)

| Layer               | Technology                                                          |
| ------------------- | ------------------------------------------------------------------- |
| Mobile framework    | React Native + Expo SDK 54                                          |
| Routing             | Expo Router (file-based)                                            |
| Styling             | NativeWind v4 (Tailwind)                                            |
| Server state        | TanStack Query                                                      |
| Local state         | Zustand (with AsyncStorage persistence)                             |
| Forms               | react-hook-form + Zod                                               |
| Backend             | Supabase (Postgres + Auth + Storage)                                |
| Auth                | Supabase Auth + Google OAuth (expo-auth-session + expo-web-browser) |
| Icons               | lucide-react-native                                                 |
| Bottom sheet        | @gorhom/bottom-sheet                                                |
| Date picker         | react-native-date-picker                                            |
| Gestures/Animations | react-native-gesture-handler + react-native-reanimated              |
| Safe area           | react-native-safe-area-context                                      |
| TypeScript          | ~5.9, strict mode                                                   |

---

## Project-Specific Conventions

These override or extend the default rules. Locked in by the PRD — do not change without updating the PRD.

### Design System (PRD §13)

- **Palette:** Plum `#3D1152` (primary), Tangerine `#FF6B2B` (accent), Parchment `#FAF7F5` (bg). See [src/constants/colors.ts](./src/constants/colors.ts).
- **Light mode only** — no dark mode ever.
- **Income:** green `#1A7A4A`, `+` prefix. **Expense:** red `#C13333`, `−` prefix. **Balance:** plum, turns red if negative.
- **Cards:** white bg, 0.5px border `#EAE3F0`, 12px radius, 16px padding.
- **Bottom sheets:** white, 18px top radius, drag handle bar.
- **Loading:** skeleton bars in `#EAE3F0` — no spinners.

### Database Conventions (PRD §3, §17)

- **Master categories** have `user_id = NULL` — read-only, visible to all users.
- **User categories/transactions** are RLS-scoped to `auth.uid()`.
- `transactions.source` enum: `manual` | `split_bill` | `email`.
- New transactions default to `source = 'manual'`.
- RLS is non-negotiable — every table needs policies before launch.

### Phase 1 Implementation Order

Follow [PHASE1_CHECKLIST.md](./PHASE1_CHECKLIST.md) strictly. Currently:

- ✅ Step 1 (deps) · Step 2 (NativeWind + tokens) · Step 3a-3c (Supabase client, auth context, Google OAuth)
- ⬜ Step 4 (TanStack Query provider + Zustand stores) → Step 5 (Splash + Login) → Step 5.5 (Onboarding) → Steps 6–12 (tabs, screens, polish)

### File & Code Style

- **Many small files** (200–400 lines typical, 800 max). Organize by feature, not type.
- **No `console.log`** in production code (TypeScript rule enforced by hooks).
- **No `any`** — use `unknown` and narrow, or use Zod to infer types.
- **No hardcoded secrets** — use `process.env` / Expo public env vars.
- **No mutation** — return new objects via spread operator.

---

## Development Workflow

Per [rules/common/development-workflow.md](./rules/common/development-workflow.md):

1. **Research first** — `search-first` skill: check `rg` in repo, then npm, then GitHub, then write.
2. **Plan** — `planner` agent for non-trivial work. Reference PRD section numbers in the plan.
3. **TDD** — `tdd-guide` agent. Tests first. 80%+ coverage.
4. **Review** — `code-reviewer` immediately after writing. `security-reviewer` in parallel for RLS/auth/email-import work.
5. **Commit** — Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`). See [rules/common/git-workflow.md](./rules/common/git-workflow.md).

---

## Success Metrics

- All tests pass with 80%+ coverage.
- No CRITICAL/HIGH code-review or security-review issues open.
- RLS verified by attempting cross-user data access (blocked).
- Phase 1 verification checklist (bottom of [PHASE1_CHECKLIST.md](./PHASE1_CHECKLIST.md)) all green before declaring Phase 1 done.
- Build succeeds: `npx expo start` on Android device/emulator, no console errors.
- App respects all PRD Section 15 key principles (palette, no dark mode, single-phase-at-a-time, no over-engineering).
