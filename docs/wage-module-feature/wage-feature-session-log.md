# BlueShark Wage Module - Session Log

**Feature:** Wage Calculation Module Redesign
**Started:** 2025-12-08

---

## Session 1: 2025-12-08 - Planning & Investigation

### What Was Done

1. **Explored Documentation Folder**
   - Reviewed existing BACKLOG.md for known issues
   - Found related UI issues (UI-S2-001: Data doesn't auto-refresh after worker assignment)

2. **Analyzed Backend Wage Service**
   - File: `blueshark-backend-test/backend/src/services/wageService.ts`
   - Found comprehensive wage calculation with billable/non-billable separation
   - APIs available: `/wages/all`, `/wages/worker/:id`, `/wages/department/:id`
   - No backend changes required

3. **Analyzed Frontend WageCalculation.tsx**
   - File: `src/app/Dashboard/components/views/WageCalculation.tsx` (371 lines)
   - Found basic single-worker view only
   - Old styling, native alerts, no export

4. **Identified Critical Issue**
   - Worker assignment modals (`AlteredTaskDetailsModal.tsx`, `RejectedTaskDetailsModal.tsx`) don't capture `unit_price`
   - Result: Wages calculate as 0 because `amount = quantity_worked × 0`

5. **User Requirements Gathered**
   - Primary User: Admin Dashboard
   - Unit Price: Flexible (auto-fill from wage_rate, allow override)
   - Priority: All workers summary + dashboard overview + export
   - Wage Types: Piece-rate primary

6. **Created Implementation Plan**
   - Phase 1: Fix unit_price capture in worker assignment modals [CRITICAL]
   - Phase 2: Redesign WageCalculation.tsx with HubSpot/Databricks patterns
   - Phase 3: Replace native alerts with Toast notifications

### Files Analyzed
- `docs/BACKLOG.md` - Known issues
- `blueshark-backend-test/backend/src/services/wageService.ts` - Backend logic
- `src/app/Dashboard/components/views/WageCalculation.tsx` - Frontend view
- `src/app/Dashboard/components/views/BatchView.tsx` - Reference for patterns

### Critical Findings

| Finding | Impact | Action |
|---------|--------|--------|
| unit_price not captured in worker assignment | Wages = 0 | Add field to modals |
| No all-workers summary view | Admin can't see overview | Complete redesign |
| Backend is solid | No changes needed | Only frontend work |

### Next Steps
1. Fix unit_price in AlteredTaskDetailsModal.tsx
2. Fix unit_price in RejectedTaskDetailsModal.tsx
3. Begin WageCalculation.tsx redesign

---

## Session 2: 2025-12-08 - Implementation

### Changes Made

1. **Fixed unit_price in AlteredTaskDetailsModal.tsx**
   - Added `unitPrice` state variable
   - Auto-fills from `worker.wage_rate` when worker selected
   - Added input field with validation
   - Updated payload to include `unit_price`

2. **Fixed unit_price in RejectedTaskDetailsModal.tsx**
   - Same changes as AlteredTaskDetailsModal

3. **Completely Redesigned WageCalculation.tsx (~855 lines)**
   - Dashboard summary cards (Total Billable, Total Workers, Non-Billable, Top Earner)
   - All Workers summary table with sortable columns
   - Worker Detail view with work logs
   - HubSpot-style FilterDropdown component
   - Pagination (10/25/50/100 items)
   - Export CSV functionality
   - Toast notifications instead of alerts

---

## Session 3: 2025-12-08 - Bug Investigation

### Issue Reported
Department filter shows 0 workers even when selecting a department with assigned work.

### Root Cause Found: Nepali Date Storage Issue

**Problem:** Nepali dates are being stored as wrong Gregorian dates in the database.

**Technical Details:**
- NepaliDatePicker returns dates like `2082-08-16` (Nepali year 2082 = Gregorian year 2025)
- Backend `workerLogService.ts` line 112: `new Date(data.work_date)`
- JavaScript parses `2082-08-16` as August 16, **2082 AD** (not 2025)
- Database stores dates 57 years in the future

**Impact:**
- Date filtering never works because stored dates are in year 2082 AD
- When filtering `2024-01-01` to `2025-12-31`, no records match year 2082

**Evidence:**
- User showed screenshot with dates displayed as `8/16/2082` in Activity History
- Selecting Dep-3 with date range shows 0 workers even though work exists

### Temporary Fix Applied
Disabled date filtering in `WageCalculation.tsx`:
```typescript
// Date filtering disabled - see comments in code
if (dept !== 'all') params.append('department_id', dept);
// Date params commented out
```

### Permanent Fix Required
Convert Nepali dates to Gregorian BEFORE storing in database.

**Option 1 (Recommended):** Add conversion in `workerLogService.ts`:
```typescript
import { NepaliDateConverter } from 'nepali-date-converter';

// Convert Nepali date to Gregorian before storing
const nepaliDate = data.work_date; // "2082-08-16"
const gregorianDate = NepaliDateConverter.toGregorian(nepaliDate);
work_date: gregorianDate
```

**Option 2:** Store dates as strings (not recommended - loses date functionality)

### Department Filter Behavior (Clarification)
The department filter works correctly. It filters by `worker.department_id` (the worker's home department), not where the work was logged.

Example: D2-W1 (Dept 2 worker) does work in Dept 3 via altered flow → wages appear under Dept 2

This is intentional - wages follow the worker, not the work location.

---

## Technical Notes

### API Response Structures

**GET /wages/all Response:**
```json
[
  {
    "worker_id": 1,
    "worker_name": "Worker Name",
    "total_billable_wages": 5000,
    "total_non_billable_wages": 500,
    "total_quantity_worked": 100,
    "billable_quantity": 95,
    "non_billable_quantity": 5,
    "total_entries": 10,
    "billable_entries": 9,
    "non_billable_entries": 1
  }
]
```

**GET /wages/worker/:id Response:**
```json
{
  "summary": { /* same as above */ },
  "detailed_logs": [
    {
      "id": 1,
      "work_date": "2025-12-01T00:00:00.000Z",
      "sub_batch_name": "Batch Name",
      "quantity_worked": 10,
      "unit_price": 50,
      "amount": 500,
      "is_billable": true,
      "activity_type": "NORMAL",
      "particulars": "Notes"
    }
  ]
}
```

### Worker Model Fields
```typescript
{
  id: number;
  name: string;
  pan: string;
  address: string;
  department_id: number | null;
  wage_type: string;  // "HOURLY" | "PIECE_RATE" | "DAILY"
  wage_rate: number;  // Used as default unit_price
}
```

### Worker Log Model Fields
```typescript
{
  id: number;
  worker_id: number;
  sub_batch_id: number;
  quantity_worked: number;
  unit_price: number;      // THIS IS CRITICAL - must be set
  work_date: Date;
  is_billable: boolean;
  activity_type: string;   // "NORMAL" | "ALTERED" | "REJECTED"
  department_id: number;
}
```
