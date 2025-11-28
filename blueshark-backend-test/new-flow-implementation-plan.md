UPDATED DETAILED SCENARIO (FINAL SPEC MATCHING NEW LOGIC)
FINAL IMPLEMENTATION PLAN — PLAIN TEXT (for Claude Code / Developers)

INTRODUCTION
This document defines the final implementation plan for the Sub-Batch production system with the updated assignment/dual-card behavior. It is written for a coding agent (Claude Code) and developers to implement exactly.

CONTENTS

1. Overview

2. Key definitions

3. Core principles

4. Data model (entities)

5. Assignment logic

6. Work update logic

7. Alter logic

8. Forwarding logic

9. Delete-child logic

10. Completion logic

11. API endpoints (required)

12. Validation rules

13. Implementation blueprint (step-by-step pseudo)

14. ASCII flow diagram

15. Edge cases

16. Developer notes and expectations

17. OVERVIEW

- Admin creates a root sub-batch (original quantity, e.g., 100) and defines the production path (ordered departments).
- When a department receives quantity, it becomes a department-specific parent card with Received, Worked, Altered, Remaining.
- Supervisor can assign pieces (child sub-batches) to workers. Parent Remaining decreases by assigned quantity.
- Child cards hold Received (assigned), Worked, Altered, Remaining. Child Remaining = Received − (Worked + Altered).
- A child can be forwarded only when child Remaining == 0.
- When Parent Remaining becomes 0 (all assigned), the last child becomes the dual card (temporary parent+child view). When that dual child leaves the department, parent data is removed and it continues as a normal child in next department.
- Deleting a child restores its Received back to the parent Remaining and subtracts its worked/altered from parent totals.

2. KEY DEFINITIONS
   Parent Sub-batch (department instance): tracks department-level totals and assignment state:

- Received (total received for this department instance)
- Worked (sum of worked across children)
- Altered (sum of altered across children)
- Remaining = Received − Sum(child.Received) (Important: Remaining decreases only on assignment)

Child Sub-batch (assignment to worker):

- Received (assigned quantity, immutable after creation)
- Worked (updated by supervisor; used for wage etc.)
- Altered (pieces found altered by this child)
- Remaining = Received − (Worked + Altered)
- isDual (true if this child is the last child created and parentRemaining == 0)
- isDeleted flag

Dual Card:

- The last child when parentRemaining becomes 0. Shows a read-only parent summary plus regular child fields. When moved forward, parent section removed.

3. CORE PRINCIPLES

- ParentRemaining decreases only on assignment; not when child work is updated.
- Child controls forwarding: only child.remaining == 0 may be forwarded.
- Parent Worked and Parent Altered are calculated as sums of child.worked and child.altered respectively.
- Parent disappears (read-only removed) when parentRemaining == 0; the last child displays parent summary temporarily.
- Deleting a child restores parentRemaining and adjusts parentWorked/parentAltered.
- Child.received is immutable after creation. Child.worked and child.altered can be edited (by supervisor).

4. DATA MODEL (ENTITIES)
   SubBatch (root)

- id: string
- name: string
- originalQuantity: integer
- productionPath: ordered list of departmentIds
- status: enum {not_started, in_progress, completed}
- createdAt, updatedAt

DepartmentSubBatch (instance per department)

- id: string
- subBatchId: string
- departmentId: string
- parentReceived: integer (equals quantity received in this dept instance)
- parentWorked: integer (derived)
- parentAltered: integer (derived)
- parentRemaining: integer (parentReceived − sum(child.received))
- state: enum {parent, dual, children_visible}
- createdAt, updatedAt

ChildAssignment (assignment card)

- id: string
- departmentSubBatchId: string
- workerId: string (nullable if unassigned placeholder)
- received: integer (assigned qty; immutable after creation)
- worked: integer
- altered: integer
- remaining: integer (derived: received − (worked + altered))
- isDual: boolean
- isDeleted: boolean
- createdAt, updatedAt

Movement / Transfer Record (ledger) — optional but recommended

- id, fromDept, toDept, quantity, type (forward, return, reject), sourceChildId, timestamp

AuditLog (immutable): record who changed what and when

5. ASSIGNMENT LOGIC
   When supervisor assigns X pieces from parent to a worker:

- Validate X ≤ parent.parentRemaining.
- Create ChildAssignment with received = X, worked = 0, altered = 0, remaining = X, isDual = false.
- parent.parentRemaining -= X
- If parent.parentRemaining == 0 then:

  - Mark the newly created child.isDual = true
  - Parent summary remains visible _only inside_ that dual child (parent card hidden in list, but data retained)

