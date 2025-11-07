# Frontend Changes Required - Reject/Alter/Advance Fix

## Overview
The backend API has been updated to fix critical issues with reject/alter/advance functionality. The main change is that APIs now require **specific entry IDs** (`department_sub_batch_id`) instead of department IDs to precisely identify which workflow entry to operate on.

---

## Key Concept Change

### Previous Approach (Broken):
- Frontend passed `subBatchId` + `departmentId` to identify entries
- Backend used `updateMany` which affected ALL matching entries
- This caused negative quantities and duplicate entries

### New Approach (Fixed):
- Frontend passes `departmentSubBatchId` (the `id` from `department_sub_batches` table)
- Backend targets ONE specific entry
- This prevents accidental updates to multiple entries

---

## Change #1: Advance Sub-Batch to Next Department

### Backend Code Change

**BEFORE:**
```typescript
// Backend Service: src/services/subBatchService.ts
export async function advanceSubBatchToNextDepartment(
  subBatchId: number,
  fromDepartmentId: number,
  toDepartmentId: number
) {
  const currentDept = await prisma.department_sub_batches.findFirst({
    where: {
      sub_batch_id: subBatchId,
      department_id: fromDepartmentId,
      is_current: true,
    },
  });
  // ... rest of code
}
```

**API Endpoint:** `POST /api/sub-batches/advance-department`

**Previous Request Body:**
```json
{
  "subBatchId": 81,
  "fromDepartmentId": 21,
  "toDepartmentId": 29
}
```

**AFTER:**
```typescript
// Backend Service: src/services/subBatchService.ts
export async function advanceSubBatchToNextDepartment(
  departmentSubBatchId: number,
  toDepartmentId: number
) {
  const currentDept = await prisma.department_sub_batches.findUnique({
    where: {
      id: departmentSubBatchId,  // Direct lookup by ID
    },
  });
  // ... rest of code
}
```

**API Endpoint:** `POST /api/sub-batches/advance-department`

**New Request Body:**
```json
{
  "departmentSubBatchId": 88,
  "toDepartmentId": 29
}
```

### Frontend Changes Required

#### 1. Store the `department_sub_batch_id`

When fetching sub-batches for a department, save the `id` field from each entry:

**TypeScript Interface Update:**
```typescript
// BEFORE
interface SubBatchCard {
  subBatchId: number;
  departmentId: number;
  quantity: number;
  remarks: string | null;
}

// AFTER
interface SubBatchCard {
  departmentSubBatchId: number;  // ADD THIS - the 'id' from API response
  subBatchId: number;
  departmentId: number;
  quantity: number;
  remarks: string | null;
}
```

**Example API Response** (when fetching department sub-batches):
```typescript
// GET /api/departments/21/sub-batches
{
  "newArrival": [
    {
      "id": 88,  // ← This is department_sub_batch_id (SAVE THIS!)
      "sub_batch_id": 81,
      "department_id": 21,
      "quantity_remaining": 50,
      "remarks": "Altered",
      "stage": "NEW_ARRIVAL",
      "is_current": true
    }
  ]
}
```

**Fetching Logic Update:**
```typescript
// BEFORE
const fetchDepartmentSubBatches = async (departmentId: number) => {
  const response = await fetch(`/api/departments/${departmentId}/sub-batches`);
  const data = await response.json();

  return data.newArrival.map(entry => ({
    subBatchId: entry.sub_batch_id,
    departmentId: entry.department_id,
    quantity: entry.quantity_remaining,
    remarks: entry.remarks
  }));
};

// AFTER
const fetchDepartmentSubBatches = async (departmentId: number) => {
  const response = await fetch(`/api/departments/${departmentId}/sub-batches`);
  const data = await response.json();

  return data.newArrival.map(entry => ({
    departmentSubBatchId: entry.id,  // ← ADD THIS
    subBatchId: entry.sub_batch_id,
    departmentId: entry.department_id,
    quantity: entry.quantity_remaining,
    remarks: entry.remarks
  }));
};
```

#### 2. Update Advance Function

