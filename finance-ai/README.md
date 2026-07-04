# finance-ai

finance-ai is a Next.js + Supabase personal finance dashboard for tracking income, expenses, and transfers. It includes authentication, transaction filtering, category and account management, and summary charts for a quick view of cash flow.

## Features

- Email/password authentication with Supabase
- Dashboard view for this month's activity and cash flow
- Transaction list with filtering by month, type, category, and sort order
- Shared and user-owned categories/accounts
- Expense breakdown and summary metrics
- Modern UI built with Next.js, Tailwind CSS, and shadcn/ui components

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Supabase
- Tailwind CSS
- Recharts

## Getting started

### Prerequisites

- Node.js 20 or newer
- A Supabase project

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` file in the project root and add your Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

If you are using additional server-side credentials in your own deployment, keep them out of the browser bundle and follow Supabase's recommended security practices.

For the future chatbot shell, the repo also includes a `.env.example` file with placeholder OpenAI settings. Those values are intentionally empty or non-sensitive until the assistant backend is added:

```bash
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_CHAT_ASSISTANT_ID=
```

### 3) Set up the database

Run the migrations in `supabase/migrations/` against your Supabase project. These migrations create the profile trigger and visibility rules for categories and accounts.

### 4) Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project structure

- `app/` - Next.js routes, layouts, and pages
- `components/` - UI and feature components
- `lib/` - Supabase helpers and finance utilities
- `supabase/migrations/` - SQL migrations for database setup
- `public/` - Static assets

## Authentication flow

- Unauthenticated users are redirected to `/login`
- New users can register from `/register`
- Authenticated users land on the main dashboard and can manage transactions from there

## Data model notes

- Transactions are scoped to the current user
- Categories and accounts may be shared globally or owned by a specific user
- Dashboard totals are normalized in `lib/finance.ts` before rendering

## Deployment

This app can be deployed on any platform that supports Next.js, including Vercel.

Before deploying, make sure:

- your Supabase environment variables are configured
- the database migrations have been applied
- any required auth redirect URLs are set in Supabase

## Contributing

Contributions are welcome. If you plan to add a feature or change the data model, please open an issue or share your approach first so we can keep the schema and UI in sync.

## License

Add your preferred open-source license here if you plan to publish the project publicly.
