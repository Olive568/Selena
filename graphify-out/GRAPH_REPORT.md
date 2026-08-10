# Graph Report - C:/FinancialApp  (2026-08-10)

## Corpus Check
- 29 files · ~35,614 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 526 nodes · 1022 edges · 65 communities (29 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.72)
- Token cost: 1,100 input · 2,300 output

## Community Hubs (Navigation)
- Marketing & Home Dashboard
- Auth & App Header
- Transactions & Settings
- Data Dashboard Pages
- Dev & Build Tooling
- Audit Fix Documentation
- Auth Pages & Layout
- Account Dialogs & Pages
- Runtime Dependencies
- TypeScript Configuration
- shadcn Component Registry
- Agent & Graphify Docs
- Proxy Auth Middleware
- Core Database Schema
- API Routes & Rate Limiting
- RPC Owner Check Migration
- Profile Creation Trigger
- Integer Cents Migration
- About Page
- Contact Page
- Privacy Policy Page
- Terms of Service Page
- Security Headers Config
- Atomic Transfer RPC
- ESLint Configuration
- PostCSS Configuration
- CLAUDE.md Delegation
- File Icon Asset
- Globe Icon Asset
- Next.js Logo Asset
- Vercel Logo Asset
- Window Icon Asset
- Accounts Table Node
- Categories Table Node
- Transactions Table Node
- Accounts Table Node
- Categories Table Node
- Transactions Table Node
- Accounts Table Node
- Categories Table Node
- Transactions Table Node
- Transfers Table Node
- Transactions Table Node
- Transfers Table Node
- Transactions Table Node
- Accounts Table Node
- Categories Table Node
- Transactions Table Node
- Transfers Table Node
- Transactions Table Node
- Accounts Table Node
- Profiles Table Node

## God Nodes (most connected - your core abstractions)
1. `cn()` - 44 edges
2. `formatCurrency()` - 24 edges
3. `Button()` - 22 edges
4. `compilerOptions` - 16 edges
5. `Card()` - 15 edges
6. `CardContent()` - 14 edges
7. `CardHeader()` - 12 edges
8. `CardTitle()` - 12 edges
9. `CardDescription()` - 12 edges
10. `Input()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Selena — Personal Finance AI (README)` --semantically_similar_to--> `Development Playbook v2`  [INFERRED] [semantically similar]
  README.md → finance-ai/PLAYBOOK.md
- `Security Requirements (RLS, User-Scoped Policies)` --semantically_similar_to--> `Row Level Security (RLS)`  [INFERRED] [semantically similar]
  finance-ai/PLAYBOOK.md → README.md
- `Mobile-First Rule (375/390/430px)` --rationale_for--> `Selena — Personal Finance AI (README)`  [INFERRED]
  finance-ai/PLAYBOOK.md → README.md
- `Groq AI Chatbot (Llama 3.3 70B)` --conceptually_related_to--> `/api/chat In-Memory Rate Limiter`  [INFERRED]
  README.md → finance-ai/CHANGES_DOCUMENTATION.txt
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  finance-ai/components/ui/alert-dialog.tsx → finance-ai/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Coding Agent Prerequisite Workflow** — finance_ai_agents_playbook, finance_ai_agents_next_docs, finance_ai_agents_knowledge_graph [INFERRED 0.85]
- **Shared Authentication Flow** — readme_authentication_flow, readme_supabase_auth, finance_ai_changes_documentation_session_expiry, finance_ai_playbook_security_requirements [INFERRED 0.85]
- **Money Write Integrity Reforms** — finance_ai_changes_documentation_integer_cents, finance_ai_changes_documentation_server_validation, finance_ai_changes_documentation_idempotency, finance_ai_changes_documentation_create_transfer_rpc, finance_ai_changes_documentation_account_id_fk [INFERRED 0.85]
- **Pre-Launch Audit Fix Program** — finance_ai_fixes, finance_ai_changes_documentation, finance_ai_changes_documentation_test_suite, finance_ai_fixes_priority_order [EXTRACTED 1.00]

## Communities (65 total, 36 thin omitted)

### Community 0 - "Marketing & Home Dashboard"
Cohesion: 0.07
Nodes (38): AccountCards(), ChartTooltip(), DashboardCharts(), DashboardChartsProps, pieColors, AiPreview(), DashboardMockup(), spendingData (+30 more)