**BEFORE:**
```typescript
const advanceSubBatch = async (
  subBatchId: number,
  fromDepartmentId: number,
  toDepartmentId: number
) => {
  await fetch('/api/sub-batches/advance-department', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subBatchId,
      fromDepartmentId,
      toDepartmentId
    })
  });
};
```

**AFTER:**
```typescript
const advanceSubBatch = async (
  departmentSubBatchId: number,  // ← Changed parameter
  toDepartmentId: number
) => {
  await fetch('/api/sub-batches/advance-department', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      departmentSubBatchId,  // ← Send specific card ID
      toDepartmentId
    })
  });
};
```

#### 3. Update Button/Event Handler

**BEFORE:**
```typescript
// In your Kanban card component
const handleAdvanceClick = () => {
  advanceSubBatch(
    card.subBatchId,
    card.departmentId,
    targetDepartmentId
  );
};
```

**AFTER:**
```typescript
// In your Kanban card component
const handleAdvanceClick = () => {
  advanceSubBatch(
    card.departmentSubBatchId,  // ← Use the card's ID
    targetDepartmentId
  );
};
```

---

## Change #2: Worker Log API (Reject/Alter)

### Backend Code Change

**BEFORE:**
```typescript
// Backend Service: src/services/workerLogService.ts
interface RejectedInput {
  quantity: number;
  sent_to_department_id: number;
  original_department_id: number;  // ❌ Too vague
  reason: string;
}

interface AlteredInput {
  quantity: number;
  sent_to_department_id: number;
  original_department_id: number;  // ❌ Too vague
  reason: string;
}

// Used updateMany which affected ALL entries in department
await tx.department_sub_batches.updateMany({
  where: {
    sub_batch_id: data.sub_batch_id,
    department_id: r.original_department_id,  // ❌ Matches multiple!
    is_current: true,
  },
  data: {
    quantity_remaining: { decrement: r.quantity },
  },
});
```

**Previous Request Body:**
```json
{
  "worker_id": 5,
  "sub_batch_id": 81,
  "quantity_worked": 100,
  "rejected": [{
    "quantity": 20,
    "sent_to_department_id": 29,
    "original_department_id": 21,
    "reason": "Fabric defect"
  }],
  "altered": [{
    "quantity": 10,
    "sent_to_department_id": 21,
    "original_department_id": 21,
    "reason": "Size mismatch"
  }]
}
```

**AFTER:**
```typescript
// Backend Service: src/services/workerLogService.ts
interface RejectedInput {
  quantity: number;
  sent_to_department_id: number;
  source_department_sub_batch_id: number;  // ✅ Specific entry
  reason: string;
}

interface AlteredInput {
  quantity: number;
  sent_to_department_id: number;
  source_department_sub_batch_id: number;  // ✅ Specific entry
  reason: string;
}

// Validates and updates ONE specific entry
const sourceEntry = await tx.department_sub_batches.findUnique({
  where: { id: r.source_department_sub_batch_id },
});

if (!sourceEntry || !sourceEntry.is_current) {
  throw new Error("Invalid source entry");
}

await tx.department_sub_batches.update({
  where: { id: r.source_department_sub_batch_id },  // ✅ Targets one entry
  data: { quantity_remaining: { decrement: r.quantity } },
});
```

**New Request Body:**
```json
{
  "worker_id": 5,
  "sub_batch_id": 81,
  "quantity_worked": 100,
  "rejected": [{
    "quantity": 20,
    "sent_to_department_id": 29,
    "source_department_sub_batch_id": 88,
    "reason": "Fabric defect"
  }],
  "altered": [{
    "quantity": 10,
    "sent_to_department_id": 21,
    "source_department_sub_batch_id": 88,
    "reason": "Size mismatch"
  }]
}
```

### Frontend Changes Required

#### Update Worker Log Submission

