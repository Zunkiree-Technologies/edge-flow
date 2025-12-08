# BlueShark - Client Feedback Tracker

**Purpose:** Track all client feedback from production usage and convert to actionable items
**Client:** Zunkiree Technologies (Khum)
**Production URL:** https://edge-flow-gamma.vercel.app

---

## How This Works

### 1. Client Reports Issue/Feedback
- Via WhatsApp, call, or email
- Document it immediately in "Incoming Feedback" section below

### 2. Triage & Categorize
- Assign FB-XXX ID
- Determine type: Bug | UI/UX | Feature Request | Question
- Set priority: Critical | High | Medium | Low

### 3. Convert to Action
- If Bug/UI: Add to `docs/BACKLOG.md`
- If Feature: Add to `docs/ROADMAP.md` or BACKLOG
- If Question: Answer and document resolution

### 4. Track Resolution
- Update status as work progresses
- Link to commits/PRs when fixed
- Notify client when deployed

---

## Priority Definitions

| Priority | Definition | Response Time |
|----------|------------|---------------|
| **Critical** | Production down, data loss, can't use system | Same day |
| **High** | Major feature broken, blocking work | 1-2 days |
| **Medium** | Minor bug, workaround exists | This week |
| **Low** | Nice to have, polish items | Next sprint |

---

## Incoming Feedback

### Template
```
### FB-XXX: [Short Title]
**Date:** YYYY-MM-DD
**Reported By:** [Name]
**Type:** Bug | UI/UX | Feature Request | Question
**Priority:** Critical | High | Medium | Low
**Status:** New | Investigating | In Progress | Fixed | Deployed | Won't Fix

**Description:**
[What the client reported - their exact words if possible]

**Steps to Reproduce:** (if bug)
1.
2.
3.

**Expected vs Actual:**
- Expected:
- Actual:

**Screenshots/Videos:** [Link or "None"]

**Resolution:**
- [ ] Added to BACKLOG as [ID]
- [ ] Fixed in commit [hash]
- [ ] Deployed on [date]
- [ ] Client notified

**Notes:**
[Any additional context, workarounds given, etc.]
```

---

## Active Feedback

<!-- Add new feedback items here using the template above -->

### FB-001: Failed to fetch data on Dashboard, Batch View, Sub Batch View
**Date:** 2025-12-08
**Reported By:** Khum
**Type:** Bug
**Priority:** Critical
**Status:** Investigating

**Description:**
Client reports that when accessing the app, Batch View and Sub Batch View show "Failed to fetch" errors. Dashboard shows multiple error toasts: "Failed to fetch batches", "Failed to fetch rolls", "Failed to fetch vendors".

**Steps to Reproduce:**
1. Go to https://edge-flow-gamma.vercel.app
2. Login as admin
3. View Dashboard - see error toasts
4. Go to Batch View or Sub Batch View - "Failed to fetch"

**Expected vs Actual:**
- Expected: Data loads normally
- Actual: Multiple "Failed to fetch" errors, all counts show 0

**Screenshots/Videos:** `temp_ss/image copy 25.png`

**Resolution:**
- [ ] Root cause identified
- [ ] Fixed in commit [pending]
- [ ] Deployed on [date]
- [ ] Client notified

**Notes:**
Likely causes:
1. Backend server down/sleeping (Render free tier)
2. API endpoint misconfiguration
3. CORS issue
4. Database connection issue

---

## Resolved Feedback

<!-- Move resolved items here with resolution details -->

---

## Feedback Summary

| ID | Title | Type | Priority | Status | Date |
|----|-------|------|----------|--------|------|
| FB-001 | Example entry | Bug | Medium | New | 2025-12-08 |

---

## Quick Actions

### When Client Reports Something:

1. **Acknowledge immediately**: "Got it, looking into it"
2. **Document here**: Add FB-XXX entry
3. **Investigate**: Check logs, reproduce issue
4. **Communicate**: Tell client ETA or ask clarifying questions
5. **Fix & Deploy**: Work on dev → test → merge to main
6. **Confirm**: Ask client to verify fix

### Emergency Protocol (Critical Issues):

1. Check production logs immediately
2. If data issue: Check Neon database
3. If backend down: Check Render dashboard
4. If frontend broken: Check Vercel deployment
5. Hotfix if needed, deploy ASAP
6. Post-mortem after resolved

---

## Links

- **BACKLOG:** `docs/BACKLOG.md` - All bugs & issues
- **ROADMAP:** `docs/ROADMAP.md` - Feature planning
- **Production:** https://edge-flow-gamma.vercel.app
- **Backend:** https://edge-flow-backend.onrender.com

---

**Last Updated:** 2025-12-08
