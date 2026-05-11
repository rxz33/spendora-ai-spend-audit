# Folder Structure Guide

This document explains the folder organization and why files are placed where they are.

---

## Quick Reference

```
spendora-ai-spend-audit/
├── app/                    → Next.js routes & layouts (server by default)
├── components/             → React components (client)
├── lib/                    → Shared logic (browser + server safe)
├── server/                 → Server-only code ('use server')
├── types/                  → TypeScript types & interfaces
├── data/                   → Static data & constants
├── hooks/                  → React hooks (client only)
├── public/                 → Static assets
└── tests/                  → Unit tests
```

---

## Detailed Breakdown

### 📱 `app/` — Next.js Routes & Layouts

**Files run on SERVER by default** (unless marked `'use client'`).

| File/Folder | Purpose | Runs On |
|-------------|---------|---------|
| `app/page.tsx` | Homepage with spend form | Server (has `'use client'`) |
| `app/layout.tsx` | Root layout | Server |
| `app/audit/[id]/page.tsx` | Shareable audit results page | Server (has `'use client'`) |
| `app/api/audit/route.ts` | Save audit to DB | Server |
| `app/api/generate-summary/route.ts` | AI summary generation | Server |
| `app/api/capture-lead/route.ts` | Lead capture + email | Server |

**Why here?** Next.js routing convention. API routes handle server-only logic.

---

### ⚛️ `components/` — React Components

**Files are CLIENT components** (use `'use client'` directive).

| File | Purpose |
|------|---------|
| `spend-form.tsx` | Multi-tool audit input form |
| `audit-results.tsx` | Results display & recommendations |
| `ui/button.tsx` | shadcn/ui button component |
| `ui/card.tsx` | shadcn/ui card component |
| `ui/input.tsx` | shadcn/ui input component |
| `ui/select.tsx` | shadcn/ui select component |
| `ui/textarea.tsx` | shadcn/ui textarea component |

**Why here?** All UI components. `'use client'` directive marks them as client-only.

---

### 📦 `lib/` — Shared Business Logic

**Files are SAFE FOR BOTH browser and server** (no API credentials, no `'use server'`).

| File | Purpose | Type |
|------|---------|------|
| `audit-engine.ts` | Core audit logic (runs 5 rules) | Pure function |
| `plan-rules.ts` | Inefficient plan detection rules | Constants + helpers |
| `credit-optimization.ts` | Credit-based savings logic | Constants + helpers |
| `tool-capabilities.ts` | Vendor metadata (features/pricing) | Constants |
| `utils.ts` | Utility functions (cn, etc.) | Pure functions |
| `supabase.ts` | **DEPRECATED** — Use `server/supabase.ts` | ⚠️ (marked `'use server'`) |

**Why here?** These are **deterministic, testable functions** with no side effects:
- No API credentials exposed
- No database queries
- Work on browser or server

**Example:**
```tsx
// lib/audit-engine.ts - runs on client AND server
export function runAudit(tools: ToolSpend[]): AuditRecommendation[] {
  // Pure TypeScript logic - no external dependencies
  return tools.map(tool => generateRecommendation(tool));
}

// client-side usage
const results = runAudit(validatedTools);  // ✅ Works

// server-side usage  
const results = runAudit(validatedTools);  // ✅ Also works
```

---

### 🔐 `server/` — Server-Only Code

**Files MUST be marked with `'use server'`** at the top.

**Never imported by client components.**

| File | Purpose |
|------|---------|
| `supabase.ts` | Database client (Supabase) |
| (planned) `email.ts` | Transactional email logic (Resend) |
| (planned) `db.ts` | Database query helpers |

**Why here?** These files contain:
- API credentials (environment variables)
- Database connection strings
- External service integrations
- Should NEVER be sent to browser

**Example:**
```tsx
// server/supabase.ts
'use server';  // ← CRITICAL - prevents browser import

import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  // process.env.NEXT_PUBLIC_SUPABASE_URL is safe here
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}
```

**If you accidentally import this on client:**
```tsx
// components/my-component.tsx
import { getSupabaseClient } from "@/server/supabase";  // ❌ ERROR!
// Next.js will throw: "Cannot use server-only code in client component"
```