**BEFORE:**
```typescript
const submitWorkerLog = async (workerId: number, card: SubBatchCard) => {
  const payload = {
    worker_id: workerId,
    sub_batch_id: card.subBatchId,
    quantity_worked: 100,
    rejected: rejectedPieces.map(r => ({
      quantity: r.quantity,
      sent_to_department_id: r.targetDepartmentId,
      original_department_id: card.departmentId,  // ❌ OLD
      reason: r.reason
    })),
    altered: alteredPieces.map(a => ({
      quantity: a.quantity,
      sent_to_department_id: a.targetDepartmentId,
      original_department_id: card.departmentId,  // ❌ OLD
      reason: a.reason
    }))
  };

  await fetch('/api/worker-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};
```

**AFTER:**
```typescript
const submitWorkerLog = async (workerId: number, card: SubBatchCard) => {
  const payload = {
    worker_id: workerId,
    sub_batch_id: card.subBatchId,
    quantity_worked: 100,
    rejected: rejectedPieces.map(r => ({
      quantity: r.quantity,
      sent_to_department_id: r.targetDepartmentId,
      source_department_sub_batch_id: card.departmentSubBatchId,  // ✅ NEW
      reason: r.reason
    })),
    altered: alteredPieces.map(a => ({
      quantity: a.quantity,
      sent_to_department_id: a.targetDepartmentId,
      source_department_sub_batch_id: card.departmentSubBatchId,  // ✅ NEW
      reason: a.reason
    }))
  };

  await fetch('/api/worker-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};
```

---

## Change #3: Direct Reject API

### Backend Code Change

**BEFORE:**
```typescript
// Backend: src/services/subBatchRejected.ts
interface RejectedData {
  sub_batch_id: number;
  quantity: number;
  reason: string;
  sent_to_department_id: number;
  original_department_id: number;  // ❌ OLD
  worker_log_id?: number;
}
```

**Previous Request:** `POST /api/sub-batch-rejected`
```json
{
  "sub_batch_id": 81,
  "quantity": 20,
  "reason": "Damaged",
  "sent_to_department_id": 29,
  "original_department_id": 21,
  "worker_log_id": 123
}
```

**AFTER:**
```typescript
// Backend: src/services/subBatchRejected.ts
interface RejectedData {
  sub_batch_id: number;
  quantity: number;
  reason: string;
  sent_to_department_id: number;
  source_department_sub_batch_id: number;  // ✅ NEW
  worker_log_id?: number;
}
```

**New Request:** `POST /api/sub-batch-rejected`
```json
{
  "sub_batch_id": 81,
  "quantity": 20,
  "reason": "Damaged",
  "sent_to_department_id": 29,
  "source_department_sub_batch_id": 88,
  "worker_log_id": 123
}
```

### Frontend Changes Required

**BEFORE:**
```typescript
const rejectPieces = async (card: SubBatchCard, quantity: number, reason: string, targetDept: number) => {
  await fetch('/api/sub-batch-rejected', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sub_batch_id: card.subBatchId,
      quantity: quantity,
      reason: reason,
      sent_to_department_id: targetDept,
      original_department_id: card.departmentId  // ❌ OLD
    })
  });
};
```

**AFTER:**
```typescript
const rejectPieces = async (card: SubBatchCard, quantity: number, reason: string, targetDept: number) => {
  await fetch('/api/sub-batch-rejected', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sub_batch_id: card.subBatchId,
      quantity: quantity,
      reason: reason,
      sent_to_department_id: targetDept,
      source_department_sub_batch_id: card.departmentSubBatchId  // ✅ NEW
    })
  });
};
```

---

## Change #4: Direct Alter API

### Backend Code Change

**BEFORE:**
```typescript
// Backend: src/services/subBatchAltered.ts
interface AlteredPieceInput {
  sub_batch_id: number;
  quantity: number;
  target_department_id: number;
  original_department_id: number;  // ❌ OLD
  reason: string;
  worker_log_id?: number;
}
```

**Previous Request:** `POST /api/sub-batch-altered`
```json
{
  "sub_batch_id": 81,
  "quantity": 10,
  "target_department_id": 21,
  "original_department_id": 21,
  "reason": "Size issue",
  "worker_log_id": 123
}
```

