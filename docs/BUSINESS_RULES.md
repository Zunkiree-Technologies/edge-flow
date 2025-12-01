# BlueShark Business Rules

**Purpose:** Single source of truth for all critical business logic and workflow rules.

**Last Updated:** 2025-12-01

---

## Quick Reference

| Action | What It Means | First Dept Rule | Creates Card? | Color |
|--------|---------------|-----------------|---------------|-------|
| **Rejection** | Scrap/waste - PERMANENT loss | ✅ CAN reject from ANY dept | ❌ NO | - |
| **Alteration** | Send BACK for rework | ❌ CANNOT from first dept | ✅ YES | Yellow |
| **Advance** | Send FORWARD to next dept | ✅ From any dept | ✅ YES | - |

---

## 1. Rejection Flow (Scrap/Waste)

### Definition
**Rejection = Items that CANNOT be fixed and must be permanently discarded as waste/scrap.**

### Business Rules
1. **Permanence**: Rejected items are PERMANENTLY removed from production
2. **No Card Created**: Unlike alteration, rejection does NOT create a new card
3. **Any Department**: ✅ Can reject from ANY department (including first)
4. **Worker Accountability**: Must select which worker's work is being rejected
5. **Quantity Limit**: Can only reject up to the worker's assigned quantity
6. **Reason Required**: Must provide rejection reason for audit trail
7. **Inventory Impact**: Quantity is permanently reduced from inventory count

### Workflow
```
Supervisor finds unfixable defect
    ↓
Actions → "Reject Items"
    ↓
Select worker whose work has defects
    ↓
Enter quantity to reject (max = worker's assigned qty)
    ↓
Enter reason (e.g., "Fabric torn beyond repair")
    ↓
Submit → Items logged as waste, quantity reduced permanently
    ↓
NO card created - items are discarded
```

### Data Impact
- `worker_logs.rejected_entry[]` - Tracks rejection details
- `quantity_remaining` - Reduced permanently
- Production Summary shows "Rejected" count
- Activity History shows rejection event (red styling)

---

## 2. Alteration Flow (Send Back for Rework)

### Definition
**Alteration = Items that CAN be fixed and need to be sent BACK to a PREVIOUS department for rework.**

### Business Rules
1. **Fixable Defects**: Items have fixable issues that previous department can repair
2. **Yellow Card Created**: Creates a new "Altered" card in target department
3. **Previous Departments Only**: Can ONLY send to departments BEFORE current in workflow
4. **First Department Restriction**: ❌ CANNOT alter from FIRST department (no previous dept)
5. **Worker Accountability**: Must select which worker's work needs alteration
6. **Quantity Limit**: Can only alter up to the worker's assigned quantity
7. **Reason Required**: Must provide alteration reason describing what needs fixing
8. **Returns to Production**: After rework, items continue through normal workflow

### Workflow
```
Supervisor finds fixable defect (in Dep-2 or later)
    ↓
Actions → "Send for Alteration"
    ↓
Select worker whose work has defects
    ↓
Enter quantity to alter (max = worker's assigned qty)
    ↓
Enter reason (e.g., "Stitching uneven - needs re-stitch")
    ↓
Select PREVIOUS department (dropdown shows only earlier depts)
    ↓
Submit → Yellow "Altered" card created in target department
    ↓
Target dept supervisor assigns workers to fix
    ↓
When fixed, advances to next department normally
```

### First Department Behavior
```
If current department is FIRST in workflow:
    ↓
"Send for Alteration" option shows message:
"No previous departments available. Cannot send for alteration from first department."
    ↓
Button is disabled
```

### Data Impact
- New `department_sub_batches` record with `remarks: "Altered"`
- `sub_batch_altered` table tracks alteration details
- Yellow card appears in target department's kanban
- Original card's `quantity_remaining` reduced
- Activity History shows alteration event (yellow styling)

---

## 3. Department Flow

### Sequential Flow
Sub-batches move through departments in a predetermined sequence:

```
Dep-1 (Cutting) → Dep-2 (Stitching) → Dep-3 (Finishing) → Dep-4 (Packing)
        ↑                                      |
        └──────── Alteration (send back) ──────┘
```

### Stage Progression
Each department tracks work stages:
- `NEW_ARRIVAL` - Just received, no work started
- `IN_PROGRESS` - Work being done (auto-set when first worker assigned)
- `COMPLETED` - All work done, ready to advance

### Quantity Tracking
```
quantity_received   = What arrived at this department
quantity_remaining  = What's left to work on
quantity_assigned   = How much has been assigned to workers

Formula: Processed = Received - Remaining
```

---

## 4. Worker Assignment Rules

### Department Filtering
- Workers can ONLY be assigned to tasks in their department
- Supervisor dropdown shows only workers from their own department
- Workers are linked to departments via `department_workers` junction table

### Quantity Validation
- Cannot assign more than `quantity_remaining`
- Each assignment creates a `worker_logs` record
- Multiple workers can work on same sub-batch

### Auto-Stage Update
- When first worker is assigned to a `NEW_ARRIVAL` task
- Stage automatically changes to `IN_PROGRESS`

### Activity Types
- `NORMAL` - Regular production work
- `ALTERED` - Rework on altered items
- `REJECTED` - (Not used - rejection is scrap, no work done)

---

## 5. Quantity Conservation

### Formula
At any point in the workflow:
```
Total Received = Remaining + Processed + Rejected(Scrapped)
```

### Example
```
Sub-batch: 50 pieces

Scenario after work:
- Processed (good work): 20 pcs
- Rejected (scrapped):   10 pcs
- Remaining (to do):     20 pcs
- Total:                 50 pcs ✓
```

---

## 6. Card Types & Colors

| Type | Color | Badge | When Created |
|------|-------|-------|--------------|
| Main/Unassigned | Gray | "Unassigned" | Initial sub-batch arrival |
| Assigned | Blue | "Assigned" | Worker assigned to task |
| Altered | Yellow | "Alteration" | Items sent back for rework |
| Rejected | - | - | NO CARD (items scrapped) |
| Completed | Green | "Completed" | All work done |

---

## 7. Activity History Events

The Activity History section in TaskDetailsModal shows:
- 🔵 **Arrival Event** - "Arrived at [Department]" with timestamp
- 🟢 **Assignment Events** - Worker assignments with quantity and date
- 🔴 **Rejection Events** - Rejected items with reason (red styling)
- 🟡 **Status Events** - Current stage indicator

---

## 8. Validation Rules Summary

| Validation | Rule |
|------------|------|
| Rejection from First Dept | ✅ Allowed |
| Alteration from First Dept | ❌ Not allowed |
| Quantity > Remaining | ❌ Not allowed |
| Quantity > Worker's Assigned | ❌ Not allowed |
| Empty Reason | ❌ Not allowed |
| Send to Same Dept (Alter) | ❌ Not allowed |
| Send to Future Dept (Alter) | ❌ Not allowed |

---

## Implementation References

### Frontend Files
- `RejectionModal.tsx` - Rejection (scrap) workflow
- `AlterationModal.tsx` - Alteration (send back) workflow
- `TaskDetailsModal.tsx` - Activity History display
- `DepartmentView.tsx` - Kanban board and card display

### API Endpoints
- `POST /api/admin/production/reject` - Create rejection record
- `POST /api/admin/production/alteration` - Create alteration and yellow card

---

*See also: [PRODUCT_DOCUMENTATION.md](./product/PRODUCT_DOCUMENTATION.md) for full feature details*
