# Scenario 6: Full End-to-End Workflow Testing

**Date:** 2025-12-02
**Tester:** Sadin + BlueShark-Stark
**Status:** IN PROGRESS

---

## Objective
Test complete production workflow from start to finish: Dep-1 → Dep-2 → Dep-3 → Complete

## Business Rules
- Sub-batches flow through departments in order of the defined workflow
- At each department: assign workers → complete work → send to next department
- Final department completion marks the sub-batch as COMPLETE
- Track all quantities: received, worked, altered, rejected, remaining

---

## Pre-Test State

### Current Test Data
From Scenarios 4 & 5:
- **Batch-T1** with sub-batches SB-T1, SB-T2
- SB-T1: Has rejection flow data
- SB-T2: Has alteration/rework flow data

### Workflow
Dep-1 → Dep-2 → Dep-3 (if exists)

---

## Test Steps

### Step 1: Verify Current State
- [x] Check Dep-1 Kanban board
- [x] Check Dep-2 Kanban board
- [x] Check Dep-3 Kanban board (if applicable)
- [x] Document existing cards and their statuses

**Observations:**
```
Dep-2 Kanban State:
- SB-T2 rework card visible in "In Progress" column
- Shows: Remaining: 0 pcs, Processed: 44 pcs, Altered: 5 pcs
- Status: Assigned
- Worker D2-W3 assigned to 5 pcs of rework

Dep-3 Kanban State:
- After send from Dep-2: SB-T2 appears in "New Arrivals"
- Shows: Remaining: 5 pcs
- Status: Unassigned
```

---

### Step 2: Complete Remaining Work at Dep-2
For the rework card (SB-T2 with 5 pcs):
- [x] Assign workers to the 5 pcs
- [x] Complete the work
- [x] Send to next department (Dep-3 or mark complete)

**Observations:**
```
Dep-2 Processing:
- Assigned D2-W3 worker to 5 pcs of rework
- Worker assignment successful
- Completed work on 5 pcs
- Sent to Dep-3 via "Send to Department" dropdown
- Success message: "Successfully sent to department!"
- Card moved from Dep-2 to Dep-3 New Arrivals
```

---

### Step 3: Process at Final Department
- [x] Card arrives at final department
- [x] Assign workers
- [x] Complete all work
- [ ] Verify "Mark Complete" option appears

**Observations:**
```
Dep-3 Processing:
- Card arrived in New Arrivals with 5 pcs (rework from Dep-2)
- Assigned D3-W1 to all 5 pieces
- Worker assignment successful
- "Work Complete! All 5 pieces have been processed" message displayed
- Card moved from New Arrivals → In Progress
- Kanban shows: Remaining: 0 pcs, Processed: 5 pcs (green)
- Activity History shows 2 events: Arrived + D3-W1 assigned

Issues Confirmed (previously logged):
- Issue #8: Qty Received shows 0 for D3-W1 (should be 5)
- Issue #7: Dep-2 still shows "Rework" badge

Working Correctly:
✅ Worker assignment flow
✅ Work completion detection
✅ Activity History tracking
✅ Kanban card status updates
✅ Processed count display
```

---

### Step 4: Verify Final Completion
- [x] Sub-batch marked as COMPLETE
- [x] All quantities accounted for
- [x] History shows full journey
- [ ] Batch totals update correctly (not verified)

**Observations:**
```
Final Completion Flow:
1. Changed status to "Completed" via dropdown
2. "Stage updated successfully!" message shown
3. Card moved to Completed column in Kanban
4. Clicked "Mark Sub-batch as Completed" green button
5. Confirmation dialog appeared with "yes" typing requirement
6. Typed "Yes" and clicked "Mark as Completed"
7. "Sub-batch has been marked as COMPLETED! It can no longer be moved."

Final State:
- Status: Completed
- Send to Department: "Last department - no next department available"
- Production Summary: Received: 5, Worked: 5, Remaining: 0
- Activity History: 2 events + Current Status: COMPLETED
- Route Details: Dep-1 → Dep-2 → Dep-3 (green dot)

Issue Found:
- Issue #9: "Send To" button still visible on Completed card in Kanban
  (Should be hidden for completed sub-batches)

SCENARIO 6 COMPLETE!
```

---

## Issues Found

### Issue #7: Dep-2 "Rework" Badge Semantic Issue
**Severity:** Low (UX/semantic)
**Status:** LOGGED - Fix Later

**Problem:**
In Dep-3 Task Details modal, Dep-2 shows "Rework" badge, but rework was actually performed at Dep-1. Dep-2 just received the rework pieces and passed them through.

**Expected Behavior:**
- "Rework" badge should only appear at the department where rework was PERFORMED (Dep-1)
- Dep-2 should show "Return" badge or no special badge (it's a pass-through)

**Impact:**
- Users might be confused about where rework actually happened
- Core functionality unaffected

**Fix Suggestion:**
- Add logic to distinguish between "performed rework" vs "received rework items"
- Could use `entry_type: 'RETURN_PASSTHROUGH'` for departments that just passed through rework

---

### Issue #8: Qty Received Inconsistency at Dep-2
**Severity:** Low (Display)
**Status:** LOGGED - Fix Later

**Problem:**
In Completed Departments section at Dep-3, Dep-2 shows:
- Qty Received: 0
- Qty Worked: 0

But Dep-2 actually received and worked on 5 pcs of rework.

**Expected Behavior:**
- Qty Received: 5
- Qty Worked: 5

**Impact:**
- Data display inconsistency
- Core workflow data is correct in database
- Just a display/aggregation issue

**Fix Suggestion:**
- Review backend aggregation logic for `quantity_received` field
- Ensure rework quantities are counted correctly

---

### Issue #9: "Send To" Button Visible on Completed Cards
**Severity:** Medium (UX confusion)
**Status:** LOGGED - Fix Later

**Problem:**
After marking SB-T2 as COMPLETED (final irreversible status), the Kanban card in "Completed" column still shows "Send To" dropdown button.

**Current Behavior:**
- Sub-batch at last department (Dep-3)
- Sub-batch marked as COMPLETED
- Modal correctly says "Last department - no next department available"
- BUT card still shows actionable "Send To" button

**Expected Behavior:**
- Hide "Send To" button for completed sub-batches, OR
- Show disabled button with tooltip "Cannot send - sub-batch completed"

**Impact:**
- UX confusion - users may think they can still send
- Clicking "Send To" would likely fail/error
- Inconsistent with modal which correctly disables sending

**Fix Suggestion:**
- In Kanban card component, check if `status === 'COMPLETED'` and hide/disable Send To button
- Or check if `isLastDepartment && isCompleted` to determine button visibility

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Verify current state | ✅ | Dep-2 and Dep-3 boards verified |
| Complete work at Dep-2 | ✅ | 5 pcs rework sent to Dep-3 |
| Process at final dept | ✅ | D3-W1 assigned, all 5 pcs processed |
| Final completion | ✅ | Sub-batch marked as COMPLETED |

### Issues Summary
| Issue | Severity | Status |
|-------|----------|--------|
| #7 - Rework badge semantic | Low | LOGGED |
| #8 - Qty Received display | Low | LOGGED |
| #9 - Send To on completed cards | Medium | LOGGED |

---

## Notes

- This scenario tests the "happy path" of normal production flow
- Builds on data from Scenarios 4 & 5

---

**Prerequisites:** Scenarios 4 & 5 completed
