# BlueShark Inventory Module - Feature Implementation Plan

**Created:** 2025-12-07
**Status:** Planning Complete, Ready for Implementation
**Estimated Time:** 10-12 hours

---

## Overview

Upgrade the inventory module to production-ready status by:
1. Matching existing HubSpot/Databricks-inspired UI patterns
2. Adding user-defined categories
3. Implementing low-stock alerts with thresholds
4. Requiring reason codes for stock subtractions
5. Ensuring nothing breaks in the existing system

---

## User Requirements Confirmed

| Requirement | Decision |
|-------------|----------|
| Vendor field | Keep as free-text (link to Vendors table in future) |
| Categories | User-defined (users can create/manage categories) |
| Low-stock alerts | Yes, with warnings (set min_quantity per item) |
| Reason codes | Required for subtractions (Production Use, Damaged, Sample, etc.) |

---

## Current State Analysis

### What Exists

**Backend (Well-Structured):**
- Prisma models: `inventory`, `inventory_addition`, `inventory_subtraction`
- Full CRUD APIs with transactional stock adjustments
- Proper validation (can't subtract more than available)

**Frontend (~900 lines):**
- Basic table view: SN, ID, Item Name, Quantity, Unit, Actions
- Add new item form
- Stock adjustment flow (Add/Subtract)
- Preview with adjustment history

### Problems Identified

**UI/UX Issues (Not Following Established Patterns):**
| Issue | Current | Should Be |
|-------|---------|-----------|
| Add button | `bg-[#6B98FF] rounded-[10px]` | `bg-blue-600 rounded-xl hover:scale-105` |
| Notifications | Native `alert()` | `showToast()` from ToastContext |
| Confirmations | Native `confirm()` | `showConfirm()` from ToastContext |
| Modal type | Centered modal | Right-sliding drawer |
| Modal corners | `rounded-[25px]` | Sharp corners (no border-radius) |
| Backdrop | `bg-white/50` | Blur effect `backdropFilter: blur(4px)` |
| Table filters | None | HubSpot-style FilterDropdown |
| Sorting | None | Sortable column headers |
| Pagination | None | Items per page + page navigation |
| Row selection | None | Checkboxes + bulk actions |
| Icons | Inline SVGs | Lucide React icons |

**Functional Gaps:**
- No categories for organizing items
- No low-stock threshold/alerts
- No search functionality
- No way to edit item details (only adjust stock)
- Subtractions don't capture reason codes
- No bulk delete
- Limited unit options (only kg and m)

---

## Implementation Phases

### Phase 1: Database Schema Updates

**File:** `blueshark-backend-test/backend/prisma/schema.prisma`

**Changes:**

1. **Add new `inventory_category` model:**
```prisma
model inventory_category {
  id         Int         @id @default(autoincrement())
  name       String      @unique
  createdAt  DateTime    @default(now())
  inventory  inventory[]
}
```

2. **Update `inventory` model:**
```prisma
model inventory {
  // ... existing fields ...
  category_id   Int?                    // NEW: Optional category reference
  min_quantity  Float?    @default(0)   // NEW: Low-stock threshold

  category      inventory_category?     @relation(fields: [category_id], references: [id])

  @@index([category_id])
}
```

3. **Update `inventory_subtraction` model:**
```prisma
model inventory_subtraction {
  // ... existing fields ...
  reason       String    // NEW: Required reason code
}
```

**Migration Command:**
```bash
cd blueshark-backend-test/backend
npx prisma migrate dev --name add_inventory_category_and_low_stock
```

---

### Phase 2: Backend API Updates

#### 2.1 Create Inventory Category Service
**New File:** `blueshark-backend-test/backend/src/services/inventoryCategoryService.ts`

Functions:
- `createInventoryCategory(data: { name: string })`
- `getAllInventoryCategories()`
- `getInventoryCategoryById(id: number)`
- `updateInventoryCategory(id: number, data: { name: string })`
- `deleteInventoryCategory(id: number)` - with validation

#### 2.2 Create Inventory Category Controller
**New File:** `blueshark-backend-test/backend/src/controllers/inventoryCategoryController.ts`

Standard CRUD handlers with proper error handling.

#### 2.3 Create Inventory Category Routes
**New File:** `blueshark-backend-test/backend/src/routes/inventoryCategory.ts`

```
POST   /api/inventory-categories     - Create category
GET    /api/inventory-categories     - Get all categories
GET    /api/inventory-categories/:id - Get single category
PUT    /api/inventory-categories/:id - Update category
DELETE /api/inventory-categories/:id - Delete category
```

#### 2.4 Update Inventory Service
**File:** `blueshark-backend-test/backend/src/services/inventoryService.ts`

Changes:
- Add `category_id` and `min_quantity` to create/update functions
- Include `category` relation in all queries
- Add `getLowStockItems()` function

#### 2.5 Update Inventory Subtraction Service
**File:** `blueshark-backend-test/backend/src/services/inventorySubtractionService.ts`

Changes:
- Make `reason` field required in `createInventorySubtraction()`
- Add validation for reason field

#### 2.6 Update Inventory Subtraction Controller
**File:** `blueshark-backend-test/backend/src/controllers/inventorySubtractionController.ts`

Changes:
- Validate `reason` is provided in request body

#### 2.7 Register New Routes
**File:** `blueshark-backend-test/backend/index.ts`

```typescript
import inventoryCategoryRoutes from "./src/routes/inventoryCategory";
app.use("/api/inventory-categories", inventoryCategoryRoutes);
```

---

### Phase 3: Environment Variables

**File:** `.env` (and `.env.example`)

Add new endpoints:
```env
# Inventory Category Endpoints
NEXT_PUBLIC_GET_INVENTORY_CATEGORIES=${NEXT_PUBLIC_API_URL}/inventory-categories
NEXT_PUBLIC_CREATE_INVENTORY_CATEGORY=${NEXT_PUBLIC_API_URL}/inventory-categories
NEXT_PUBLIC_UPDATE_INVENTORY_CATEGORY=${NEXT_PUBLIC_API_URL}/inventory-categories
NEXT_PUBLIC_DELETE_INVENTORY_CATEGORY=${NEXT_PUBLIC_API_URL}/inventory-categories
```

---

### Phase 4: Frontend Complete Rewrite

**File:** `src/app/Dashboard/components/views/Inventory.tsx`

#### 4.1 New Imports
```typescript
import { useToast } from "@/app/Components/ToastContext";
import {
  Plus, X, Edit2, Trash2, Eye, Package,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowUpDown, AlertTriangle, TrendingUp, TrendingDown,
  Check, Search, SlidersHorizontal
} from "lucide-react";
```

#### 4.2 New Interfaces
```typescript
interface InventoryCategory {
  id: number;
  name: string;
}

interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  date: string;
  quantity: number;
  price: number;
  vendor: string;
  phone: string;
  remarks: string;
  category_id: number | null;
  category: InventoryCategory | null;
  min_quantity: number;
}
```

#### 4.3 Reason Codes Constant
```typescript
const SUBTRACTION_REASONS = [
  { value: "PRODUCTION_USE", label: "Production Use", description: "Used in production process" },
  { value: "DAMAGED", label: "Damaged", description: "Item was damaged" },
  { value: "SAMPLE", label: "Sample", description: "Given as sample" },
  { value: "RETURNED", label: "Returned to Vendor", description: "Returned to supplier" },
  { value: "EXPIRED", label: "Expired", description: "Item past expiry date" },
  { value: "OTHER", label: "Other", description: "Other reason" },
];
```

#### 4.4 New State Variables
```typescript
// Toast hook
const { showToast, showConfirm } = useToast();

// Data
const [categories, setCategories] = useState<InventoryCategory[]>([]);

// Filters
const [selectedCategory, setSelectedCategory] = useState<string>("all");
const [selectedUnit, setSelectedUnit] = useState<string>("all");
const [showLowStockOnly, setShowLowStockOnly] = useState(false);

// Sorting
const [sortColumn, setSortColumn] = useState<string>("id");
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);

// Row Selection
const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

// Category Management
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [newCategoryName, setNewCategoryName] = useState("");
const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
```

#### 4.5 Key UI Components to Implement

1. **FilterDropdown** - Copy inline from BatchView.tsx
2. **HubSpot-style filter bar** - Category, Unit, Sort dropdowns + Low-stock toggle
3. **Sortable table headers** - Click to sort with chevron indicators
4. **Pagination bar** - Items per page + page navigation
5. **Right-sliding drawer** - Full height, blur backdrop, sharp corners
6. **Low-stock indicators** - Amber badge on items below threshold
7. **Category management modal** - Add/edit/delete categories
8. **Bulk action bar** - Floating bar when items selected
9. **Reason code dropdown** - Required for subtractions

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | UPDATE | Add category model, update inventory & subtraction |
| `services/inventoryCategoryService.ts` | CREATE | CRUD for categories |
| `controllers/inventoryCategoryController.ts` | CREATE | HTTP handlers for categories |
| `routes/inventoryCategory.ts` | CREATE | Route definitions |
| `services/inventoryService.ts` | UPDATE | Add category relation, min_quantity, getLowStockItems |
| `services/inventorySubtractionService.ts` | UPDATE | Require reason field |
| `controllers/inventorySubtractionController.ts` | UPDATE | Validate reason field |
| `backend/index.ts` | UPDATE | Register category routes |
| `.env` | UPDATE | Add category API endpoints |
| `views/Inventory.tsx` | REWRITE | Complete UI overhaul |

---

## Risk Mitigation

### 1. Database Migration Safety
- Make `category_id` nullable (existing items won't break)
- Set `min_quantity` default to 0
- Run migration on dev database first
- Backup production database before migration

### 2. Backward Compatibility
- Keep `reason` optional in API, required in UI only (for now)
- Existing subtraction records without reason will still work
- Old items display as "Uncategorized"

### 3. Incremental Implementation
- Complete backend first, test all APIs
- Then implement frontend changes
- Test each feature individually

### 4. Performance
- Use proper database indexes
- Use `useMemo` for filtering/sorting
- Debounce filter changes if needed

---

## Success Criteria

- [ ] All existing inventory data loads correctly
- [ ] UI matches BatchView/RollView patterns exactly
- [ ] Toast notifications work for all actions
- [ ] Confirm modals work for delete operations
- [ ] Category CRUD works (create, read, update, delete)
- [ ] Low-stock items show amber badge
- [ ] Low-stock filter works
- [ ] Sorting works on all columns
- [ ] Pagination works correctly
- [ ] Bulk selection and delete works
- [ ] Subtraction requires reason code
- [ ] No console errors or warnings
- [ ] No regressions in other modules
