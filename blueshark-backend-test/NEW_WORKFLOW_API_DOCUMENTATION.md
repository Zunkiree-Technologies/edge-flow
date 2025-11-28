# New Parent-Child-Dual Workflow API Documentation

## Overview

This document describes the new workflow implementation for the parent-child-dual card system. This system enables precise tracking of sub-batch assignments and work progress through departments.

---

## Database Changes

### New Fields Added to `department_sub_batches`

```prisma
// Card type flags
is_parent       Boolean  @default(false)   // Identifies parent cards
is_dual         Boolean  @default(false)   // Identifies dual cards
is_forwarded    Boolean  @default(false)   // Prevents editing after forward
forwarded_at    DateTime?                  // Timestamp of forwarding

// Child-specific fields
child_received  Int?                       // Assigned quantity (immutable)
child_worked    Int?     @default(0)       // Pieces completed by worker
child_altered   Int?     @default(0)       // Defective pieces found
child_remaining Int?                       // Calculated: received - (worked + altered)

// Parent-specific calculated fields
parent_worked   Int?     @default(0)       // Sum of all children's worked
parent_altered  Int?     @default(0)       // Sum of all children's altered
```

---

## API Endpoints

### Base URL
All endpoints are prefixed with: `/api/department-sub-batches` (note: plural!)

---

### 1. Assign Pieces to Worker (Create Child)

**Endpoint:** `POST /:parentId/assign`

**Description:** Creates a child assignment from a parent card. Decreases parent remaining quantity.

**Request:**
```json
{
  "workerId": 5,
  "assignedQty": 40
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Worker assigned successfully",
  "data": {
    "id": 123,
    "sub_batch_id": 10,
    "department_id": 2,
    "assigned_worker_id": 5,
    "parent_department_sub_batch_id": 100,
    "is_parent": false,
    "is_dual": false,
    "is_forwarded": false,
    "child_received": 40,
    "child_worked": 0,
    "child_altered": 0,
    "child_remaining": 40,
    "assigned_worker": {
      "id": 5,
      "name": "Worker X"
    },
    "parent_card": {
      "id": 100,
      "quantity_remaining": 60,
      "quantity_received": 100
    }
  }
}
```

**Special Case - Last Assignment (Dual Card):**
When `assignedQty` equals `parent.quantity_remaining`, the created child becomes a dual card:
```json
{
  "is_dual": true,
  "parent_card": {
    "id": 100,
    "quantity_received": 100,
    "parent_worked": 35,
    "parent_altered": 3
  }
}
```

**Validation Rules:**
- `assignedQty` must be ≤ `parent.quantity_remaining`
- `assignedQty` must be > 0
- Worker must exist
- Parent card must have `is_parent = true`

---

### 2. Update Child Work

**Endpoint:** `PATCH /child/:childId/work`

**Description:** Updates the worked and altered quantities for a child card. Automatically recalculates parent totals.

**Request:**
```json
{
  "worked": 35,
  "altered": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Child work updated successfully",
  "data": {
    "id": 123,
    "child_received": 40,
    "child_worked": 35,
    "child_altered": 3,
    "child_remaining": 2,
    "assigned_worker": {
      "id": 5,
      "name": "Worker X"
    },
    "parent_card": {
      "id": 100,
      "parent_worked": 35,
      "parent_altered": 3
    }
  }
}
```

**Validation Rules:**
- `worked + altered` must be ≤ `child_received`
- Both values must be ≥ 0
- Cannot update if `is_forwarded = true`
- `child_received` is **immutable** (cannot be changed)

**Important Notes:**
- Parent's `quantity_remaining` is **NOT** affected by work updates
- Parent's `parent_worked` and `parent_altered` are recalculated as sums of all children
- This endpoint can be called multiple times to update work progress

---

### 3. Forward Child to Next Department

**Endpoint:** `POST /child/:childId/forward`

**Description:** Forwards a completed child card to the next department. Creates a new parent card in the target department.

