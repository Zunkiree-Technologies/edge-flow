# Scenario 5: Alteration Flow Testing

**Date:** 2025-12-02
**Tester:** Sadin + BlueShark-Stark
**Status:** ✅ COMPLETED

---

## Objective
Test the alteration workflow - items sent BACK to a PREVIOUS department for rework.

## Business Rules (from BUSINESS_RULES.md)
- **Alteration** = Fixable items sent BACK to PREVIOUS department
- Creates a **yellow card** with "Alteration" badge
- **CANNOT** alter from FIRST department (no previous dept)
- Must select worker whose work has defects
- Must provide alteration reason
- After rework, items continue through normal workflow

---

## Pre-Test State

### Kanban Board (Dep-1)
| Column | Card | Status | Details |
|--------|------|--------|---------|
| New Arrivals | SB-T2 | Alteration (yellow) | Remaining: 5 pcs |
| In Progress | SB-T1 | Assigned (blue) | Remaining: 20 pcs, Processed: 20 pcs, Rejected: 10 pcs |
| Completed | - | Empty | No items |

### Test Data
- **SB-T2** is an altered card that was sent back from a later department to Dep-1
- Original batch: Batch-T1

---

## Test Steps

### Step 1: Open Altered Card Modal
- [x] Click on SB-T2 (yellow "Alteration" badge)
- [x] Verify modal opens with altered task details
- [x] Check for: source department, alteration reason, route details

**Observations:**
```
Modal opens with "Task Details" title
Yellow banner shows:
- "Alteration Card - Rework Required"
- "5 pieces sent back from Dep-2"
- Reason: "Stitching uneven - needs re-stitch"
- Received: 12/01/2025

Task Information:
- Roll/Batch: Batch-T1
- Sub Batch: SB-T2
- Total Quantity: 49 (original sub-batch total)
- Status: Not Started
- Sent from: Dep-2

Route Details shows workflow with color indicators:
- Green: Dep-1 (Main sub-batch)
- Yellow: Dep-2 (Current - Altered)
- Gray: Dep-3
```

**Screenshot:** temp_ss/image copy 3.png

---

### Step 2: Verify Alteration Details
- [x] Source department is displayed (Dep-2)
- [x] Alteration reason is shown ("Stitching uneven - needs re-stitch")
- [x] Route details show the flow
- [x] Remaining quantity is correct (5 pcs)

**Observations:**
```
Alteration Details Section (Yellow background):
- Date Received: 12/01/2025
- Source Department: Dep-2
- Quantity Altered: 5 pcs
- Reason: "Stitching uneven - needs re-stitch"

Production Summary:
- Received: 5, Worked: 0, Remaining: 5

Worker Assignment Form Present:
- Worker Name dropdown
- Quantity field (Required)
- Date field
- Blue "+" add button

VERIFIED: Original card in Dep-2 shows:
- Received: 49, Worked: 44, Altered: 5, Remaining: 0
- 3 worker records (10 + 20 + 14 = 44 worked)
- First worker's record shows: Alteration=5, Note="Stitching uneven..."
- "Work Complete" banner displayed
```

**Screenshots:**
- temp_ss/image copy 4.png (Altered card in Dep-1)
- temp_ss/image copy 5.png (Dep-2 Kanban)
- temp_ss/image copy 6.png (Original card in Dep-2)

---

### Step 3: Assign Worker to Altered Card
- [x] Click "+ Add Record" (using + button, NOT Save button)
- [x] Select worker from Dep-1 dropdown (D1-W1)
- [x] Enter quantity (5 - all remaining pieces)
- [x] Set date (2082-08-17 Nepali / 8/17/2082)
- [x] Submit assignment via + button

**Observations:**
```
CORRECT WORKFLOW: Use + button to add workers (NOT Save button)

After clicking + button:
- Alert: "Worker assigned successfully!"
- Production Summary updated: Received=5, Worked=5, Remaining=0
- Assigned Workers table shows:
  - D1-W1 | Qty: 5 | Date: 8/17/2082 | Status: Billable (blue badge)
- Form reset for next entry

Kanban Card After Save:
- SB-T2 badge changed: "Alteration" (yellow) → "Assigned" (blue)
- Stats: Remaining=0 pcs, Processed=5 pcs (green)
- Card still in "New Arrivals" column

VERIFIED:
✅ Workers from Dep-1 CAN be assigned to altered cards
✅ Quantity validation works (assigned exactly 5, max available)
✅ Billable checkbox works (defaults to checked)
✅ Worker record created successfully
```

