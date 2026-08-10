# Selena — Personal Finance AI

**Project Context for AI Assistants**

---

## Project Overview

**Selena** is a mobile-first personal finance dashboard built with Next.js 16 (App Router) and Supabase. It enables users to track income, expenses, and transfers, view account balances, filter transaction history, and chat with an AI assistant about their finances.

**Primary Goal**: Logging a transaction should take less than 5 seconds.

**Current Phase**: Phase 1 — Authentication & Expense Tracking MVP (IN PROGRESS)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 16 (App Router) |
| React Version | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (email/password) |
| Real-time/Storage | Supabase (RLS policies) |
| Charts | Recharts |
| AI Chat | Groq API (Llama 3.3 70B) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |

---

## Project Structure

```
finance-ai/
├── app/                          # Next.js App Router pages & API routes
│   ├── api/
│   │   └── chat/route.ts         # AI chatbot endpoint (Groq)
│   ├── dashboard/page.tsx        # Main dashboard (server component)
│   ├── transactions/page.tsx     # Full transaction list with filters
│   ├── sign-in/page.tsx          # Login page
│   ├── sign-up/page.tsx          # Registration page
│   ├── forgot-password/page.tsx  # Password reset request
│   ├── update-password/page.tsx  # Password reset completion
│   ├── terms/page.tsx            # Terms of service
│   ├── globals.css               # Global styles + CSS variables
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Marketing landing page
├── components/
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx, card.tsx, dialog.tsx, etc.
│   ├── marketing/                # Landing page sections
│   │   ├── hero.tsx, features.tsx, navbar.tsx, etc.
│   ├── account-cards.tsx         # Account balance cards
│   ├── account-dialog.tsx        # Create/edit account modal
│   ├── account-balance-dialog.tsx# Opening balance setup
│   ├── accounts-page.tsx         # Accounts management page
│   ├── transaction-manager.tsx   # Core dashboard logic (client)
│   ├── transaction-dialog.tsx    # Add/edit transaction modal
│   ├── transaction-row-item.tsx  # Single transaction row
│   ├── transactions-page.tsx     # Full transactions list client
│   ├── monthly-summary.tsx       # Monthly income/expense summary
│   ├── dashboard-charts.tsx      # Recharts pie chart
│   ├── dashboard-charts-shell.tsx# Chart wrapper
│   ├── chatbot-launcher.tsx      # AI chat floating button
│   ├── new-user-onboarding.tsx   # First-time user wizard
│   ├── theme-toggle.tsx          # Dark/light mode switch
│   ├── global-chrome.tsx         # Shared layout chrome
│   ├── footer.tsx                # Marketing footer
│   └── auth-form.tsx             # Reusable auth form
├── lib/
│   ├── finance.ts                # Core types, normalization, calculations
│   ├── supabase.ts               # Browser Supabase client
│   ├── supabase-server.ts        # Server Supabase client (SSR)
│   ├── supabase-middleware.ts    # Auth middleware for route protection
│   ├── rate-limit.ts             # Simple in-memory rate limiter
│   ├── utils.ts                  # cn() className helper
│   └── __tests__/finance.test.ts # Unit tests for finance utilities
├── supabase/
│   └── migrations/               # SQL migrations (run in order)
│       ├── 20260728_full_schema.sql    # Base schema + RLS + trigger
│       └── ... (incremental migrations)
├── public/                       # Static assets
├── .env.local                    # Local environment variables
├── .env.example                  # Template for env vars
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── vitest.config.ts
├── components.json               # shadcn/ui config
├── postcss.config.mjs
├── AGENTS.md                     # Agent instructions
├── CLAUDE.md                     # Points to AGENTS.md
├── PLAYBOOK.md                   # Development playbook & phases
└── CHANGES_DOCUMENTATION.txt     # Change log
```

---

## Database Schema

### Tables

**profiles**
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
full_name TEXT
created_at TIMESTAMPTZ
```

**categories**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES auth.users(id)  -- NULL = shared/global
name TEXT NOT NULL
icon TEXT
color TEXT
created_at TIMESTAMPTZ
```

