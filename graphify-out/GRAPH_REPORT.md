# Graph Report - FinancialApp  (2026-08-10)

## Corpus Check
- 90 files · ~36,933 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 554 nodes · 1046 edges · 65 communities (29 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9fb07040`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app/page.tsx
- transactions-page.tsx
- finance.ts
- devDependencies
- Pre-Launch Audit Fixes Documentation
- app-header.tsx
- cn
- dependencies
- compilerOptions
- components.json
- Graphify Knowledge Graph
- proxy.ts
- 20260728_full_schema.sql
- rate-limit.ts
- public.accounts
- 20260617_create_profiles_trigger.sql
- 20260729_integer_cents.sql
- about/page.tsx
- contact/page.tsx
- privacy/page.tsx
- terms/page.tsx
- next.config.ts
- create_transfer
- eslint.config.mjs
- postcss.config.mjs
- CLAUDE.md (delegates to AGENTS.md)
- File Icon (Next.js boilerplate placeholder)
- Globe Icon (Next.js boilerplate placeholder)
- Next.js Logo (boilerplate)
- Vercel Logo (boilerplate)
- Window Icon (Next.js boilerplate placeholder)
- public.accounts
- public.categories
- public.transactions
- public.accounts
- public.categories
- public.transactions
- public.accounts
- public.categories
- public.transactions
- public.transfers
- public.transactions
- public.transfers
- public.transactions
- public.accounts
- public.categories
- public.transactions
- public.transfers
- public.transactions
- formatCurrency
- public.accounts
- public.profiles
- Selena — Personal Finance AI

## God Nodes (most connected - your core abstractions)
1. `cn()` - 45 edges
2. `formatCurrency()` - 23 edges
3. `Button()` - 22 edges
4. `Selena — Personal Finance AI` - 19 edges
5. `compilerOptions` - 16 edges
6. `Card()` - 14 edges
7. `CardContent()` - 13 edges
8. `DashboardAccount` - 11 edges
9. `CardHeader()` - 11 edges
10. `CardTitle()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Selena — Personal Finance AI (README)` --semantically_similar_to--> `Development Playbook v2`  [INFERRED] [semantically similar]
  README.md → finance-ai/PLAYBOOK.md
- `Security Requirements (RLS, User-Scoped Policies)` --semantically_similar_to--> `Row Level Security (RLS)`  [INFERRED] [semantically similar]
  finance-ai/PLAYBOOK.md → README.md
- `Mobile-First Rule (375/390/430px)` --rationale_for--> `Selena — Personal Finance AI (README)`  [INFERRED]
  finance-ai/PLAYBOOK.md → README.md
- `Groq AI Chatbot (Llama 3.3 70B)` --conceptually_related_to--> `/api/chat In-Memory Rate Limiter`  [INFERRED]
  README.md → finance-ai/CHANGES_DOCUMENTATION.txt
- `Soft Delete with Undo (deleted_at)` --conceptually_related_to--> `Soft Delete Reverted (Hard Delete Restored)`  [AMBIGUOUS]
  finance-ai/CHANGES_DOCUMENTATION.txt → finance-ai/FIXES.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Coding Agent Prerequisite Workflow** — finance_ai_agents_playbook, finance_ai_agents_next_docs, finance_ai_agents_knowledge_graph [INFERRED 0.85]
- **Shared Authentication Flow** — readme_authentication_flow, readme_supabase_auth, finance_ai_changes_documentation_session_expiry, finance_ai_playbook_security_requirements [INFERRED 0.85]
- **Money Write Integrity Reforms** — finance_ai_changes_documentation_integer_cents, finance_ai_changes_documentation_server_validation, finance_ai_changes_documentation_idempotency, finance_ai_changes_documentation_create_transfer_rpc, finance_ai_changes_documentation_account_id_fk [INFERRED 0.85]
- **Pre-Launch Audit Fix Program** — finance_ai_fixes, finance_ai_changes_documentation, finance_ai_changes_documentation_test_suite, finance_ai_fixes_priority_order [EXTRACTED 1.00]

## Communities (65 total, 36 thin omitted)

### Community 0 - "app/page.tsx"
Cohesion: 0.13
Nodes (17): AiPreview(), DashboardMockup(), spendingData, transactions, FadeIn(), FadeInProps, Feature, Features (+9 more)

### Community 2 - "transactions-page.tsx"
Cohesion: 0.08
Nodes (50): AccountBalanceDialog(), AccountBalance, AccountCards(), AccountCardsProps, fetchAccountBalances(), AccountsPage(), AccountsPageProps, BannerState (+42 more)

### Community 3 - "finance.ts"
Cohesion: 0.09
Nodes (42): AccountsRoute(), metadata, DashboardPage(), metadata, metadata, SignInPage(), metadata, SignUpPage() (+34 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (35): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss, @tailwindcss/postcss (+27 more)

### Community 5 - "Pre-Launch Audit Fixes Documentation"
Cohesion: 0.08
Nodes (31): Pre-Launch Audit Fixes Documentation, account_id FK for Balance Computation, Atomic Transfer RPC (create_transfer), Write Idempotency via idempotency_key, Integer Cents Money Storage, /api/chat In-Memory Rate Limiter, Sanitized Supabase Error Messages, Server-Side Money Validation (CHECK Constraints + RPCs) (+23 more)

### Community 6 - "app-header.tsx"
Cohesion: 0.12
Nodes (15): metadata, AppHeader(), isActive(), navLinks, companyLinks, Footer(), productLinks, appRoutes (+7 more)

### Community 7 - "cn"
Cohesion: 0.10
Nodes (38): BalanceDialogProps, BalanceFormValues, AccountDialog(), AccountDialogProps, AccountFormValues, currencyOptions, getInitialForm(), ChatbotLauncher() (+30 more)

### Community 8 - "dependencies"
Cohesion: 0.07
Nodes (29): class-variance-authority, clsx, dependencies, class-variance-authority, clsx, framer-motion, lucide-react, next (+21 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "Graphify Knowledge Graph"
Cohesion: 0.31
Nodes (9): Custom Next.js Version (Breaking Changes), AGENTS.md (Agent Rules), graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, graphify query command, graphify --update command, Graphify Knowledge Graph, node_modules/next/dist/docs/ (Next.js Reference Docs) (+1 more)

### Community 12 - "proxy.ts"
Cohesion: 0.31
Nodes (7): createSupabaseMiddlewareClient(), authPages, cloneCookies(), config, matches(), protectedPaths, proxy()

### Community 13 - "20260728_full_schema.sql"
Cohesion: 0.43
Nodes (6): auth.users, public.accounts, public.categories, public.profiles, public.transactions, public.transfers

### Community 14 - "rate-limit.ts"
Cohesion: 0.39
Nodes (5): POST(), POST(), checkRateLimit(), RateLimitEntry, store

### Community 17 - "20260617_create_profiles_trigger.sql"
Cohesion: 0.40
Nodes (4): on_auth_user_created, public.handle_new_user(), public.accounts, public.handle_new_user

### Community 61 - "formatCurrency"
Cohesion: 0.10
Nodes (25): ChartTooltip(), DashboardCharts(), DashboardChartsProps, pieColors, DashboardCharts, DashboardChartsShell(), DashboardChartsShellProps, categories (+17 more)

### Community 65 - "Selena — Personal Finance AI"
Cohesion: 0.06
Nodes (33): 1. Transaction Management, 2. Account Balances, 3. Dashboard, 4. Transaction List Page (`/transactions`), 5. AI Chatbot, 6. New User Onboarding, 7. Theme Support, Amount Storage (+25 more)

## Ambiguous Edges - Review These
- `Soft Delete with Undo (deleted_at)` → `Soft Delete Reverted (Hard Delete Restored)`  [AMBIGUOUS]
  finance-ai/CHANGES_DOCUMENTATION.txt · relation: conceptually_related_to

## Knowledge Gaps
- **197 isolated node(s):** `hiddenRoutes`, `suggestionPrompts`, `Message`, `MonthlySummaryRecord`, `MonthlySummaryState` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Soft Delete with Undo (deleted_at)` and `Soft Delete Reverted (Hard Delete Restored)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Button()` connect `cn` to `app/page.tsx`, `transactions-page.tsx`, `formatCurrency`, `app-header.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `transactions-page.tsx`, `formatCurrency`, `app-header.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `formatCurrency` to `app/page.tsx`, `transactions-page.tsx`, `finance.ts`, `cn`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `hiddenRoutes`, `suggestionPrompts`, `Message` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12535612535612536 - nodes in this community are weakly interconnected._
- **Should `transactions-page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07902973395931143 - nodes in this community are weakly interconnected._