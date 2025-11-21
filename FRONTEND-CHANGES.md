# Frontend Changes Required for Parent-Child-Dual Workflow

## 🎯 Overview

The backend has implemented a new workflow system for tracking sub-batch assignments through departments. This document describes all the frontend changes needed to support this new workflow.

---

## 📚 Background: Understanding the New Workflow

### Old System (To Be Deprecated)
- Simple assignment: worker gets pieces, updates work, moves forward
- No clear parent-child relationship
- Hard to track "main" card vs "assigned" cards

### New System (Parent-Child-Dual)
**Three Card Types:**

1. **Parent Card** - Department-level overview
   - Shows total received quantity for the department
   - Shows remaining (unassigned) quantity
   - Shows summary of work done (sum of all children)
   - Visible until all pieces are assigned

2. **Child Card** - Individual worker assignment
   - Shows assigned quantity (immutable)
   - Shows worked and altered quantities (editable)
   - Shows remaining quantity (calculated)
   - Can be forwarded when remaining = 0

3. **Dual Card** - Special state
   - The LAST child created when parent remaining = 0
   - Shows BOTH parent summary AND child data
   - Parent card disappears from list
   - When forwarded, parent is archived

---

## 🎨 UI Changes Required

### 1. Department Sub-Batch List View

**Current View (Assumption):**
```
Department A - Sub-Batch #123
├─ Card 1: 40 pieces (assigned to Worker X)
├─ Card 2: 30 pieces (assigned to Worker Y)
└─ Card 3: 30 pieces (Main)
```

**New View Required:**
```
Department A - Sub-Batch #123

┌─────────────────────────────────────────┐
│ 📦 PARENT CARD (Main Overview)          │
│ ───────────────────────────────────────│
│ Received:    100 pieces                 │
│ Remaining:   30 pieces (unassigned)     │
│ Worked:      65 pieces (from children)  │
│ Altered:     5 pieces (from children)   │
│                                         │
│ [➕ Assign to Worker]                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 👤 CHILD CARD - Worker X                │
│ ───────────────────────────────────────│
│ Assigned:    40 pieces (fixed)          │
│ Worked:      35 pieces ✏️               │
│ Altered:     3 pieces ✏️                │
│ Remaining:   2 pieces                   │
│                                         │
│ [✏️ Edit Work] [❌ Delete]              │
│ [➡️ Forward] (disabled: remaining > 0) │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 👤 CHILD CARD - Worker Y                │
│ ───────────────────────────────────────│
│ Assigned:    30 pieces (fixed)          │
│ Worked:      30 pieces ✏️               │
│ Altered:     0 pieces ✏️                │
│ Remaining:   0 pieces ✅                │
│                                         │
│ [✏️ Edit Work] [❌ Delete]              │
│ [➡️ Forward] ✅ READY                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 👤 DUAL CARD - Worker Z ⭐              │
│ ───────────────────────────────────────│
│ 📦 Parent Summary (read-only):          │
│    Received: 100 | Worked: 65 | Altered: 5
│ ───────────────────────────────────────│
│ Assigned:    30 pieces (fixed)          │
│ Worked:      0 pieces ✏️                │
│ Altered:     0 pieces ✏️                │
│ Remaining:   30 pieces                  │
│                                         │
│ [✏️ Edit Work] [❌ Delete]              │
│ [➡️ Forward] (disabled: remaining > 0) │
└─────────────────────────────────────────┘
```

**Key UI Elements:**

1. **Parent Card Display:**
   - Different background color (e.g., light blue)
   - Badge: "MAIN OVERVIEW" or "DEPARTMENT CARD"
   - Shows 4 key metrics: Received, Remaining, Worked, Altered
   - "Assign to Worker" button
   - Hidden when `quantity_remaining = 0`

2. **Child Card Display:**
   - Worker avatar/name prominent
   - Badge: "WORKER ASSIGNMENT"
   - Shows assigned (with lock icon - immutable)
   - Shows worked/altered (with edit icon)
   - Shows remaining (calculated, with progress indicator)
   - Action buttons: Edit Work, Delete, Forward