**Request:**
```json
{
  "targetDeptId": 3
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Child forwarded successfully",
  "data": {
    "id": 124,
    "sub_batch_id": 10,
    "department_id": 3,
    "is_parent": true,
    "is_dual": false,
    "quantity_received": 40,
    "quantity_remaining": 40,
    "parent_worked": 0,
    "parent_altered": 0,
    "stage": "NEW_ARRIVAL",
    "sent_from_department": 2,
    "remarks": "Received from forward"
  }
}
```

**Process:**
1. Validates `child_remaining == 0`
2. Creates new parent in target department with `quantity_received = child.child_received`
3. Marks source child as `is_forwarded = true`
4. If child was dual, marks source parent as `is_current = false`
5. Creates history entry

**Validation Rules:**
- `child_remaining` must be exactly 0
- Child must not already be forwarded
- Target department must exist

**Dual Card Special Behavior:**
When a dual card is forwarded, the parent card in the source department is archived and hidden.

---

### 4. Delete Child (Restore Parent)

**Endpoint:** `DELETE /child/:childId`

**Description:** Deletes a child assignment and restores quantities to the parent card.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Child deleted successfully",
  "data": {
    "id": 100,
    "quantity_remaining": 100,
    "parent_worked": 0,
    "parent_altered": 0,
    "child_cards": [
      // Remaining children
    ]
  }
}
```

**Process:**
1. Validates child is not forwarded
2. Restores `parent.quantity_remaining += child.child_received`
3. Adjusts `parent.parent_worked -= child.child_worked`
4. Adjusts `parent.parent_altered -= child.child_altered`
5. If child was dual, restores `parent.is_current = true`
6. Deletes the child record

**Validation Rules:**
- Cannot delete forwarded children
- Child must have a parent card

---

### 5. Get Department Cards

**Endpoint:** `GET /department/:deptId/sub-batch/:subBatchId/cards`

**Description:** Retrieves all parent and child cards for a specific department and sub-batch.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "parent": {
      "id": 100,
      "department_id": 2,
      "sub_batch_id": 10,
      "is_parent": true,
      "quantity_received": 100,
      "quantity_remaining": 30,
      "parent_worked": 65,
      "parent_altered": 5,
      "stage": "IN_PROGRESS"
    },
    "children": [
      {
        "id": 121,
        "assigned_worker_id": 5,
        "is_dual": false,
        "is_forwarded": false,
        "child_received": 40,
        "child_worked": 35,
        "child_altered": 3,
        "child_remaining": 2,
        "assigned_worker": {
          "id": 5,
          "name": "Worker X"
        }
      },
      {
        "id": 122,
        "assigned_worker_id": 6,
        "is_dual": false,
        "is_forwarded": false,
        "child_received": 30,
        "child_worked": 30,
        "child_altered": 0,
        "child_remaining": 0,
        "assigned_worker": {
          "id": 6,
          "name": "Worker Y"
        }
      },
      {
        "id": 123,
        "assigned_worker_id": 7,
        "is_dual": true,
        "is_forwarded": false,
        "child_received": 30,
        "child_worked": 0,
        "child_altered": 2,
        "child_remaining": 28,
        "assigned_worker": {
          "id": 7,
          "name": "Worker Z"
        },
        "parent_card": {
          "id": 100,
          "quantity_received": 100,
          "parent_worked": 65,
          "parent_altered": 5
        }
      }
    ]
  }
}
```

**Notes:**
- Parent is `null` if `quantity_remaining = 0` (fully assigned)
- Only non-forwarded children are returned
- Dual child includes `parent_card` data for UI display

---

## Workflow Example

### Scenario: 100 pieces arrive at Department A

#### Step 1: Initial Arrival
A parent card is created when sub-batch arrives:
```json
{
  "id": 100,
  "department_id": 2,
  "sub_batch_id": 10,
  "is_parent": true,
  "quantity_received": 100,
  "quantity_remaining": 100,
  "parent_worked": 0,
  "parent_altered": 0
}
```

#### Step 2: Assign 40 to Worker X
```bash
POST /api/department-sub-batch/100/assign
{
  "workerId": 5,
  "assignedQty": 40
}
```

Result:
- Parent: `quantity_remaining = 60`
- Child-X: `child_received = 40, child_remaining = 40`

