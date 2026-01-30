# BlueShark Wage Module - Issues Tracker

**Created:** 2026-01-28
**Status:** Ready for Implementation

---

## Issues Summary

| # | Issue | Severity | Status | Scope |
|---|-------|----------|--------|-------|
| 1 | Historical worker_logs have unit_price = 0 | **Critical** | Not Fixed | Database |
| 2 | Nepali date stored as year 2082 in database | **Critical** | Workaround only | Backend + Database |
| 3 | unit_price validation allows 0 silently | **High** | Not Fixed | Frontend |
| 4 | Workers without wage_rate have no guardrail | **Medium** | Not Fixed | Frontend (Admin) |
| 5 | Payment tracking does not exist | **High** | Not Built | Full Stack (New Feature) |
| 6 | Phase 4 testing never completed | **Medium** | 0/14 done | QA |

---

## Issue 1: Historical worker_logs have unit_price = 0

**Severity:** Critical
**Impact:** All existing worker wages show Rs. 0.00 in the Wage Dashboard

### Problem

Before the unit_price field was added to supervisor modals, all worker_log entries were saved without a unit_price. The backend defaults it to 0 or null.

Wage formula: `amount = quantity_worked × unit_price`
Result: `amount = quantity_worked × 0 = 0`

Every worker's total wages display as Rs. 0.00.

### Root Cause

The `unit_price` field was missing from `AlteredTaskDetailsModal.tsx` and `RejectedTaskDetailsModal.tsx`. The field has since been added (Phase 1 of wage-feature-todo.md), but old data remains broken.

### Fix Required

Update all existing `worker_logs` records in the database — set `unit_price` to the worker's `wage_rate` from the `workers` table.

```sql
UPDATE worker_logs
SET unit_price = workers.wage_rate
FROM workers
WHERE worker_logs.worker_id = workers.id
AND (worker_logs.unit_price IS NULL OR worker_logs.unit_price = 0);
```

### Files Involved

- Database: `worker_logs` table
- Reference: `workers` table (`wage_rate` column)

---

## Issue 2: Nepali Date Stored as Year 2082

**Severity:** Critical
**Impact:** Date filtering is completely broken. Dates display incorrectly in Activity History.

### Problem

The Nepali date picker returns dates in Bikram Sambat format (e.g., `2082-08-16`). The backend does `new Date("2082-08-16")`, which JavaScript interprets as August 16, 2082 AD (Gregorian) — 57 years in the future.

### Evidence

- Activity History shows dates like `8/16/2082`
- Filtering wages by date range (e.g., 2024-2025) returns 0 results because stored dates are in year 2082
- Date filtering in `WageCalculation.tsx` is currently disabled as a workaround

### Root Cause

`blueshark-backend-test/backend/src/services/workerLogService.ts` line 112:
```typescript
new Date(data.work_date)  // Parses "2082-08-16" as year 2082 AD
```

No Nepali-to-Gregorian conversion happens before storing.

### Fix Required

**A) Backend fix (going forward):** Convert Nepali dates to Gregorian before storing in `workerLogService.ts`:
```typescript
// Convert Nepali date "2082-08-16" → Gregorian "2025-12-02"
import { NepaliDateConverter } from 'nepali-date-converter';
const gregorianDate = NepaliDateConverter.toGregorian(nepaliDate);
```

**B) Database fix (existing data):** Convert all existing wrong dates (year 2082) back to correct Gregorian dates.

### Files Involved

- `blueshark-backend-test/backend/src/services/workerLogService.ts` (line 112)
- Database: `worker_logs` table (`work_date` column)
- Frontend workaround: `src/app/Dashboard/components/views/WageCalculation.tsx` (date filtering disabled)

---

## Issue 3: unit_price Validation Allows 0 Silently

**Severity:** High
**Impact:** Supervisor can submit worker assignments with unit_price = 0 without any warning. Wages calculate as 0.

### Problem

Current validation in both supervisor modals:
```typescript
const parsedUnitPrice = unitPrice && unitPrice.trim() ? parseFloat(unitPrice) : 0;
if (isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
    showToast('error', 'Please enter a valid unit price (0 or greater)');
    return;
}
```

If the supervisor leaves the field blank, it silently defaults to 0. The validation only blocks negative values, not 0.

### Fix Required

Change validation to require unit_price > 0:
```typescript
if (isNaN(parsedUnitPrice) || parsedUnitPrice <= 0) {
    showToast('error', 'Please enter a valid unit price greater than 0');
    return;
}
```

