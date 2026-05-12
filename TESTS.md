# Automated Tests

## Coverage

**File:** `tests/audit-engine.test.ts`  
**Framework:** Vitest  
**Current Status:** **7/7 tests passing** ✅

## Test Cases

| # | Test | What It Checks |
|----|------|----------------|
| 1 | `recommends GitHub Copilot for Cursor users` | Tool swap suggestions work |
| 2 | `calculates monthly savings correctly` | Savings math is accurate |
| 3 | `calculates annual savings correctly` | Annual extrapolation (×12) works |
| 4 | `detects inefficient small-team plans` | Plan downgrades are suggested |
| 5 | `detects capability mismatch for use case` | Wrong-tool-for-job detection |
| 6 | `returns no-savings when already optimized` | Honest audits for efficient spend |
| 7 | `aggregates stack-level insights correctly` | Fragmentation + optimization scoring |

## Run Tests

```bash
# Run all tests once
npm run test

# Watch mode (re-run on file changes)
npm run test -- --watch

# With coverage report
npm run test -- --coverage
```

## CI Integration

GitHub Actions runs tests on every push to `main`:
- Lint: `npm run lint`
- Build: `npm run build`  
- Tests: `npm run test`

**TODO:** Add `npm run test` to CI pipeline in `.github/workflows/ci.yml`