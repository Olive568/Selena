# Selena — Personal Finance AI

Selena is a mobile-first personal finance dashboard built with Next.js 16 and Supabase. Track income, expenses, and transfers, view account balances, filter transaction history, and chat with an AI assistant about your finances.

## Features

- Email/password authentication with Supabase
- Dashboard with account balance cards and monthly summaries
- Expense/income/transfer transaction management
- Transaction list with filtering by month, type, category, and sort
- Category breakdown pie chart (Recharts)
- Shared and user-owned categories and accounts
- AI chatbot powered by Groq (Llama 3.3 70B) — asks about your transactions within a date range
- New user onboarding wizard with optional initial balance setup
- Dark/light theme toggle
- Modern mobile-first UI with Tailwind CSS and shadcn/ui

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Supabase (Auth, PostgreSQL, RLS)
- Tailwind CSS
- Recharts
- Groq API (AI chatbot)

## Getting started

### Prerequisites

- Node.js 20 or newer
- A Supabase project
- A Groq API key (free, [groq.com](https://groq.com))

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=gsk_your_groq_key
```

The `NEXT_PUBLIC_` variables are safe to expose to the browser (Supabase anon key is protected by RLS). `GROQ_API_KEY` is server-side only and never leaves the `/api/chat` route handler.

### 3) Set up the database

Run `supabase/migrations/20260728_full_schema.sql` in your Supabase SQL editor. This creates all tables (profiles, categories, accounts, transactions, transfers), enables Row Level Security, and sets up the auto-profile trigger that creates starter accounts on registration.

### 4) Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Project structure

- `app/` — Next.js routes, layouts, pages, and API routes
- `components/` — UI and feature components (accounts, chatbot, charts, transactions)
- `lib/` — Supabase clients, finance utilities, type definitions
- `supabase/migrations/` — SQL migrations for database setup
- `public/` — Static assets

## Authentication flow

- Unauthenticated users are redirected to `/login`
- New users can register from `/register`
- On first sign-in, users with no transactions see an onboarding wizard that guides them through setting initial account balances and adding their first transaction
- Authenticated users land on the main dashboard

## Data model notes

- Transactions are scoped to the current user via RLS
- Categories and accounts may be shared globally (`user_id IS NULL`) or owned by a specific user
- Account balances are calculated from income/expense transactions (via `payment_method`) and transfers between accounts
- Dashboard totals are normalized in `lib/finance.ts` before rendering

## AI Chatbot

The chatbot (bottom-left corner) accepts a date range and answers questions about transactions within that period. It uses Groq's Llama 3.3 70B model via a server-side route handler at `/api/chat`. 

## Deployment

This app can be deployed on Vercel or any platform that supports Next.js.

Before deploying, make sure:

- Supabase environment variables and `GROQ_API_KEY` are configured in your host's dashboard
- The database migration (`20260728_full_schema.sql`) has been applied to your Supabase project
- Your Supabase project Auth settings include your deployment URL in the allowed redirect origins
- Your Supabase project is not paused (free tier projects pause after 7 days of inactivity)

## License

Add your preferred open-source license here if you plan to publish the project publicly.