### Files Involved

- `src/app/SupervisorDashboard/depcomponents/altered/AlteredTaskDetailsModal.tsx` (line ~279)
- `src/app/SupervisorDashboard/depcomponents/rejected/RejectedTaskDetailsModal.tsx` (line ~253)

---

## Issue 4: Workers Without wage_rate Have No Guardrail

**Severity:** Medium
**Impact:** If admin creates a worker without setting wage_rate, the auto-fill in supervisor modals has nothing to fill. Supervisor may not notice and submit with 0.

### Problem

When admin creates a worker, `wage_rate` is not strictly required. A worker with `wage_rate = 0` or null means:
- Supervisor selects this worker in the modal
- Auto-fill tries to read `worker.wage_rate` → gets 0 or nothing
- unit_price field shows empty or 0
- Combined with Issue 3, this silently saves as 0

### Fix Required

Either:
- **Option A:** Make `wage_rate` required and > 0 when creating/editing a worker in the Admin Dashboard
- **Option B:** Show a warning in the supervisor modal when the selected worker has no wage_rate: "This worker has no default rate. Please enter a unit price manually."

### Files Involved

- `src/app/Dashboard/components/views/Worker.tsx` (admin worker creation form)
- `src/app/SupervisorDashboard/depcomponents/altered/AlteredTaskDetailsModal.tsx`
- `src/app/SupervisorDashboard/depcomponents/rejected/RejectedTaskDetailsModal.tsx`

---

## Issue 5: Payment Tracking Does Not Exist

**Severity:** High
**Impact:** No way to know if a worker has been paid. System calculates wages but cannot track disbursements.

### What Exists

The Wage Management module calculates wages:
- How much each worker earned (billable vs non-billable)
- Dashboard with totals, per-worker breakdown
- CSV export

### What Is Missing

The system cannot answer:
- Has this worker been paid?
- When was the payment made?
- How much is still unpaid?
- What payment method was used?

### Missing Components

**Database:**
- No `is_paid` field on `worker_logs`
- No `payment_date` field
- No `payment_status` (PENDING / PAID / PARTIAL)
- No `payments` table for recording disbursements

**Backend:**
- No payment service
- No payment API endpoints
- No payroll management logic

**Frontend:**
- No "Mark as Paid" button
- No payment status column in wage tables
- No payment history view
- No unpaid/paid filters

### Scope

This is a new feature that requires:
1. Database schema changes (new table or new fields)
2. Backend service + controller + routes
3. Frontend UI additions to the existing Wage Management module

### Files Involved

- New: Payment service, controller, routes (backend)
- New: Database migration for payment fields/table
- Modify: `src/app/Dashboard/components/views/WageCalculation.tsx` (add payment UI)
- Modify: `blueshark-backend-test/backend/src/routes/wage.ts` (add payment endpoints)

---

## Issue 6: Phase 4 Testing Never Completed

**Severity:** Medium
**Impact:** 14 test items from the original wage feature plan were never executed. Bugs may exist that haven't been caught.

### Unchecked Tests

**unit_price Integration Tests:**
- [ ] Select worker in Altered modal → unit_price auto-fills with wage_rate
- [ ] Select worker in Rejected modal → unit_price auto-fills with wage_rate
- [ ] Manually override unit_price → uses override value
- [ ] Submit without unit_price → shows validation error
- [ ] Check database: worker_log has correct unit_price value

**WageCalculation View Tests:**
- [ ] Dashboard cards show correct totals
- [ ] All workers table loads on page open
- [ ] Department filter works correctly
- [ ] Date range filter works correctly
- [ ] Sort by column headers works
- [ ] Pagination works (page navigation, items per page)
- [ ] Row click opens detail view
- [ ] Export CSV downloads correct data
- [ ] No native alert() dialogs appear

### Reference

See: `docs/wage-module-feature/wage-feature-todo.md` Phase 4

---

## Recommended Fix Order

| Priority | Issue | Reason |
|----------|-------|--------|
| 1st | Issue 1: Fix historical unit_price = 0 | Immediately makes wage dashboard show correct data |
| 2nd | Issue 3: Stricter unit_price validation | Prevents new bad data from being created |
| 3rd | Issue 4: wage_rate guardrail | Prevents root cause of missing unit_price |
| 4th | Issue 2: Nepali date conversion | Fixes date filtering and display |
| 5th | Issue 6: Run Phase 4 tests | Validates all fixes work correctly |
| 6th | Issue 5: Payment tracking | New feature, built on top of working wage data |