**Screenshots:**
- temp_ss/image copy 13.png (Worker assigned success message)
- temp_ss/image copy 14.png (Modal with worker record added)
- temp_ss/image copy 15.png (Kanban card updated)

---

### Step 4: Complete Work and Advance
- [x] After assigning all 5 pcs - DONE
- [x] Change Status to "Completed" and Save
- [x] "Send to Department" dropdown appears
- [x] Select Dep-2 (next department in workflow)
- [x] Click Save to send

**Observations:**
```
Workflow to Send Altered Card:
1. Changed Status from "Not Started" → "Completed"
2. Saved to update database
3. "Send to Department" dropdown appeared
4. Selected "Dep-2" from dropdown
5. Clicked Save
6. Success: "Successfully sent to department!"

After Send:
- SB-T2 disappeared from Dep-1 Kanban (Completed column now empty)
- Only SB-T1 remains in Dep-1 (In Progress with 20 remaining, 10 rejected)

Note: There's also a "Mark Sub-batch as Completed" green button -
need to clarify difference between this and regular Save
```

**Screenshots:**
- temp_ss/image copy 19.png (Send to Department dropdown)
- temp_ss/image copy 20.png (Success message)
- temp_ss/image copy 21.png (Dep-1 Kanban after send)

---

### Step 5: Verify Reworked Pieces in Dep-2
- [x] Switch to Dep-2 view
- [x] Verify reworked pieces arrived
- [x] Check how they appear in Kanban

**Observations:**
```
Dep-2 Kanban After Rework Return:

New Arrivals (1):
- SB-T2 (Unassigned) - Remaining: 5 pcs
- These are the REWORKED pieces that came back from Dep-1

In Progress (1):
- SB-T2 (Assigned) - Remaining: 0, Processed: 44, Altered: 5 pcs
- This is the ORIGINAL card
- Shows "Altered: 5 pcs" in yellow/orange - good!

KEY FINDING:
- Reworked pieces arrive as SEPARATE card (not merged into original)
- This creates TWO "SB-T2" cards in same department
- Pros: Clear audit trail, separate tracking of reworked items
- Cons: Could confuse supervisors (duplicate names)

RECOMMENDATION:
Consider adding visual distinction:
- Badge like "Rework Return" on the new arrival card
- Or append suffix like "SB-T2 (Rework)" to differentiate
```

**Screenshot:** temp_ss/image copy 22.png (Dep-2 with reworked pieces)

---

## Issues Found

### Issue 1: UX Confusion - Save Button vs Plus Button
- **Severity:** Medium
- **Description:** User confusion between Save button and + button for worker assignment. When user fills worker form and clicks Save (instead of +), it updates the status but does NOT add the worker. Shows misleading "Status updated successfully!" message.
- **Expected:** Clear indication that + button adds workers, Save button updates status. Or validation warning if worker form is partially filled when clicking Save.
- **Actual:** Save button silently updates status without warning that worker form data will be lost.
- **Screenshots:**
  - temp_ss/image copy 9.png (form filled with D1-W1 but no quantity)
  - temp_ss/image copy 10.png (misleading success message)
  - temp_ss/image copy 11.png (card unchanged - still 5 remaining)
- **Root Cause:** `handleSave()` is for status changes, `handleAddWorker()` is for worker assignment. UI doesn't make this distinction clear.
- **Action:** Fix later - Add validation to warn user if worker form has data when clicking Save

### Issue 2: Activity History Doesn't Show Full Trail (ENHANCEMENT REQUESTED)
- **Severity:** Medium (UX Enhancement)
- **Description:** Activity History shows only CURRENT department events, not the full journey across all departments. For rework cards, users need to see the complete trail.
- **Current Behavior:** Only shows "Arrived at Dep-2 from Dep-1" and current dept workers
- **Expected (Full Trail):**
  1. Alteration created at Dep-2 (defect identified)
  2. Arrived at Dep-1 for rework
  3. Worker assigned at Dep-1 (D1-W1 reworked 5 pcs)
  4. Completed at Dep-1
  5. Arrived at Dep-2 (current)
- **Decision:** Implement Option B - Full Trail for better user understanding
- **Screenshot:** temp_ss/image copy 27.png
- **Action:** Fix later - Implement full journey Activity History across all departments

### Issue 3: Completed Alteration Card Loses Visual Distinction
- **Severity:** Medium (UX Enhancement)
- **Description:** After alteration work is completed, the card looks identical to a regular sub-batch card. No visual indication this was rework.
- **Expected:**
  - Kanban card should show "🔄 Rework: 5 pcs" in yellow/amber (similar to how "Rejected: 10 pcs" shows in red)
  - Or maintain a subtle yellow indicator/border to show alteration history