- Parent.parentWorked and parent.parentAltered are recalculated from child sums; parent.remaining is not changed by child.worked updates.

Notes:

- If a child is assigned and worker "took" materials but hasn't updated worked yet, child.received > 0 and child.worked may be 0. That's valid.

6. WORK UPDATE LOGIC
   Supervisor edits child work records (via an EDIT action):

- New values must satisfy: worked + altered ≤ received.
- Update child.worked = newWorked; child.altered = newAltered; child.remaining = received − (worked + altered).
- Recompute parent.parentWorked = Sum(child.worked for non-deleted children)
- Recompute parent.parentAltered = Sum(child.altered)
- Parent.parentRemaining remains unchanged (assignment-only)
- If child.remaining becomes 0 then child is eligible to forward.

Restrictions:

- Child.received cannot be changed after creation.
- Child.worked & child.altered can be updated any number of times until forwarded (or deleted).

7. ALTER LOGIC
   When a child reports altered pieces:

- child.altered is set (part of work update)
- child.remaining recalculated
- parent.parentAltered updated as sum(child.altered)
- To rework altered pieces: create a transfer/forward of quantity = child.altered from current department to target department (can be any department, not necessarily previous). Implementation:

  - Create a Movement record: fromDept=current, toDept=target, qty=child.altered, type=alter
  - At receiving department, create DepartmentSubBatch instance with parentReceived = alteredQty; parentRemaining = alteredQty; state=parent. That department treats it as a parent and can assign it to its workers (split into children).

- altered pieces count is reported at parent summary as informational.

8. FORWARDING LOGIC
   A child can be forwarded only if child.remaining == 0 and child.isDeleted == false.
   Forward operation:

- Validate eligibility.
- Create new DepartmentSubBatch for nextDept in the path (or target dept if custom forward) with parentReceived = child.received, parentWorked = 0, parentAltered = 0, parentRemaining = child.received, state = parent.
- Create a Movement record linking child -> new DepartmentSubBatch.
- If child.isDual == true:

  - Remove parent-section data (parent summary) from that record (parent is considered fully consumed for this dept).
  - Mark the DepartmentSubBatch record in original department as archived/hidden (no parent visible).

- Mark child as forwarded (or archived in source department).
- If child was dual, make sure no duplicate parent remains.

9. DELETE CHILD LOGIC
   Deleting a child before it has been forwarded:

- Allowed only if child has not been forwarded.
- Effects:

  - parent.parentRemaining += child.received
  - parent.parentWorked -= child.worked
  - parent.parentAltered -= child.altered
  - child.isDeleted = true

- If deleted child was the dual card:

  - Parent must be re-shown (parentRemaining now > 0). Parent summary should be available again.
  - Choose policy: keep last-created-child as new dual when parentRemaining becomes 0 again, or keep parent visible until next full assignment — implement per spec: parent remains until last assignment sets parentRemaining == 0 again.

Restrictions:

- Cannot delete a child that has already been forwarded (prevent deletion after forward).

10. COMPLETION LOGIC
    Department-level completion (for that DepartmentSubBatch):

- When all children are either forwarded/deleted and no active child has remaining > 0, and parentRemaining == 0 (or there is no parent visible because last child was dual), department instance can be marked completed.

Parent / root SubBatch completion:

- Consider root sub-batch completed when all quantities across all branches have reached terminal states (completed/forwarded to final department or rejected) and final department children are completed.
- Implementation approach:

  - Compute totalCompleted = Sum(all child.received where that child is completed at final department)
  - If totalCompleted + totalRejected == root.originalQuantity then mark root as completed.

11. API ENDPOINTS (REQUIRED)
    POST /subbatch → create root subbatch (admin)
    GET /subbatch/{id} → details + department path + child tree
    POST /department/{deptId}/receive → create DepartmentSubBatch (when forward arrives)
    GET /department/{deptId}/subbatches → list active department batches (parent and children)
    POST /departmentSubbatch/{id}/assign → assign X pieces to worker → creates ChildAssignment
    PATCH /child/{childId} → update worked/altered (edit)
    POST /child/{childId}/forward → forward child to next dept
    DELETE /child/{childId} → delete child (restore parent)
    GET /admin/overview → admin summary (sent/altered/completed/remaining)
    POST /movement → create ledger entry (optional)
    GET /subbatch/{id}/trace → full trace of movements and child branches

12. VALIDATION RULES
    Assignment:

- assignedQty > 0
- assignedQty ≤ parent.parentRemaining
- cannot assign when parent.state is dual and parentRemaining == 0? (assignment allowed only if parentRemaining > 0)

Work updates:

- worked ≥ 0, altered ≥ 0
- worked + altered ≤ received
- cannot update after forward