**AFTER:**
```typescript
// Backend: src/services/subBatchAltered.ts
interface AlteredPieceInput {
  sub_batch_id: number;
  quantity: number;
  target_department_id: number;
  source_department_sub_batch_id: number;  // ✅ NEW
  reason: string;
  worker_log_id?: number;
}
```

**New Request:** `POST /api/sub-batch-altered`
```json
{
  "sub_batch_id": 81,
  "quantity": 10,
  "target_department_id": 21,
  "source_department_sub_batch_id": 88,
  "reason": "Size issue",
  "worker_log_id": 123
}
```

### Frontend Changes Required

**BEFORE:**
```typescript
const alterPieces = async (card: SubBatchCard, quantity: number, reason: string, targetDept: number) => {
  await fetch('/api/sub-batch-altered', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sub_batch_id: card.subBatchId,
      quantity: quantity,
      target_department_id: targetDept,
      original_department_id: card.departmentId,  // ❌ OLD
      reason: reason
    })
  });
};
```

**AFTER:**
```typescript
const alterPieces = async (card: SubBatchCard, quantity: number, reason: string, targetDept: number) => {
  await fetch('/api/sub-batch-altered', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sub_batch_id: card.subBatchId,
      quantity: quantity,
      target_department_id: targetDept,
      source_department_sub_batch_id: card.departmentSubBatchId,  // ✅ NEW
      reason: reason
    })
  });
};
```

---

## New Endpoint Added: View All Entries for Sub-Batch

### API Details
**Endpoint:** `GET /api/department-sub-batches/sub-batch/:subBatchId`

**Example:** `GET /api/department-sub-batches/sub-batch/81`

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": 88,
      "department_id": 21,
      "sub_batch_id": 81,
      "quantity_remaining": 50,
      "remarks": "Altered",
      "is_current": true,
      "stage": "NEW_ARRIVAL",
      "department": {
        "id": 21,
        "name": "cutting"
      }
    },
    // ... more entries
  ]
}
```

### Purpose
- Debug tool to see all workflow entries for a sub-batch
- Useful for understanding multiple active entries
- Can be used in admin/debug panels

---

## Migration Checklist

### Required Changes:
- [ ] Update TypeScript interfaces to include `departmentSubBatchId`
- [ ] Update fetch functions to save `entry.id` as `departmentSubBatchId`
- [ ] Update advance API calls to use new format
- [ ] Update worker log submission for reject/alter
- [ ] Update direct reject API calls (if used)
- [ ] Update direct alter API calls (if used)
- [ ] Remove `fromDepartmentId` parameter from advance functions
- [ ] Remove `original_department_id` from reject/alter payloads

### Testing Checklist:
- [ ] Test advancing main workflow pieces
- [ ] Test advancing rejected pieces
- [ ] Test advancing altered pieces
- [ ] Test rejecting pieces via worker log
- [ ] Test altering pieces via worker log
- [ ] Test direct reject API
- [ ] Test direct alter API
- [ ] Verify quantities are correct after operations
- [ ] Verify no duplicate active entries are created

---

## Important Notes

1. **Each Kanban card = One `department_sub_batches` entry**
   - The card's ID is the `department_sub_batch_id`
   - Multiple cards can exist for the same sub-batch (main workflow, rejected, altered)

2. **When to use which ID:**
   - Use `departmentSubBatchId` for: Advance, Reject, Alter operations
   - Use `subBatchId` for: Viewing sub-batch details, creating new sub-batches

3. **Error Handling:**
   All APIs now validate:
   - Entry exists
   - Entry is active (`is_current: true`)
   - Sufficient quantity available

   Handle these errors in frontend:
   ```typescript
   try {
     await advanceSubBatch(cardId, targetDept);
   } catch (error) {
     // Show error message to user
     alert(error.message);
   }
   ```

4. **Backwards Compatibility:**
   These changes are **NOT backwards compatible**. Old API calls will fail with error messages like:
   - "departmentSubBatchId is required"
   - "source_department_sub_batch_id is required"