**accounts**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES auth.users(id)  -- NULL = shared/global
name TEXT NOT NULL
institution TEXT
currency TEXT DEFAULT 'PHP'
created_at TIMESTAMPTZ
opening_balance NUMERIC  -- Added in later migration
```

**transactions**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES auth.users(id) NOT NULL
date DATE NOT NULL
merchant TEXT NOT NULL
amount NUMERIC NOT NULL  -- Stored in cents (integer)
transaction_type TEXT CHECK IN ('income', 'expense', 'transfer')
category TEXT
payment_method TEXT
notes TEXT
receipt_url TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**transfers**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES auth.users(id) NOT NULL
from_account_id UUID REFERENCES accounts(id)
to_account_id UUID REFERENCES accounts(id)
amount NUMERIC NOT NULL
date DATE NOT NULL
notes TEXT
created_at TIMESTAMPTZ
```

---

## Row Level Security (RLS)

All tables have RLS enabled with policies:

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| profiles | own only | own only | own only | - |
| categories | user_id IS NULL OR own | own only | own only | own only |
| accounts | user_id IS NULL OR own | own only | own only | own only |
| transactions | own only | own only | own only | own only |
| transfers | own only | own only | own only | own only |

**Key Design**: Categories and accounts can be **shared globally** (`user_id IS NULL`) or **user-owned**.

---

## Authentication Flow

1. **Unauthenticated users** → redirected to `/sign-in`
2. **Registration** → `/sign-up` creates Supabase Auth user
3. **Auto-profile trigger** (`handle_new_user`) on `auth.users` insert:
   - Creates profile row
   - Creates 6 default accounts: Cash Wallet, GCash, Maya, Bank Account, Savings Account, Credit Card
4. **First sign-in** → If no transactions, shows onboarding wizard for initial balances
5. **Authenticated users** → land on `/dashboard`

**Supabase Clients**:
- `lib/supabase.ts` — Browser client (client components)
- `lib/supabase-server.ts` — Server client (server components, API routes)
- `lib/supabase-middleware.ts` — Middleware for route protection

---

## Core Features

### 1. Transaction Management
- **Types**: Income, Expense, Transfer
- **Fields**: Merchant, Amount (cents), Date, Category, Payment Method, Notes
- **Validation**: Required fields, positive amounts, category for expenses
- **Idempotency**: RPC calls use `p_idempotency_key` (UUID v4)

### 2. Account Balances
- Calculated from:
  - Opening balance (per account)
  - Income/Expense transactions (via `payment_method` → account)
  - Transfers between accounts
- Computed in `lib/finance.ts::computeAccountBalancesInCents()`

### 3. Dashboard
- Account balance cards
- Monthly summary (income/expense/net)
- Category breakdown pie chart (expenses only)
- Recent transactions list (5 latest)
- Date range filter: This Month / Last Month / Last 3 Months / This Year / All Time

### 4. Transaction List Page (`/transactions`)
- Full paginated list
- Filters: Month, Type, Category, Sort
- Inline edit/delete

### 5. AI Chatbot
- Floating button (bottom-left)
- Accepts date range + natural language question
- Server-side `/api/chat` route → Groq (Llama 3.3 70B)
- Returns answer based on user's transactions in that period

### 6. New User Onboarding
- Shows on first login if no transactions
- Sets opening balances for default accounts
- Guides to add first transaction

### 7. Theme Support
- Dark/Light mode toggle
- Persisted in localStorage
- CSS variables in `globals.css`

---

## Key Types (from `lib/finance.ts`)

```typescript
// Raw DB rows
TransactionRow: { id, merchant, category, amount, date, transaction_type, payment_method, notes, user_id, account_id }
CategoryRow: { id, name, user_id }
AccountRow: { id, name, user_id, institution, currency, opening_balance }

// Normalized for UI
DashboardTransaction: { id, dbId, merchant, category, notes, amount, date, transactionType, paymentMethod, accountId }
DashboardCategory: { id, dbId, name, userId }
DashboardAccount: { id, dbId, name, userId, institution, currency, openingBalance }

// Calculations
DashboardMetrics: { totalIncome, totalExpenses, netCashFlow, count }
CategoryBreakdownItem: { name, amount }
```

---

## API Routes

