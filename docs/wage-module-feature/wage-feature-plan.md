# BlueShark Wage Module - Feature Implementation Plan

**Created:** 2025-12-08
**Status:** Planning Complete, Ready for Implementation

---

## Overview

Upgrade the wage calculation module to production-ready status by:
1. Fixing critical unit_price capture issue in worker assignment modals
2. Matching existing HubSpot/Databricks-inspired UI patterns
3. Adding all workers summary dashboard with stats cards
4. Implementing filters, sorting, pagination, and export
5. Replacing all native alerts with Toast notifications

---

## User Requirements Confirmed

| Requirement | Decision |
|-------------|----------|
| Primary User | Admin Dashboard (managing all workers' wages) |
| Unit Price | Flexible - auto-fill from worker.wage_rate, allow override |
| Priority Features | All workers summary, dashboard overview, export |
| Wage Types | Piece-rate primary (quantity × unit_price) |
| Design Style | HubSpot/Databricks patterns |

---

## Current State Analysis

### What Exists

**Backend (Well-Structured - No Changes Needed):**
- `wageService.ts`: Comprehensive wage calculation with billable/non-billable separation
- APIs: `/wages/all`, `/wages/worker/:id`, `/wages/department/:id`, `/wages/sub-batch/:id`
- Formula: `amount = quantity_worked × unit_price` (only for `is_billable = true`)
- Worker master data has `wage_type` and `wage_rate` fields

**Frontend (Needs Major Upgrade):**
- `WageCalculation.tsx` (~371 lines): Basic single-worker view
- Worker assignment modals exist but don't capture `unit_price`

### Problems Identified

**Critical Issues:**
| Issue | Impact | Priority |
|-------|--------|----------|
| Worker assignment modals don't capture `unit_price` | Wages calculate as 0 | **CRITICAL** |
| Single worker view only - no "all workers" summary | Admin can't see overview | HIGH |
| Old styling (not HubSpot-style) | Inconsistent UX | MEDIUM |
| No export functionality | Can't export payroll | HIGH |
| Uses native `alert()` instead of Toast | Inconsistent UX | MEDIUM |
| Hardcoded "XL" size placeholder (line 91) | Incorrect data | LOW |

---

## Implementation Phases

### Phase 1: Fix unit_price Capture [CRITICAL]

**File 1:** `src/app/SupervisorDashboard/depcomponents/altered/AlteredTaskDetailsModal.tsx`

Changes:
1. Add state: `const [unitPrice, setUnitPrice] = useState<string>('');`
2. Auto-fill unit_price when worker selected (from `worker.wage_rate`)
3. Add unit_price input field after quantity field
4. Update payload in `handleAddWorker` to include `unit_price: parseFloat(unitPrice)`
5. Add validation: Require unit_price > 0
6. Reset unitPrice on success

**File 2:** `src/app/SupervisorDashboard/depcomponents/rejected/RejectedTaskDetailsModal.tsx`

Apply identical changes as AlteredTaskDetailsModal.

---

### Phase 2: Redesign WageCalculation.tsx

**File:** `src/app/Dashboard/components/views/WageCalculation.tsx`

#### New Component Structure:
```
WageCalculation.tsx
├── Dashboard Section (4 Summary Cards)
│   ├── Total Billable Wages
│   ├── Total Workers
│   ├── Total Non-Billable
│   └── Top Earner
│
├── View Tabs: [All Workers] | [Worker Details]
│
├── Filter Bar (HubSpot-style)
│   ├── Department Filter
│   ├── Date Range (Nepali calendar)
│   ├── Sort Dropdown
│   ├── Clear All
│   └── Export CSV Button
│
├── All Workers Summary Table
│   ├── Sortable columns
│   ├── Click row → detail view
│   └── Pagination
│
└── Worker Detail View (on row click)
    ├── Worker info header
    └── Detailed logs table
```

#### New Imports
```typescript
import { useToast } from "@/app/Components/ToastContext";
import {
  DollarSign, Users, TrendingUp, Award,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUpDown, Download,
  Check, Search, X, ArrowLeft
} from "lucide-react";
```

#### New Interfaces
```typescript
interface WorkerWageSummary {
  worker_id: number;
  worker_name: string;
  total_billable_wages: number;
  total_non_billable_wages: number;
  total_quantity_worked: number;
  billable_quantity: number;
  non_billable_quantity: number;
  total_entries: number;
  billable_entries: number;
  non_billable_entries: number;
}

interface DetailedWageLog {
  id: number;
  work_date: string;
  sub_batch_name: string;
  quantity_worked: number;
  unit_price: number;
  amount: number;
  is_billable: boolean;
  activity_type: string | null;
  particulars: string | null;
}

interface Department {
  id: number;
  name: string;
}
```

#### New State Variables
```typescript
// View state
const [activeView, setActiveView] = useState<'all' | 'detail'>('all');
const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<WorkerWageSummary | null>(null);

// Data states
const [allWorkersWages, setAllWorkersWages] = useState<WorkerWageSummary[]>([]);
const [workerDetailedLogs, setWorkerDetailedLogs] = useState<DetailedWageLog[]>([]);
const [departments, setDepartments] = useState<Department[]>([]);

// Dashboard summary
const [dashboardStats, setDashboardStats] = useState({
  totalBillableWages: 0,
  totalNonBillableWages: 0,
  totalWorkers: 0,
  topEarner: null as WorkerWageSummary | null,
});

// Filter states (HubSpot-style)
const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
const [startDate, setStartDate] = useState<string>('');
const [endDate, setEndDate] = useState<string>('');

// Sorting states
const [sortColumn, setSortColumn] = useState<string>('total_billable_wages');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

// Pagination states
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
```

#### Key Functions
- `fetchAllWorkersWages()` - Fetch from `/wages/all` API
- `fetchWorkerDetails(workerId)` - Fetch from `/wages/worker/:id` API
- `fetchDepartments()` - Fetch departments for filter dropdown
- `exportToCSV()` - Export filtered data as CSV
- `handleSort(column)` - Toggle sort column/direction
- `handleRowClick(worker)` - Navigate to detail view

---

### Phase 3: Replace Native Alerts

In all modified files, replace:
- `alert("error")` → `showToast("error", "message")`
- `alert("success")` → `showToast("success", "message")`
- Validation warnings → `showToast("warning", "message")`

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/app/SupervisorDashboard/depcomponents/altered/AlteredTaskDetailsModal.tsx` | UPDATE | Add unit_price field |
| `src/app/SupervisorDashboard/depcomponents/rejected/RejectedTaskDetailsModal.tsx` | UPDATE | Add unit_price field |
| `src/app/Dashboard/components/views/WageCalculation.tsx` | REWRITE | Complete UI overhaul (~800 lines) |

## Reference Files (Copy Patterns From)

| File | Pattern |
|------|---------|
| `src/app/Dashboard/components/views/BatchView.tsx` | FilterDropdown, pagination, Toast |
| `blueshark-backend-test/backend/src/services/wageService.ts` | API response structure |

---

## UI Design Specifications

### Dashboard Cards (4 cards in a row)
- Background: `bg-white border border-gray-200 rounded-lg p-4`
- Icon container: `w-10 h-10 bg-{color}-100 rounded-lg`
- Title: `text-sm text-gray-500`
- Value: `text-xl font-bold text-gray-900`

### Filter Bar (HubSpot-style)
- Layout: `flex items-center gap-3 mb-4 flex-wrap`
- FilterDropdown components (copy from BatchView)
- BlueShark blue accent: `#2272B4`
- Export button: `ml-auto`

### Data Table
- Container: `border border-gray-200 rounded-lg overflow-hidden`
- Headers: `bg-gray-50 text-xs font-medium text-gray-500 uppercase`
- Rows: `hover:bg-gray-50 cursor-pointer`
- Sortable headers: `cursor-pointer` with ChevronUp/Down icons

### Pagination
- Format: "Showing X to Y of Z"
- Page sizes: [10, 25, 50, 100]
- Navigation: [First] [Prev] Page X of Y [Next] [Last]

---

## Risk Mitigation

### 1. Backend Compatibility
- No backend changes required
- All APIs already support required functionality
- Response structures are well-documented

### 2. Data Integrity
- unit_price defaults to 0 if not provided (existing behavior)
- New unit_price field ensures correct wages going forward
- Historical data unaffected

### 3. Incremental Implementation
- Fix unit_price first (most critical)
- Then redesign WageCalculation
- Test each phase before moving to next

---

## Success Criteria

- [ ] Worker assignment auto-fills unit_price from wage_rate
- [ ] unit_price can be manually overridden
- [ ] Validation prevents empty/negative unit_price
- [ ] Database stores correct unit_price values
- [ ] Dashboard cards show correct totals
- [ ] All workers table loads on page open
- [ ] Department filter works correctly
- [ ] Date range filter works correctly
- [ ] Sort by column headers works
- [ ] Pagination works (page navigation, items per page)
- [ ] Click row → navigates to worker detail view
- [ ] Export CSV downloads correct data
- [ ] No native alert() dialogs appear
- [ ] Toast notifications work correctly
