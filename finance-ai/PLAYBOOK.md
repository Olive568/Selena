# Personal Finance AI Agent - Development Playbook v2

## Project Vision

Build a mobile-first AI-powered personal finance web application that acts as a personal financial copilot.

The application should allow users to:

* Create accounts and securely log in
* Track income and expenses
* Categorize transactions
* View spending analytics
* Upload receipts
* Chat with an AI assistant about finances
* Receive proactive financial insights
* Access the application seamlessly from mobile and desktop devices

Primary success metric:

**Logging a transaction should take less than 5 seconds.**

---

# Core Product Philosophy

Most finance applications focus on charts.

This application focuses on:

1. Fast transaction capture
2. Financial awareness
3. Actionable insights
4. Conversational finance

The dashboard exists to support decisions, not simply display data.

---

# Development Rules

## Rule 1: Build Sequentially

Complete the current phase before beginning the next phase.

Priority Order:

1. Authentication
2. Transaction Tracking
3. Dashboard
4. Analytics
5. Receipt Processing
6. AI Categorization
7. AI Assistant
8. Financial Intelligence
9. Forecasting
10. Tax Reporting

Do not skip phases.

---

## Rule 2: Mobile First

Design for:

* 375px
* 390px
* 430px

before designing tablet or desktop layouts.

All screens must remain fully usable on mobile devices.

---

## Rule 3: Simplicity Over Complexity

Prefer:

* Readable code
* Simple architecture
* Clear folder structure
* Reusable components

Avoid:

* Premature optimization
* Microservices
* Complex abstractions
* Enterprise-level architecture

---

# Technology Stack

## Frontend

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons

## Backend

* Supabase

## Database

* PostgreSQL (Supabase)

## Hosting

* Vercel

## AI

* OpenAI API (Future Phases)

---

# Current Project Structure

```text
app/
components/
lib/
public/

.env.local
package.json
```

Supabase client:

```text
lib/supabase.ts
```

---

# Database Architecture

## Authentication

Supabase Auth manages:

* Email
* Password
* Sessions
* Password resets
* Email verification

Passwords must never be stored manually in database tables.

---

## Profiles

```sql
profiles

id UUID PRIMARY KEY
full_name TEXT
created_at TIMESTAMP
```

Purpose:

* User information
* User preferences
* Future profile settings

The profile ID must match auth.users(id).

---

## Categories

```sql
categories

id UUID PRIMARY KEY
user_id UUID
name TEXT
icon TEXT
color TEXT
created_at TIMESTAMP
```

Purpose:

* User transaction categories
* Custom categories
* Future category management

---

## Transactions

```sql
transactions

id UUID PRIMARY KEY
user_id UUID
date DATE
merchant TEXT
amount NUMERIC
transaction_type TEXT
category TEXT
payment_method TEXT
notes TEXT
receipt_url TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

Transaction Types:

```text
income
expense
transfer
```

Every transaction must belong to a user.

---

# Security Requirements

All user-owned tables must use:

* Row Level Security (RLS)
* User-specific access policies

Users must only be able to:

* View their own records
* Insert their own records
* Update their own records
* Delete their own records

No user may access another user's financial data.

---

# Current Development Phase

## Phase 1 — Authentication & Expense Tracking MVP

Status:

IN PROGRESS

Objective:

Create a secure multi-user expense tracking application.

Required Features:

### Authentication

* Register
* Login
* Logout
* Protected Routes

### Profiles

* Create profile on registration
* Link profile to authenticated user

### Transactions

Display:

* Merchant
* Amount
* Category
* Date

### Add Transaction Form

Fields:

* Merchant
* Amount
* Category

Requirements:

* Save directly to Supabase
* Associate with logged-in user
* Refresh UI immediately
* Validate required fields

---

# Phase 1 Success Criteria

User can:

1. Register account
2. Login
3. Create transaction

Example:

Merchant: Jollibee
Amount: 250
Category: Food

4. Save transaction
5. Immediately see transaction in dashboard
6. View only their own transactions

Phase 1 is complete only when all six conditions are met.

---

# Features Explicitly Forbidden During Phase 1

Do NOT build:

* AI Chat
* Receipt Scanning
* OCR
* Budgeting
* Savings Goals
* Forecasting
* Subscription Detection
* Net Worth Tracking
* Assets
* Liabilities
* OpenAI Integration
* Tax Reporting

Focus only on authentication and transaction tracking.

---

# Phase 2 — Financial Tracking

Features:

* Income tracking
* Expense tracking
* Transaction types
* Monthly summaries
* Spending analytics
* Category breakdowns

---

# Phase 3 — AI Expense Processing

Features:

* Receipt upload
* OCR
* Merchant extraction
* AI categorization
* Auto-filled transactions

---

# Phase 4 — AI Financial Assistant

Features:

* Natural language finance queries
* Spending analysis
* Transaction search
* Financial explanations

---

# Phase 5 — Financial Intelligence

Features:

* Budgets
* Alerts
* Subscription detection
* Recurring expense detection
* Financial health score

---

# Phase 6 — Assets & Net Worth

Features:

* Assets
* Liabilities
* Debt tracking
* Net worth dashboard

---

# Phase 7 — Planning & Forecasting

Features:

* Savings goals
* Forecasting
* Affordability analysis
* Long-term planning

---

# Phase 8 — Tax & Reporting

Features:

* Annual reports
* CSV export
* PDF export
* Tax summaries
* Deductible expense tracking

---

# Immediate Next Task

Implement:

1. Register page
2. Login page
3. Supabase Auth integration
4. Profile creation on registration
5. User-linked transactions
6. Transaction list refresh after insert

Do not proceed to another phase until this functionality works completely.

---

# Agent Workflow

Before writing code:

1. Verify current phase
2. Verify task belongs to current phase
3. Review existing structure
4. Reuse existing components

After writing code:

1. Ensure TypeScript passes
2. Ensure mobile responsiveness
3. Ensure Supabase integration works
4. Ensure RLS is respected
5. Ensure existing functionality remains intact

Always prioritize working functionality over new features.