### Community 1 - "Auth & App Header"
Cohesion: 0.12
Nodes (33): AccountBalance, AccountCardsProps, AppHeader(), isActive(), navLinks, AuthFormProps, AuthMode, ChatbotLauncher() (+25 more)

### Community 2 - "Transactions & Settings"
Cohesion: 0.10
Nodes (35): NewUserOnboarding(), getInitialState(), TransactionDialog(), TransactionDialogProps, TransactionFormValues, BannerState, TransactionManagerProps, BannerState (+27 more)

### Community 3 - "Data Dashboard Pages"
Cohesion: 0.10
Nodes (37): AccountsRoute(), metadata, DashboardPage(), metadata, getSingleValue(), getTransactionType(), SearchParamValue, TransactionsPageSearchParams (+29 more)

### Community 4 - "Dev & Build Tooling"
Cohesion: 0.06
Nodes (35): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss, @tailwindcss/postcss (+27 more)

### Community 5 - "Audit Fix Documentation"
Cohesion: 0.08
Nodes (31): Pre-Launch Audit Fixes Documentation, account_id FK for Balance Computation, Atomic Transfer RPC (create_transfer), Write Idempotency via idempotency_key, Integer Cents Money Storage, /api/chat In-Memory Rate Limiter, Sanitized Supabase Error Messages, Server-Side Money Validation (CHECK Constraints + RPCs) (+23 more)

### Community 6 - "Auth Pages & Layout"
Cohesion: 0.10
Nodes (19): metadata, metadata, SignInPage(), metadata, SignUpPage(), AuthForm(), companyLinks, Footer() (+11 more)

### Community 7 - "Account Dialogs & Pages"
Cohesion: 0.12
Nodes (23): AccountBalanceDialog(), BalanceDialogProps, BalanceFormValues, fetchAccountBalances(), AccountDialog(), AccountDialogProps, AccountFormValues, currencyOptions (+15 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (29): class-variance-authority, clsx, dependencies, class-variance-authority, clsx, framer-motion, lucide-react, next (+21 more)

### Community 9 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 10 - "shadcn Component Registry"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "Agent & Graphify Docs"
Cohesion: 0.31
Nodes (9): Custom Next.js Version (Breaking Changes), AGENTS.md (Agent Rules), graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, graphify query command, graphify --update command, Graphify Knowledge Graph, node_modules/next/dist/docs/ (Next.js Reference Docs) (+1 more)

### Community 12 - "Proxy Auth Middleware"
Cohesion: 0.31
Nodes (7): createSupabaseMiddlewareClient(), authPages, cloneCookies(), config, matches(), protectedPaths, proxy()

### Community 13 - "Core Database Schema"
Cohesion: 0.43
Nodes (6): auth.users, public.accounts, public.categories, public.profiles, public.transactions, public.transfers

### Community 14 - "API Routes & Rate Limiting"
Cohesion: 0.39
Nodes (5): POST(), POST(), checkRateLimit(), RateLimitEntry, store

### Community 17 - "Profile Creation Trigger"
Cohesion: 0.40
Nodes (4): on_auth_user_created, public.handle_new_user(), public.accounts, public.handle_new_user

## Ambiguous Edges - Review These
- `Soft Delete with Undo (deleted_at)` → `Soft Delete Reverted (Hard Delete Restored)`  [AMBIGUOUS]
  finance-ai/CHANGES_DOCUMENTATION.txt · relation: conceptually_related_to

## Knowledge Gaps
- **168 isolated node(s):** `metadata`, `metadata`, `metadata`, `metadata`, `metadata` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Soft Delete with Undo (deleted_at)` and `Soft Delete Reverted (Hard Delete Restored)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Button()` connect `Auth & App Header` to `Marketing & Home Dashboard`, `Transactions & Settings`, `Auth Pages & Layout`, `Account Dialogs & Pages`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `cn()` connect `Auth & App Header` to `Marketing & Home Dashboard`, `Transactions & Settings`, `Auth Pages & Layout`, `Account Dialogs & Pages`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `Marketing & Home Dashboard` to `Auth & App Header`, `Transactions & Settings`, `Data Dashboard Pages`, `Account Dialogs & Pages`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `metadata` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Marketing & Home Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.06636500754147813 - nodes in this community are weakly interconnected._
- **Should `Auth & App Header` be split into smaller, more focused modules?**
  _Cohesion score 0.11686274509803922 - nodes in this community are weakly interconnected._