#### Step 3: Assign 30 to Worker Y
```bash
POST /api/department-sub-batch/100/assign
{
  "workerId": 6,
  "assignedQty": 30
}
```

Result:
- Parent: `quantity_remaining = 30`
- Child-Y: `child_received = 30, child_remaining = 30`

#### Step 4: Assign 30 to Worker Z (Last Assignment)
```bash
POST /api/department-sub-batch/100/assign
{
  "workerId": 7,
  "assignedQty": 30
}
```

Result:
- Parent: `quantity_remaining = 0` (hidden from list)
- Child-Z: `child_received = 30, is_dual = true` (shows parent summary)

#### Step 5: Worker X Updates Progress
```bash
PATCH /api/department-sub-batch/child/121/work
{
  "worked": 35,
  "altered": 3
}
```

Result:
- Child-X: `child_worked = 35, child_altered = 3, child_remaining = 2`
- Parent: `parent_worked = 35, parent_altered = 3`

#### Step 6: Worker Y Completes Work
```bash
PATCH /api/department-sub-batch/child/122/work
{
  "worked": 30,
  "altered": 0
}
```

Result:
- Child-Y: `child_remaining = 0` (ready to forward)

#### Step 7: Forward Worker Y's Completed Pieces
```bash
POST /api/department-sub-batch/child/122/forward
{
  "targetDeptId": 3
}
```

Result:
- New parent created in Department B: `quantity_received = 30, quantity_remaining = 30`
- Child-Y in Department A: `is_forwarded = true`

---

## Key Principles

1. **Immutability:**
   - `child_received` cannot be changed after creation
   - Only `child_worked` and `child_altered` are editable

2. **Parent Remaining:**
   - Decreases ONLY on assignment
   - Does NOT decrease when work is updated

3. **Parent Worked/Altered:**
   - Calculated as sums of all children
   - Updated automatically when any child work is updated

4. **Forwarding:**
   - Only allowed when `child_remaining == 0`
   - Creates new parent in target department
   - Source child marked as forwarded (cannot edit/delete)

5. **Dual Card:**
   - Last child when `parent.quantity_remaining == 0`
   - Shows parent summary + own child data
   - When forwarded, parent is archived

6. **Deletion:**
   - Only non-forwarded children can be deleted
   - Restores all quantities to parent
   - If dual is deleted, parent becomes visible again

---

## Integration with Existing System

### Worker Logs
- The existing `worker_logs` table is kept for audit trail
- New workflow uses `department_sub_batches` for current state
- Both systems can coexist

### Altered/Rejected
- Existing `sub_batch_altered` and `sub_batch_rejected` tables still work
- These should create new parent cards in target departments
- Link via `source_department_sub_batch_id` and `created_department_sub_batch_id`

---

## Testing Checklist

- [ ] Create parent card when sub-batch arrives at department
- [ ] Assign partial quantities (creates child, decreases parent remaining)
- [ ] Assign all remaining (creates dual child, hides parent)
- [ ] Update child work multiple times (recalculates parent totals)
- [ ] Forward completed child (creates parent in next dept)
- [ ] Forward dual child (archives parent)
- [ ] Delete non-forwarded child (restores parent quantities)
- [ ] Delete dual child (restores parent visibility)
- [ ] Validate: cannot forward if remaining > 0
- [ ] Validate: cannot update work if forwarded
- [ ] Validate: cannot delete if forwarded
- [ ] Validate: worked + altered <= received

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200 OK` - Successful GET/PATCH/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Server/database error

---

## Next Steps

1. **Frontend Integration:**
   - Update UI to distinguish parent vs child cards
   - Show dual card with parent summary
   - Disable forward button until remaining == 0
   - Show parent totals in real-time

2. **Altered/Rejected Integration:**
   - Update altered/rejected flows to use new parent cards
   - Link altered/rejected to specific child cards

3. **Reporting:**
   - Update reports to use new fields
   - Show parent-child hierarchy in traces
   - Calculate department-level metrics from parent cards

---

Generated: 2025-11-21
Version: 1.0