### `POST /api/chat`
**Body**: `{ messages: [{ role, content }], dateRange: { start, end } }`
**Action**: Fetches user's transactions in date range, sends to Groq with context
**Returns**: `{ answer: string }`

---

## RPC Functions (Supabase)

| Function | Purpose |
|----------|---------|
| `create_transaction` | Insert transaction with idempotency |
| `update_transaction` | Update transaction (owner check) |
| `delete_transaction` | Delete transaction (owner check) |
| `create_transfer` | Atomic transfer between accounts |
| `create_category` | Insert category with idempotency |
| `create_account` | Insert account with idempotency |

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=gsk_your_groq_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run Vitest tests
npm run test:watch # Watch mode tests
```

---

## Development Phases (from PLAYBOOK.md)

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Auth + Expense Tracking MVP | IN PROGRESS |
| 2 | Financial Tracking (income, monthly summaries, analytics) | Pending |
| 3 | AI Expense Processing (receipts, OCR, categorization) | Pending |
| 4 | AI Financial Assistant (natural language queries) | Pending |
| 5 | Financial Intelligence (budgets, alerts, subscriptions) | Pending |
| 6 | Assets & Net Worth | Pending |
| 7 | Planning & Forecasting | Pending |
| 8 | Tax & Reporting | Pending |

**Phase 1 Success Criteria**: User can register, login, create transaction, save, see it immediately, view only own data.

---

## Forbidden in Phase 1
- AI Chat, Receipt Scanning, OCR, Budgeting, Savings Goals, Forecasting, Subscription Detection, Net Worth Tracking, Assets/Liabilities, OpenAI Integration, Tax Reporting

---

## Key Implementation Details

### Amount Storage
- All amounts stored as **integer cents** in DB
- `lib/finance.ts` normalizes: `amount / 100` for display
- `formatCurrency()` uses PHP locale (en-PH)

### Date Handling
- Input: `YYYY-MM-DD` strings
- `getDashboardDateRange()` computes start/end for filter options
- `normalizeTransaction()` falls back to `created_at` or today

### Category/Account Visibility
- Global defaults (`user_id IS NULL`) always visible
- User-owned items filtered by `user_id`
- Handled in `.or('user_id.is.null,user_id.eq.{userId}')` queries

### Transfer Logic
- Creates 2 transaction rows (transfer out + transfer in) via `create_transfer` RPC
- Merchant: `"Transfer: Source → Destination"`
- Category: `"Transfer"` (excluded from expense charts)
- `isGeneratedTransferTransaction()` detects these for UI disabling

### Testing
- Vitest with jsdom
- Tests in `lib/__tests__/finance.test.ts`
- Run with `npm run test`

---

## Deployment Checklist

- [ ] Supabase env vars configured in host dashboard
- [ ] `GROQ_API_KEY` configured (server-side only)
- [ ] Run `20260728_full_schema.sql` in Supabase SQL editor
- [ ] Supabase Auth redirect origins include deployment URL
- [ ] Supabase project not paused (free tier pauses after 7 days inactivity)

---

## Useful Commands for AI Context

```bash
# View current git status
git status

# See recent changes
git log --oneline -10

# Check for lint errors
npm run lint

# Run tests
npm run test

# Type check
npx tsc --noEmit
```

---

## Common Questions for AI

**Q: How do I add a new transaction type?**
A: Update `TransactionType` in `lib/finance.ts`, add CHECK constraint in migration, update `normalizeTransaction()`, update UI in `transaction-dialog.tsx`, add RPC handling.

**Q: How are account balances calculated?**
A: `computeAccountBalancesInCents()` in `lib/finance.ts` — starts with opening_balance, adds income, subtracts expenses, applies transfers.

**Q: Where is the AI chat logic?**
A: `app/api/chat/route.ts` — fetches transactions, builds prompt, calls Groq.

**Q: How does onboarding work?**
A: `NewUserOnboarding` component checks `localStorage` flag, shows if `initialTransactions.length === 0`.

**Q: How to run migrations?**
A: Copy `supabase/migrations/20260728_full_schema.sql` into Supabase SQL editor and run. Subsequent migrations run in order.

---

*Generated for AI context — Selena Personal Finance AI*