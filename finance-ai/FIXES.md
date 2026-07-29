# Selena Right — Pre-Launch Audit Fixes

Instructions for the AI coding agent. Work through these in priority order (blockers first). Each fix includes the root cause, files to modify, and the exact change required. Do not skip items.

---

## BLOCKERS

### 1. Add tests (zero tests exist)

**Why:** Every refactor or deploy is blind. The financial math (`normalizeTransaction`, `buildMetrics`, `buildCategoryBreakdown`, `formatCurrency`, date helpers) has zero verification.

**Do:**
- Add test deps to `package.json`:
  ```json
  "devDependencies": {
    "vitest": "^3",
    "@testing-library/react": "^16",
    "jsdom": "^26"
  }
  ```
- Add to `package.json` scripts:
  ```json
  "test": "vitest run",
  "test:watch": "vitest"
  ```
- Create `vitest.config.ts` at project root with jsdom environment.
- Create `lib/__tests__/finance.test.ts` with tests for every function in `lib/finance.ts`:
  - `normalizeTransaction` — null fields, missing fields, transfer/income/expense, zero amount
  - `buildMetrics` — mixed transactions, empty array, only income, only expense
  - `buildCategoryBreakdown` — multiple txns in same category, empty, only income txns
  - `formatCurrency` — zero, negative, large numbers
  - `getDashboardDateRange` — each range value, boundary dates
  - `getMonthDateRange` — month boundaries, leap year February
  - `normalizeCategory`, `normalizeAccount` — null user_id, missing name
- Create tests for account balance computation logic from `account-cards.tsx`

---

## CRITICAL

---

### 9. Add server-side validation for all money writes

**Why:** All mutations went directly from browser to Supabase via the anon key. No server-side validation existed for amounts.

**Solution:** CHECK constraints + RPCs with validation (see CHANGES_DOCUMENTATION.txt)

---

### 10. Fix floating-point accumulation in all money math

**Why:** `Number()` in JS is IEEE-754 double. `0.1 + 0.2 = 0.30000000000000004`.

**Solution:** All amounts stored as integer cents. See CHANGES_DOCUMENTATION.txt

---

### 11. Add timeout to Groq fetch

**Solution Applied.** `AbortController` with 15s timeout in `app/api/chat/route.ts`. Returns 504 on timeout.

---

### 12. Show onboarding balance errors

**Solution Applied.** Empty `catch {}` replaced with `setBalanceError()`, error displayed inline, no longer advances on failure.

---

### 14. Add confirmation before transfer

**Solution Applied.** AlertDialog with from→to+amount shown before transfer executes.

---

### 13 + 15. Rate limiting + CHECK constraints

**Rate limiting:** Applied — in-memory 20 req/min/IP via x-forwarded-for.

**CHECK constraints:** Already done in fix #9 migrations.

---

## MAJOR

### 17. Build password-reset page

**Solution Applied.** `app/forgot-password/page.tsx`, `app/update-password/page.tsx`, "Forgot password?" link in `auth-form.tsx`.

---

### 18. Build account deletion

**Solution Applied.** `/api/delete-account` route (service role) + `/settings` page with confirmation dialog.

---

### 19. Add health endpoint

**Solution Applied.** `app/api/health/route.ts` returns `{ status: "ok", timestamp }`.

---

### 20. Rename proxy.ts to middleware.ts

**Reverted.** This version of Next.js expects `proxy.ts` — kept the original name.

---

### 21. Add unique constraint on categories

**Solution Applied.** Migration `20260729_unique_category_name.sql` with dedup + unique index.

---

### 23. Sanitize Supabase error messages before display

**Solution Applied.** `sanitizeError()` added to `lib/supabase.ts` and applied in all catch/display sites.

---

### 25. Add field length limits

**Solution Applied.** Migration `20260729_field_length_limits.sql` + `maxLength` on all relevant inputs.

---

## MINOR

### 26. Add retry button on chat error

**Solution Applied.** Retry button next to error banner, uses `lastSentRef` to re-send the last message.

---

### 27. Graceful env-var missing handling

**Solution Applied.** All `!` assertions replaced with explicit checks across 5 files.

---

### 22. Confirm before delete

**Solution Applied.** Confirmation AlertDialog (already existed). Soft delete removed, replaced hard delete RPC back. `.is('deleted_at', null)` filters removed.