Forward:

- child.remaining == 0
- child.isDeleted == false
- if dual: remove parent metadata on forward

Delete:

- cannot delete forwarded child
- update parent totals and parentRemaining on delete

13. IMPLEMENTATION BLUEPRINT (STEP-BY-STEP PSEUDOCODE)

A. Receiving a root sub-batch at Department:

- create DepartmentSubBatch:
  parentReceived = qty
  parentWorked = 0
  parentAltered = 0
  parentRemaining = qty
  state = "parent"

B. Assign pieces (supervisor action):
function assignPieces(departmentSubBatchId, assignedQty, workerId):
load deptBatch
require assignedQty ≤ deptBatch.parentRemaining
create child:
received = assignedQty
worked = 0
altered = 0
remaining = assignedQty
isDual = false
deptBatch.parentRemaining -= assignedQty
save child and deptBatch
if deptBatch.parentRemaining == 0:
child.isDual = true
deptBatch.state = "hidden_parent" or similar
save changes

C. Update child work:
function updateChildWork(childId, newWorked, newAltered):
child = load child
require newWorked + newAltered ≤ child.received
child.worked = newWorked
child.altered = newAltered
child.remaining = child.received − (newWorked + newAltered)
save child
parent = load deptBatch
parent.parentWorked = sum(child.worked for all non-deleted children)
parent.parentAltered = sum(child.altered for all non-deleted children)
save parent

D. Forward child:
function forwardChild(childId, targetDept):
child = load child
require child.remaining == 0
require not child.isDeleted
create new DepartmentSubBatch at targetDept:
parentReceived = child.received
parentWorked = 0
parentAltered = 0
parentRemaining = child.received
state = "parent"
create Movement ledger record linking child -> new deptSubBatch
mark child as forwarded (or archived in source dept)
if child.isDual:
// parent summary removed permanently for this department
delete/hide parent info for original DepartmentSubBatch

E. Delete child:
function deleteChild(childId):
child = load child
require not child.forwarded
parent = load deptBatch
parent.parentRemaining += child.received
parent.parentWorked -= child.worked
parent.parentAltered -= child.altered
child.isDeleted = true
save changes
if child.isDual:
// parent must be restored / re-visible
deptBatch.state = "parent"
save

14. ASCII FLOW DIAGRAM
    RECEIVE → PARENT CREATED (100)
    ASSIGN 40 → CHILD A1 (parentRemaining 60)
    ASSIGN 30 → CHILD A2 (parentRemaining 30)
    ASSIGN 30 → CHILD A3 (now dual; parentRemaining 0; parent hidden)
    [A1] 40 pcs → update work → forward when remaining == 0
    [A2] 30 pcs → may have altered → split/return
    [A3] 30 pcs (dual) → holds parent summary; when forwarded, parent summary removed

15. EDGE CASES

- Child assigned with 0 worked for days — valid.
- Child edited after partial forward — should be prevented.
- Child deleted after some work — parent totals must be updated correctly.
- Multiple altered returns to any department — each altered return becomes its own DepartmentSubBatch to be assigned and tracked.
- ParentRemaining restoration: if deletion causes parentRemaining > 0 and a dual existed, dual should revert to normal child and parent shown again.

16. DEVELOPER NOTES & EXPECTATIONS

- Maintain immutability for created child.received; only worked/altered change.
- Keep a ledger (Movement) for traceability — critical for payroll, audits, QC.
- Keep strong validation at API layer to prevent negative counts or over-forwarding.
- Use DB transactions for operations that touch multiple entities (assign, updateChild, forward, deleteChild) to keep consistency.
- Keep audit logs for any manual override (billable toggle, mark completed manually).
- Implement unit tests for each flow: assign→update→forward→delete, including concurrency tests (optimistic lock on deptBatch/child).
- UI responsibilities:

  - Show parent summary inside dual child when parentRemaining == 0
  - Disable forward button on child unless child.remaining == 0
  - Disable delete if forwarded
  - Reflect parent sums in real time after child updates

17. WAGE / BILLING NOTES (short)

- Worker wages are calculated using child.worked × unitPrice (supervisor sets unitPrice on records).
- Billable flag can be added per child.workRecord if required; system should persist billable boolean per child.work update.
- Rework/altered pieces can be non-billable if business requires (toggle on editing or rule).

END — PLAIN TEXT IMPLEMENTATION PLAN
Use this exact file as the instruction set for Claude Code or the developers. If you want, I can now:

- produce SQL DDL for the proposed data model,
- generate example API controllers (Node/Express or Django),
- or produce unit test cases for the flows above.
  Tell me which artifact to produce next.