---

### 🏷️ `types/` — TypeScript Types

| File | Purpose |
|------|---------|
| `audit.ts` | Audit types (discriminated unions) |
| `forms.ts` | Form types (FormToolInput, ValidatedTool) |

**Why here?** Centralized type definitions prevent duplication.

**Key distinction:**
```tsx
// types/forms.ts
export interface FormToolInput {
  tool: string;
  plan: string;
  monthlySpend: string;  // ← Form is always strings
  seats: string;
  teamSize: string;
  useCase: string;
}

export interface ValidatedTool {
  tool: string;
  plan: string;
  monthlySpend: number;  // ← Validated is typed properly
  seats: number;
  teamSize: number;
  useCase: string;
}

// types/audit.ts
export type AuditRecommendation =
  | { type: "no-savings"; ... }
  | { type: "plan-downgrade"; ... }
  | { type: "tool-switch"; ... }
  // etc. — discriminated union forces exhaustive handling
```

---

### 📊 `data/` — Static Data

| File | Purpose |
|------|---------|
| `pricing.ts` | Vendor pricing (Claude, ChatGPT, Cursor, etc.) |

**Why here?** Centralized product data. Can be:
- Imported by client & server
- Cached at build time
- Updated independently

---

### 🪝 `hooks/` — React Hooks

| File | Purpose |
|------|---------|
| `use-local-storage.ts` | localStorage persistence (client-safe) |

**Why here?** Client-only hooks that wrap browser APIs.

---

### ✅ `tests/` — Unit Tests

| File | Purpose |
|------|---------|
| `audit-engine.test.ts` | Tests for audit logic |

**Run with:** `npm run test`

---

## Import Patterns

### ✅ GOOD Patterns

```tsx
// Client component using shared lib
'use client';
import { runAudit } from '@/lib/audit-engine';     // ✅ OK

// Server route using shared lib
import { runAudit } from '@/lib/audit-engine';     // ✅ OK

// Client component using types
import { type AuditRecommendation } from '@/types/audit';  // ✅ OK

// Server route using server-only code
'use server';
import { getSupabaseClient } from '@/server/supabase';  // ✅ OK
```

### ❌ BAD Patterns

```tsx
// Client component importing server code
'use client';
import { getSupabaseClient } from '@/server/supabase';  // ❌ ERROR
// Next.js: "Cannot use server-only code in client component"

// Importing from lib with credentials
import { API_SECRET } from '@/lib/config';  // ❌ Exposes to browser

// Circular imports
// types/audit.ts imports from lib/audit-engine.ts
// lib/audit-engine.ts imports from types/audit.ts  // ❌ Avoid
```

---

## When to Create New Folders

### Create `utils/` if:
- You have 5+ shared utility functions
- Functions don't fit cleanly into `lib/`
- Example: date formatting, string parsing, etc.

```
utils/
├── dates.ts
├── strings.ts
└── validation.ts
```

### Create `constants/` if:
- You have 5+ constant files in `data/`
- Want to separate business constants from feature data

```
constants/
├── audit-rules.ts
├── vendor-metadata.ts
└── error-messages.ts
```

### Create `services/` if:
- You have multiple server-only integrations
- Example: email service, payment service, analytics

```
server/
├── supabase.ts
├── email-service.ts
└── resend.ts
```

---

## Token-Saving Tips

1. **Keep `lib/` pure** — No API calls, no side effects, no credentials
2. **Use `server/`** — All server-only logic in one place
3. **Discriminated unions** — Eliminate `null | undefined` handling
4. **Type guards** — Use `validateTool()` to separate form from validated data
5. **One file = One responsibility** — audit-engine does audits, not email

---

## Summary

| Folder | Runs On | Purpose |
|--------|---------|---------|
| `app/` | Server (mostly) | Routes & API |
| `components/` | Client | UI & Forms |
| `lib/` | Both | Shared logic (pure functions) |
| `server/` | Server only | DB, email, credentials |
| `types/` | Both | TypeScript definitions |
| `data/` | Both | Static data |
| `hooks/` | Client | React hooks |
| `tests/` | Test runner | Unit tests |