3. **Dual Card Display:**
   - Special badge: "DUAL CARD" or star icon ⭐
   - Two sections:
     - Top: Parent summary (gray/collapsed, read-only)
     - Bottom: Normal child card fields
   - Different border color (e.g., gold/purple)
   - Note/tooltip: "This card represents all remaining pieces"

---

## 🔌 API Integration

### Base URL
```
const BASE_URL = '/api/department-sub-batches'  // Note: plural!
```

### 0. Create Initial Parent Card (When Sub-Batch Arrives)

**Endpoint:** `POST /receive`

**Description:** Creates the initial parent card when a sub-batch arrives at a department. This is called automatically when pieces enter a department.

**Request:**
```javascript
const createParentCard = async (subBatchId, departmentId, quantity, sentFromDeptId = null) => {
  const response = await fetch(`${BASE_URL}/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subBatchId: subBatchId,
      departmentId: departmentId,
      quantity: quantity,
      sentFromDepartmentId: sentFromDeptId  // Optional
    })
  });
  return await response.json();
};
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Parent card created successfully",
  "data": {
    "id": 100,
    "sub_batch_id": 10,
    "department_id": 2,
    "is_parent": true,
    "is_current": true,
    "quantity_received": 100,
    "quantity_remaining": 100,
    "parent_worked": 0,
    "parent_altered": 0,
    "stage": "NEW_ARRIVAL",
    "remarks": "Initial arrival",
    "department": {
      "id": 2,
      "name": "Cutting"
    },
    "sub_batch": {
      "id": 10,
      "name": "Batch-2024-001"
    }
  }
}
```

**When to Call:**
- Admin creates new sub-batch and sends to first department
- Sub-batch is manually sent to a department
- Pieces return for rework

**Validation:**
- Sub-batch must exist
- Department must exist
- Quantity must be > 0
- Parent card must not already exist for this sub-batch in this department

---

### 1. Get Department Cards

**Endpoint:** `GET /department/:deptId/sub-batch/:subBatchId/cards`

**When to Call:**
- On page load for department view
- After any assignment/update/delete/forward operation
- On refresh

**Request:**
```javascript
const fetchDepartmentCards = async (deptId, subBatchId) => {
  const response = await fetch(
    `${BASE_URL}/department/${deptId}/sub-batch/${subBatchId}/cards`
  );
  return await response.json();
};
```

**Response Structure:**
```javascript
{
  success: true,
  data: {
    parent: {
      id: 100,
      department_id: 2,
      sub_batch_id: 10,
      is_parent: true,
      is_current: true,
      quantity_received: 100,
      quantity_remaining: 30,
      parent_worked: 65,
      parent_altered: 5,
      stage: "IN_PROGRESS",
      department: { id: 2, name: "Cutting" },
      sub_batch: { id: 10, name: "Batch-2024-001" }
    },
    children: [
      {
        id: 121,
        department_id: 2,
        sub_batch_id: 10,
        assigned_worker_id: 5,
        parent_department_sub_batch_id: 100,
        is_parent: false,
        is_dual: false,
        is_forwarded: false,
        child_received: 40,
        child_worked: 35,
        child_altered: 3,
        child_remaining: 2,
        assigned_worker: { id: 5, name: "Worker X" }
      },
      {
        id: 122,
        assigned_worker_id: 6,
        is_dual: false,
        child_received: 30,
        child_worked: 30,
        child_altered: 0,
        child_remaining: 0,
        assigned_worker: { id: 6, name: "Worker Y" }
      },
      {
        id: 123,
        assigned_worker_id: 7,
        is_dual: true,  // ⭐ This is a DUAL CARD
        child_received: 30,
        child_worked: 0,
        child_altered: 0,
        child_remaining: 30,
        assigned_worker: { id: 7, name: "Worker Z" },
        parent_card: {  // ⭐ Parent summary included for dual
          id: 100,
          quantity_received: 100,
          parent_worked: 65,
          parent_altered: 5
        }
      }
    ]
  }
}
```

**UI Rendering Logic:**
```javascript
const renderCards = (data) => {
  const { parent, children } = data;

  return (
    <>
      {/* Show parent only if exists (remaining > 0) */}
      {parent && parent.quantity_remaining > 0 && (
        <ParentCard data={parent} />
      )}

      {/* Show all children */}
      {children.map(child => {
        if (child.is_dual) {
          return <DualCard key={child.id} data={child} />;
        } else {
          return <ChildCard key={child.id} data={child} />;
        }
      })}
    </>
  );
};
```

---

### 2. Assign Pieces to Worker

**Endpoint:** `POST /:parentId/assign`

**When to Call:**
- User clicks "Assign to Worker" button on parent card
- Shows modal/form with worker selection and quantity input

**Request:**
```javascript
const assignPiecesToWorker = async (parentId, workerId, quantity) => {
  const response = await fetch(`${BASE_URL}/${parentId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId: workerId,
      assignedQty: quantity
    })
  });
  return await response.json();
};
```

**UI Flow:**
```
1. User clicks "Assign to Worker" on parent card
2. Modal opens:
   ┌────────────────────────────────────┐
   │ Assign Pieces to Worker            │
   │                                    │
   │ Worker: [Dropdown] ▼               │
   │ Quantity: [___] (max: 30)          │
   │                                    │
   │ Available: 30 pieces               │
   │                                    │
   │      [Cancel]  [Assign]            │
   └────────────────────────────────────┘
3. Validate: quantity > 0 and <= parent.quantity_remaining
4. Submit to API
5. On success: Refresh cards (call GET endpoint)
6. Show success message: "40 pieces assigned to Worker X"
```

**Response:**
```javascript
{
  success: true,
  message: "Worker assigned successfully",
  data: {
    id: 124,
    child_received: 40,
    child_worked: 0,
    child_altered: 0,
    child_remaining: 40,
    is_dual: false,  // Will be true if this was last assignment
    assigned_worker: { id: 5, name: "Worker X" }
  }
}
```

**Special Case - Last Assignment:**
If assigned quantity equals parent remaining, the response will have `is_dual: true`:
```javascript
{
  success: true,
  data: {
    id: 124,
    is_dual: true,  // ⭐ This became a dual card
    parent_card: {  // ⭐ Parent summary included
      id: 100,
      quantity_received: 100,
      parent_worked: 65,
      parent_altered: 5
    }
  }
}
```

**After Success:**
- Parent card disappears (if remaining = 0)
- New dual card appears (if it was last assignment)
- Show notification: "All pieces assigned! Worker Z has the dual card."

---

### 3. Update Child Work

**Endpoint:** `PATCH /child/:childId/work`

**When to Call:**
- User clicks "Edit Work" button on child card
- Supervisor updates worker progress

**Request:**
```javascript
const updateChildWork = async (childId, worked, altered) => {
  const response = await fetch(`${BASE_URL}/child/${childId}/work`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      worked: worked,
      altered: altered
    })
  });
  return await response.json();
};
```

**UI Flow:**
```
1. User clicks "Edit Work" on child card
2. Modal opens with current values:
   ┌────────────────────────────────────┐
   │ Update Work - Worker X             │
   │                                    │
   │ Assigned: 40 pieces (fixed)        │
   │                                    │
   │ Worked:   [35] pieces              │
   │ Altered:  [3]  pieces              │
   │                                    │
   │ Remaining: 2 pieces (calculated)   │
   │                                    │
   │ ⚠️ Worked + Altered cannot exceed 40
   │                                    │
   │      [Cancel]  [Update]            │
   └────────────────────────────────────┘
3. Real-time validation:
   - worked >= 0
   - altered >= 0
   - worked + altered <= child_received
   - Show remaining dynamically
4. Submit to API
5. On success: Refresh cards
6. Parent totals update automatically ✨
```

**Client-Side Validation:**
```javascript
const validateWork = (worked, altered, received) => {
  if (worked < 0 || altered < 0) {
    return "Values cannot be negative";
  }
  if (worked + altered > received) {
    return `Total (${worked + altered}) cannot exceed assigned quantity (${received})`;
  }
  return null; // Valid
};
```

**Response:**
```javascript
{
  success: true,
  message: "Child work updated successfully",
  data: {
    id: 121,
    child_received: 40,
    child_worked: 35,
    child_altered: 3,
    child_remaining: 2,
    parent_card: {
      parent_worked: 65,   // ⭐ Updated automatically
      parent_altered: 8    // ⭐ Updated automatically
    }
  }
}
```

**Important Notes:**
- ⚠️ `child_received` CANNOT be changed (show as read-only/disabled)
- ✨ Parent totals update automatically in the backend
- 📊 **Parent totals include ALL children** (even forwarded) - shows total work done in this department
- 🔄 Can be called multiple times (progress updates)
- 🚫 Cannot update if child is forwarded

---

### 4. Forward Child to Next Department

**Endpoint:** `POST /child/:childId/forward`

**When to Call:**
- User clicks "Forward" button on child card
- Only enabled when `child_remaining === 0`

**Request:**
```javascript
const forwardChild = async (childId, targetDeptId) => {
  const response = await fetch(`${BASE_URL}/child/${childId}/forward`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetDeptId: targetDeptId
    })
  });
  return await response.json();
};
```

**UI Flow:**
```
1. "Forward" button states:
   - Disabled (gray) if child_remaining > 0
     Tooltip: "Complete all work before forwarding (2 pieces remaining)"

   - Enabled (green) if child_remaining === 0
     Tooltip: "Ready to forward to next department"

2. User clicks "Forward" button
3. Modal opens:
   ┌────────────────────────────────────┐
   │ Forward to Next Department         │
   │                                    │
   │ Worker: Worker Y                   │
   │ Pieces: 30 (completed)             │
   │                                    │
   │ Target Department:                 │
   │ [Sewing      ] ▼                   │
   │                                    │
   │ This action cannot be undone.      │
   │                                    │
   │      [Cancel]  [Forward]           │
   └────────────────────────────────────┘

4. User selects department and confirms
5. Submit to API
6. On success:
   - Child card disappears from current dept
   - Show success: "30 pieces forwarded to Sewing"
   - Optionally: Show animation/transition
```

**Button Disable Logic:**
```javascript
const isForwardDisabled = (child) => {
  return child.child_remaining !== 0 || child.is_forwarded;
};

const getForwardTooltip = (child) => {
  if (child.is_forwarded) {
    return "Already forwarded";
  }
  if (child.child_remaining > 0) {
    return `Complete ${child.child_remaining} pieces before forwarding`;
  }
  return "Forward to next department";
};
```

**Response:**
```javascript
{
  success: true,
  message: "Child forwarded successfully",
  data: {
    // New parent created in target department
    id: 125,
    department_id: 3,
    sub_batch_id: 10,
    is_parent: true,
    quantity_received: 30,
    quantity_remaining: 30,
    stage: "NEW_ARRIVAL"
  }
}
```

**Special Case - Forwarding Dual Card:**
- Show warning: "This is the last card. Forwarding will complete this department."
- After forward: Parent in source dept is archived
- Child card disappears from list

---

### 5. Delete Child

**Endpoint:** `DELETE /child/:childId`

**When to Call:**
- User clicks "Delete" button on child card
- Only for non-forwarded children

**Request:**
```javascript
const deleteChild = async (childId) => {
  const response = await fetch(`${BASE_URL}/child/${childId}`, {
    method: 'DELETE'
  });
  return await response.json();
};
```

**UI Flow:**
```
1. User clicks "Delete" button on child card
2. Confirmation dialog:
   ┌────────────────────────────────────┐
   │ ⚠️ Delete Assignment               │
   │                                    │
   │ Worker: Worker X                   │
   │ Assigned: 40 pieces                │
   │ Worked: 35 pieces                  │
   │                                    │
   │ This will restore 40 pieces to     │
   │ the parent card for reassignment.  │
   │                                    │
   │ Are you sure?                      │
   │                                    │
   │      [Cancel]  [Delete]            │
   └────────────────────────────────────┘

3. User confirms
4. Submit to API
5. On success:
   - Child card disappears
   - Parent card appears (if was hidden)
   - Parent quantities updated
   - Show success: "Assignment deleted. 40 pieces restored to parent."
```

**Button Disable Logic:**
```javascript
const isDeleteDisabled = (child) => {
  return child.is_forwarded;
};

const getDeleteTooltip = (child) => {
  if (child.is_forwarded) {
    return "Cannot delete forwarded assignments";
  }
  return "Delete this assignment";
};
```

**Response:**
```javascript
{
  success: true,
  message: "Child deleted successfully",
  data: {
    // Updated parent
    id: 100,
    quantity_remaining: 70,  // ⭐ Restored
    parent_worked: 30,       // ⭐ Adjusted
    parent_altered: 2,       // ⭐ Adjusted
    child_cards: [/* remaining children */]
  }
}
```

**Special Case - Deleting Dual Card:**
- Show warning: "This is a dual card. Deleting will restore the parent card."
- After delete: Parent card reappears with restored quantities

---

## 🎯 Component Structure Recommendations

### Suggested Components:

```
components/
├── DepartmentSubBatch/
│   ├── DepartmentSubBatchList.jsx       # Main container
│   ├── ParentCard.jsx                    # Parent card display
│   ├── ChildCard.jsx                     # Child card display
│   ├── DualCard.jsx                      # Dual card (or reuse ChildCard with prop)
│   ├── AssignWorkerModal.jsx            # Assignment modal
│   ├── UpdateWorkModal.jsx              # Work update modal
│   ├── ForwardChildModal.jsx            # Forward modal
│   └── ConfirmDeleteDialog.jsx          # Delete confirmation
```

### Data Flow:

```javascript
// Main Container Component
const DepartmentSubBatchList = ({ deptId, subBatchId }) => {
  const [cards, setCards] = useState({ parent: null, children: [] });
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    setLoading(true);
    const result = await fetchDepartmentCards(deptId, subBatchId);
    if (result.success) {
      setCards(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, [deptId, subBatchId]);

  const handleAssign = async (parentId, workerId, qty) => {
    const result = await assignPiecesToWorker(parentId, workerId, qty);
    if (result.success) {
      await fetchCards(); // Refresh
      showNotification("Assignment successful");
    }
  };

  const handleUpdateWork = async (childId, worked, altered) => {
    const result = await updateChildWork(childId, worked, altered);
    if (result.success) {
      await fetchCards(); // Refresh
      showNotification("Work updated");
    }
  };

  const handleForward = async (childId, targetDeptId) => {
    const result = await forwardChild(childId, targetDeptId);
    if (result.success) {
      await fetchCards(); // Refresh
      showNotification("Forwarded successfully");
    }
  };

  const handleDelete = async (childId) => {
    const result = await deleteChild(childId);
    if (result.success) {
      await fetchCards(); // Refresh
      showNotification("Assignment deleted");
    }
  };

  return (
    <div className="department-cards">
      {loading && <LoadingSpinner />}

      {/* Parent Card */}
      {cards.parent && cards.parent.quantity_remaining > 0 && (
        <ParentCard
          data={cards.parent}
          onAssign={handleAssign}
        />
      )}

      {/* Children Cards */}
      {cards.children.map(child => (
        child.is_dual ? (
          <DualCard
            key={child.id}
            data={child}
            onUpdateWork={handleUpdateWork}
            onForward={handleForward}
            onDelete={handleDelete}
          />
        ) : (
          <ChildCard
            key={child.id}
            data={child}
            onUpdateWork={handleUpdateWork}
            onForward={handleForward}
            onDelete={handleDelete}
          />
        )
      ))}
    </div>
  );
};
```

---

## 📊 Visual Design Guidelines

### Color Scheme Recommendations:

```css
/* Parent Card */
.parent-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 3px solid #5a67d8;
  border-radius: 12px;
}

/* Child Card */
.child-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

.child-card.ready-to-forward {
  border-color: #48bb78; /* Green when remaining = 0 */
}

/* Dual Card */
.dual-card {
  background: linear-gradient(135deg, #f6e05e 0%, #ed8936 100%);
  border: 3px solid #dd6b20;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(237, 137, 54, 0.3);
}

.dual-card-badge {
  background: gold;
  color: #744210;
  font-weight: bold;
}

/* Parent summary in dual card */
.dual-parent-summary {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  backdrop-filter: blur(10px);
}
```

### Icons Recommendations:

- 📦 Parent Card - Box icon
- 👤 Child Card - User icon
- ⭐ Dual Card - Star/Crown icon
- 🔒 Immutable field (child_received) - Lock icon
- ✏️ Editable fields (worked/altered) - Edit icon
- ✅ Ready to forward - Check icon
- ❌ Delete - Trash icon
- ➡️ Forward - Arrow right icon
- ➕ Assign - Plus icon

---

## ⚠️ Validation & Error Handling

### Client-Side Validations:

```javascript
// 1. Assign Worker
const validateAssignment = (quantity, parentRemaining) => {
  if (!quantity || quantity <= 0) {
    return "Quantity must be greater than 0";
  }
  if (quantity > parentRemaining) {
    return `Cannot assign more than available (${parentRemaining} pieces)`;
  }
  return null;
};

// 2. Update Work
const validateWork = (worked, altered, received) => {
  if (worked < 0 || altered < 0) {
    return "Values cannot be negative";
  }
  if (worked + altered > received) {
    return `Total cannot exceed assigned quantity (${received})`;
  }
  return null;
};

// 3. Forward Child
const canForward = (child) => {
  return child.child_remaining === 0 && !child.is_forwarded;
};

// 4. Delete Child
const canDelete = (child) => {
  return !child.is_forwarded;
};
```

### API Error Handling:

```javascript
const handleApiError = (error, operation) => {
  if (error.response?.data?.message) {
    showErrorNotification(error.response.data.message);
  } else {
    showErrorNotification(`Failed to ${operation}. Please try again.`);
  }
  console.error(`${operation} error:`, error);
};

// Usage
try {
  const result = await assignPiecesToWorker(parentId, workerId, qty);
  if (!result.success) {
    throw new Error(result.message);
  }
  // Success handling
} catch (error) {
  handleApiError(error, "assign worker");
}
```

### Common Error Messages from Backend:

```javascript
// Store these for user-friendly display
const ERROR_MESSAGES = {
  "Insufficient quantity": "Not enough pieces available. Please check the remaining quantity.",
  "Cannot forward child": "This assignment cannot be forwarded yet. Ensure all work is completed (remaining = 0).",
  "Cannot delete forwarded child": "This assignment has already been forwarded and cannot be deleted.",
  "Cannot update work for forwarded child": "Cannot edit work for forwarded assignments.",
  "Invalid quantities": "The worked and altered quantities must not exceed the assigned quantity.",
  "Parent card not found": "The parent card could not be found. Please refresh and try again.",
  "Child card not found": "The worker assignment could not be found. Please refresh and try again.",
};
```

---

## 🔔 User Notifications

### Success Messages:

```javascript
const NOTIFICATIONS = {
  assignSuccess: (workerName, qty) =>
    `✅ ${qty} pieces assigned to ${workerName}`,

  assignSuccessDual: (workerName, qty) =>
    `✅ ${qty} pieces assigned to ${workerName}. All pieces now assigned! This is a dual card.`,

  updateWorkSuccess: (workerName) =>
    `✅ Work updated for ${workerName}`,

  forwardSuccess: (qty, deptName) =>
    `✅ ${qty} pieces forwarded to ${deptName}`,

  deleteSuccess: (qty) =>
    `✅ Assignment deleted. ${qty} pieces restored to parent.`,

  deleteDualSuccess: (qty) =>
    `✅ Dual card deleted. ${qty} pieces restored. Parent card is now visible.`,
};
```

### Warning Messages:

```javascript
const WARNINGS = {
  forwardDual: "⚠️ This is a dual card. Forwarding will complete this department.",

  deleteDual: "⚠️ This is a dual card. Deleting will restore the parent card.",

  lastAssignment: (remaining) =>
    `⚠️ Assigning ${remaining} pieces will create a dual card (last assignment).`,
};
```

---

## 🧪 Testing Checklist for Frontend

### Test Scenarios:

**1. Parent Card Display**
- [ ] Parent card shows when remaining > 0
- [ ] Parent card shows correct quantities
- [ ] Parent card hides when remaining = 0
- [ ] "Assign Worker" button works

**2. Child Card Display**
- [ ] Child cards list correctly
- [ ] Worker names display
- [ ] Quantities are correct
- [ ] Immutable field (received) is locked/disabled
- [ ] Edit/Delete/Forward buttons show correctly

**3. Dual Card Display**
- [ ] Dual card has special styling
- [ ] Parent summary shows at top
- [ ] Parent summary is read-only
- [ ] Dual badge/icon displays

**4. Assign Worker**
- [ ] Modal opens with worker list
- [ ] Quantity validation works
- [ ] Cannot assign more than remaining
- [ ] Success creates new child card
- [ ] Parent remaining decreases
- [ ] Last assignment creates dual card
- [ ] Parent disappears when dual created

**5. Update Work**
- [ ] Modal opens with current values
- [ ] Real-time remaining calculation
- [ ] Validation: worked + altered <= received
- [ ] Success updates child card
- [ ] Parent totals update automatically
- [ ] Cannot update forwarded child

**6. Forward Child**
- [ ] Button disabled when remaining > 0
- [ ] Button enabled when remaining = 0
- [ ] Modal shows department selection
- [ ] Success removes child from list
- [ ] Forwarding dual archives parent
- [ ] Cannot forward twice

**7. Delete Child**
- [ ] Confirmation dialog shows
- [ ] Success removes child card
- [ ] Parent quantities restored
- [ ] Parent reappears if was hidden
- [ ] Cannot delete forwarded child

**8. Edge Cases**
- [ ] Empty state: no parent, no children
- [ ] Loading states
- [ ] Error states
- [ ] Network failures
- [ ] Concurrent updates

---

## 🚀 Implementation Priority

### Phase 1 (Critical - Must Have):
1. ✅ API integration for GET cards
2. ✅ Display parent card
3. ✅ Display child cards
4. ✅ Assign worker functionality
5. ✅ Update work functionality

### Phase 2 (Important):
6. ✅ Forward child functionality
7. ✅ Delete child functionality
8. ✅ Dual card display

### Phase 3 (Nice to Have):
9. ⭐ Animations/transitions
10. ⭐ Real-time updates (websockets)
11. ⭐ Bulk operations
12. ⭐ Advanced filtering/sorting

---

## 📋 Quick Reference: API Summary

**Base:** `/api/department-sub-batches` (plural!)

| Operation | Method | Full Endpoint | Body |
|-----------|--------|---------------|------|
| Create parent | POST | `/api/department-sub-batches/receive` | `{ subBatchId, departmentId, quantity, sentFromDepartmentId? }` |
| Get cards | GET | `/api/department-sub-batches/department/:deptId/sub-batch/:subBatchId/cards` | - |
| Assign worker | POST | `/api/department-sub-batches/:parentId/assign` | `{ workerId, assignedQty }` |
| Update work | PATCH | `/api/department-sub-batches/child/:childId/work` | `{ worked, altered }` |
| Forward child | POST | `/api/department-sub-batches/child/:childId/forward` | `{ targetDeptId }` |
| Delete child | DELETE | `/api/department-sub-batches/child/:childId` | - |

---

## 🎓 Key Concepts for Frontend Dev

1. **Parent Card** = Department overview, shows total received and remaining
2. **Child Card** = Worker assignment, shows individual worker's pieces
3. **Dual Card** = Special child that holds parent summary when all assigned
4. **child_received is IMMUTABLE** = Cannot change after creation (show locked)
5. **Parent remaining only decreases on assignment** = NOT when work updated
6. **Parent worked/altered are sums** = Calculated from all children
7. **Can only forward when remaining = 0** = Disable button otherwise
8. **Cannot edit/delete forwarded children** = They're in another department now

---

## 📞 Questions for Backend Dev?

If you have questions while implementing:
1. Check `NEW_WORKFLOW_API_DOCUMENTATION.md` for detailed API docs
2. Check `IMPLEMENTATION_SUMMARY.md` for workflow overview
3. Test endpoints in Postman/Thunder Client first
4. Backend base URL: `http://localhost:5000/api/department-sub-batches` (plural and port 5000!)

---

**Good luck with implementation! 🚀**

**All the backend APIs are ready and tested. Just integrate with these endpoints and follow the UI guidelines above.**