- **Actual:** Card shows generic "Assigned" badge, identical to regular cards
- **Screenshot:** temp_ss/image copy 18.png
- **Recommendation:** Add "Rework: X pcs" stat on Kanban card in yellow/amber color
- **Action:** Fix later - Add visual distinction for alteration-originated cards

### Issue 4: Duplicate Department Sections in Completed Departments (FIXED)
- **Severity:** High (Bug)
- **Description:** When viewing rework card, "Completed Departments" showed duplicate Dep-1 sections with wrong data - both showing same worker logs.
- **Root Cause:** Backend was grouping worker logs by `department_id` instead of `department_sub_batch_id`, causing ALL Dep-1 logs to appear in BOTH entries.
- **Fix Applied:** Changed grouping in `departmentSubBatchService.ts` from `department_id` to `department_sub_batch_id`
- **Screenshot (Before):** temp_ss/image copy 23.png
- **Screenshot (After):** temp_ss/image copy 25.png
- **Status:** ✅ FIXED

### Issue 5: Wrong Worker Data Displayed (FIXED)
- **Severity:** High (Bug)
- **Description:** Rework entry showed worker data from original production (D1-W1: 15, D1-W2: 34) instead of rework data (D1-W1: 5).
- **Root Cause:** Same as Issue #4 - worker logs matched by department_id, not entry-specific ID.
- **Fix Applied:** Now matches logs by `deptEntry.id` (department_sub_batch_id)
- **Status:** ✅ FIXED

### Issue 6: No Visual Distinction for Rework Entries (FIXED)
- **Severity:** Medium (UX)
- **Description:** Rework entries in "Completed Departments" looked identical to original entries - no way to tell them apart.
- **Fix Applied:** Added amber "Rework" badge in `TaskDetailsModal.tsx` when `entry_type === 'REWORK'`
- **Screenshot (After):** temp_ss/image copy 26.png
- **Status:** ✅ FIXED

### Issue 10: Alteration Card Opens Wrong Modal After Worker Assignment (FIXED)
- **Severity:** High (Bug)
- **Date Found:** 2025-12-03
- **Description:** After assigning a worker to an Alteration card, clicking the card again opens the regular `TaskDetailsModal` instead of `AlteredTaskDetailsModal`. The yellow "Alteration Card - Rework Required" banner disappears, and the modal shows normal Production Summary layout.
- **Steps to Reproduce:**
  1. Open Alteration card (yellow badge) in Dep-1
  2. Assign 1 worker with 1 piece quantity via + button
  3. Close modal
  4. Kanban card shows "Assigned" badge (blue) - this is OK
  5. Click on card again
  6. **BUG:** Regular TaskDetailsModal opens instead of AlteredTaskDetailsModal
- **Expected:** Alteration cards should ALWAYS open AlteredTaskDetailsModal, regardless of worker assignments or status changes. The card is still an alteration card until all rework is complete.
- **Actual:** After worker assignment, card loses its alteration identity and opens as normal card.
- **Screenshots:**
  - temp_ss/image copy 6.png (Kanban after assignment - "Assigned" badge)
  - temp_ss/image copy 7.png (Wrong modal opens - normal TaskDetailsModal)
- **Root Cause:** In `DepartmentView.tsx` line 360, modal selection was based on `item.remarks` which changes to "Assigned" after worker assignment. Should use `alteration_source` instead.
- **Fix Applied:** Changed modal detection logic from `item.remarks?.toLowerCase().includes('alter')` to `item.alteration_source !== null && item.alteration_source !== undefined`. Same fix for rejection cards.
- **Status:** ✅ FIXED

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Open altered card modal | ✅ PASS | Yellow banner, alteration details shown |
| Source department displayed | ✅ PASS | Shows "Sent from: Dep-2" |
| Alteration reason shown | ✅ PASS | "Stitching uneven - needs re-stitch" |
| Worker assignment works | ✅ PASS | D1-W1 assigned 5 pcs via + button |
| Advance to next department | ✅ PASS | Successfully sent back to Dep-2 |
| Reworked pieces arrive in Dep-2 | ✅ PASS | Appears as new card with 5 pcs |

---

## Notes
- SB-T2 was sent for alteration from Dep-2 to Dep-1 (based on workflow)
- This tests the "rework" flow where items go backwards then forwards again

---

**Next:** After completing alteration flow, proceed to Scenario 6 (End-to-End)
