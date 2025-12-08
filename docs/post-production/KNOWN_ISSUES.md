# BlueShark - Known Issues

**Purpose:** Quick reference of issues we know about in production but haven't fixed yet.
**Source:** Extracted from `docs/BACKLOG.md`

---

## Current Known Issues

### High Priority

| Issue | Description | Workaround |
|-------|-------------|------------|
| Save vs + button | User fills worker form, clicks Save (not +), worker not added | Click the + button to add worker |
| Auto-refresh | Data doesn't refresh after worker assignment | Manually refresh page |

### Medium Priority

| Issue | Description | Workaround |
|-------|-------------|------------|
| Native alerts | Some actions show browser alert instead of Toast | None needed, just cosmetic |
| Activity History | Doesn't show cross-department journey | Check each department separately |
| Completed alteration | Card loses visual distinction after completion | None |

### Low Priority

| Issue | Description | Workaround |
|-------|-------------|------------|
| Dates show 1970 | Unset dates show "Jan 1, 1970" | None needed, just cosmetic |
| Roll Name | Task Details shows Batch name in Roll field | None |
| Rework badge | Shows at pass-through dept instead of where performed | None |

---

## What to Tell Client

If client encounters these issues, you can say:

> "Yes, we're aware of this issue and it's on our fix list. Here's the workaround for now: [workaround]"

---

## Tracking

Full details and status updates are in `docs/BACKLOG.md`

---

**Last Updated:** 2025-12-08
