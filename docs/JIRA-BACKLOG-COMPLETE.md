# BlueShark - Complete Jira Backlog & Sprint Plan

**Created:** November 30, 2025
**Project:** BlueShark Production Management System
**Team:** Sadin (Lead), Khum (Developer)
**Jira Project Key:** BSK

---

## Quick Stats

| Metric | Value |
|--------|-------|
| **Total Epics** | 13 |
| **Total Tasks** | 54 |
| **Total Story Points** | 250 |
| **Estimated Duration** | 5 sprints (10 weeks) |
| **Production Ready** | End of Sprint 3 (Week 6) |
| **Full Feature Complete** | End of Sprint 5 (Week 10) |

---

## Jira Project Setup

### Step 1: Create Project
1. Go to: https://simplifytech-team.atlassian.net
2. Click "Create project"
3. Select **Scrum** template
4. Configure:
   - **Name:** BlueShark Production Management
   - **Key:** `BSK`

### Step 2: Configure Board
```
BACKLOG → TO DO → IN PROGRESS → CODE REVIEW → TESTING → DONE
```

### Step 3: Add Team
- Sadin (Administrator, Lead Developer)
- Khum (Developer)

### Step 4: Sprint Settings
- Duration: **2 weeks**
- Story point estimation: **Enabled**

---

## Complete Epic & Task Breakdown

### EPIC 1: Infrastructure (BSK-E1)
*Foundation work - DevOps, environment, tooling*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-1 | Fix local development environment (.env configuration) | Task | 2 | CRITICAL | Sadin | S1 |
| BSK-2 | Verify production database tables exist | Task | 3 | CRITICAL | Sadin | S1 |
| BSK-3 | Database cleanup - merge duplicate department_sub_batches | Task | 2 | HIGH | Sadin | S1 |
| BSK-4 | Setup Jest testing framework | Task | 3 | HIGH | Khum | S1 |
| BSK-5 | Add GitHub Actions for test coverage | Task | 3 | MEDIUM | Sadin | S2 |
| BSK-6 | Configure staging environment | Task | 5 | LOW | Sadin | S3 |
| BSK-7 | Setup error monitoring (Sentry) | Task | 3 | LOW | Khum | S4 |

**Epic Total: 21 points**

---

### EPIC 2: Bug Fixes & Stabilization (BSK-E2)
*Critical bugs blocking production*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-10 | Fix worker assignment splitting bug (creates duplicate cards) | Bug | 5 | CRITICAL | Sadin | S1 |
| BSK-11 | Add quantity conservation validation (Received = Worked + Altered + Rejected + Remaining) | Bug | 3 | CRITICAL | Sadin | S1 |
| BSK-12 | Fix login URL configuration in Vercel | Bug | 2 | HIGH | Sadin | S1 |
| BSK-13 | Fix NepaliDatePicker props not being applied | Bug | 2 | MEDIUM | Khum | S2 |
| BSK-14 | Fix mobile responsive issues on dashboards | Bug | 5 | MEDIUM | Khum | S3 |

**Epic Total: 17 points**

---

### EPIC 3: Raw Material Management (BSK-E3)
*Roll tracking and vendor linking*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-20 | Add roll search/filter functionality | Story | 3 | MEDIUM | Khum | S2 |
| BSK-21 | Add roll quantity tracking (used vs remaining) | Story | 5 | MEDIUM | Sadin | S3 |
| BSK-22 | Add roll history/audit log | Story | 5 | LOW | Khum | S4 |

**Epic Total: 13 points** (Feature mostly complete)

---

### EPIC 4: Batch Management (BSK-E4)
*Production batch creation and tracking*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-30 | Add batch search/filter functionality | Story | 3 | MEDIUM | Khum | S2 |
| BSK-31 | Add batch status overview dashboard | Story | 5 | LOW | Khum | S4 |
| BSK-32 | Add batch deletion with cascade handling | Story | 3 | LOW | Sadin | S4 |

**Epic Total: 11 points** (Feature mostly complete)

---

### EPIC 5: Sub-Batch Management (BSK-E5)
*Production orders, workflow configuration*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-40 | Add sub-batch search/filter functionality | Story | 3 | MEDIUM | Khum | S2 |
| BSK-41 | Add sub-batch duplication feature | Story | 3 | LOW | Khum | S4 |
| BSK-42 | Add sub-batch timeline view | Story | 8 | LOW | Sadin | S5 |

**Epic Total: 14 points** (Feature mostly complete)

---

### EPIC 6: Production Workflow (BSK-E6)
*Kanban tracking, department advancement*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-50 | Write tests for worker assignment flow | Task | 5 | HIGH | Sadin | S1 |
| BSK-51 | Write tests for department advancement | Task | 3 | HIGH | Sadin | S2 |
| BSK-52 | Add drag-and-drop on Kanban boards | Story | 8 | MEDIUM | Khum | S3 |
| BSK-53 | Add Kanban card quick actions menu | Story | 3 | LOW | Khum | S4 |
| BSK-54 | Add production timeline/Gantt view | Story | 13 | LOW | Sadin | S5 |

**Epic Total: 32 points**

---

### EPIC 7: Worker Management (BSK-E7)
*Worker CRUD, assignment, department filtering*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-60 | Add bulk worker assignment feature | Story | 5 | MEDIUM | Sadin | S3 |
| BSK-61 | Add worker search/filter in modals | Story | 3 | MEDIUM | Khum | S2 |
| BSK-62 | Add worker performance metrics | Story | 8 | LOW | Sadin | S4 |
| BSK-63 | Add worker import from CSV | Story | 5 | LOW | Khum | S5 |

**Epic Total: 21 points** (Feature mostly complete)

---

### EPIC 8: Quality Control (BSK-E8)
*Rejections and alterations workflow*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-70 | Write tests for rejection workflow | Task | 3 | HIGH | Sadin | S2 |
| BSK-71 | Write tests for alteration workflow | Task | 3 | HIGH | Sadin | S2 |
| BSK-72 | Add QC dashboard with defect rates | Story | 8 | MEDIUM | Khum | S3 |
| BSK-73 | Add rejection reason categories | Story | 3 | LOW | Khum | S4 |

**Epic Total: 17 points** (Feature mostly complete)

---

### EPIC 9: Wage Calculation (BSK-E9)
*Worker pay computation*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-80 | Add daily work completion tracking | Story | 5 | HIGH | Khum | S2 |
| BSK-81 | Add wage export to CSV | Story | 3 | HIGH | Khum | S2 |
| BSK-82 | Add wage export to PDF | Story | 5 | MEDIUM | Sadin | S3 |
| BSK-83 | Add wage summary dashboard | Story | 5 | MEDIUM | Khum | S3 |
| BSK-84 | Add bulk wage calculation | Story | 5 | LOW | Sadin | S4 |

**Epic Total: 23 points**

---

### EPIC 10: Reporting & Analytics (BSK-E10)
*Dashboards, exports, insights*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-90 | Add production stats dashboard (Admin) | Story | 8 | HIGH | Sadin | S2 |
| BSK-91 | Add department performance metrics | Story | 5 | MEDIUM | Khum | S3 |
| BSK-92 | Add batch completion reports | Story | 5 | MEDIUM | Sadin | S3 |
| BSK-93 | Add inventory usage reports | Story | 5 | LOW | Khum | S4 |
| BSK-94 | Add export all data to CSV | Story | 5 | LOW | Sadin | S4 |

**Epic Total: 28 points**

---

### EPIC 11: User Experience (BSK-E11)
*UI/UX improvements, error handling*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-100 | Replace alert() with toast notifications | Task | 5 | HIGH | Khum | S1 |
| BSK-101 | Add error boundaries (React) | Task | 3 | HIGH | Khum | S1 |
| BSK-102 | Add loading skeletons | Task | 3 | MEDIUM | Khum | S2 |
| BSK-103 | Add empty state illustrations | Task | 2 | LOW | Khum | S3 |
| BSK-104 | Accessibility audit and fixes | Task | 5 | LOW | Khum | S5 |

**Epic Total: 18 points**

---

### EPIC 12: User Management (BSK-E12)
*Authentication, roles, permissions*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-110 | Migrate JWT from localStorage to httpOnly cookies | Task | 8 | MEDIUM | Sadin | S3 |
| BSK-111 | Add password reset functionality | Story | 5 | MEDIUM | Sadin | S3 |
| BSK-112 | Add supervisor department reassignment | Story | 3 | LOW | Khum | S4 |
| BSK-113 | Add audit log for user actions | Story | 8 | LOW | Sadin | S5 |

**Epic Total: 24 points**

---

### EPIC 13: Inventory Management (BSK-E13)
*Stock tracking, accessories*

| Key | Task | Type | Points | Priority | Assignee | Sprint |
|-----|------|------|--------|----------|----------|--------|
| BSK-120 | Add low stock alerts | Story | 3 | MEDIUM | Khum | S3 |
| BSK-121 | Add inventory search/filter | Story | 3 | MEDIUM | Khum | S2 |
| BSK-122 | Add inventory import from CSV | Story | 5 | LOW | Khum | S5 |

**Epic Total: 11 points** (Feature mostly complete)

---

## Sprint Planning

### Sprint 1: Stabilization (Week 1-2)
**Goal:** Fix all critical bugs, establish testing foundation

| Key | Task | Points | Assignee |
|-----|------|--------|----------|
| BSK-1 | Fix local dev environment | 2 | Sadin |
| BSK-2 | Verify production database | 3 | Sadin |
| BSK-3 | Database cleanup | 2 | Sadin |
| BSK-10 | Fix worker assignment bug | 5 | Sadin |
| BSK-11 | Add quantity conservation | 3 | Sadin |
| BSK-12 | Fix login URL config | 2 | Sadin |
| BSK-4 | Setup Jest | 3 | Khum |
| BSK-50 | Tests for worker assignment | 5 | Sadin |
| BSK-100 | Toast notifications | 5 | Khum |
| BSK-101 | Error boundaries | 3 | Khum |

**Total: 33 points** | Sadin: 22 | Khum: 11

---

### Sprint 2: Quality & Quick Wins (Week 3-4)
**Goal:** Testing coverage, core features completion

| Key | Task | Points | Assignee |
|-----|------|--------|----------|
| BSK-51 | Tests for department advancement | 3 | Sadin |
| BSK-70 | Tests for rejection workflow | 3 | Sadin |
| BSK-71 | Tests for alteration workflow | 3 | Sadin |
| BSK-90 | Production stats dashboard | 8 | Sadin |
| BSK-80 | Daily completion tracking | 5 | Khum |
| BSK-81 | Wage export to CSV | 3 | Khum |
| BSK-102 | Loading skeletons | 3 | Khum |
| BSK-20 | Roll search/filter | 3 | Khum |
| BSK-121 | Inventory search/filter | 3 | Khum |

**Total: 34 points** | Sadin: 17 | Khum: 17

---

### Sprint 3: Features & Polish (Week 5-6)
**Goal:** Key feature completion, UX improvements

| Key | Task | Points | Assignee |
|-----|------|--------|----------|
| BSK-52 | Drag-and-drop Kanban | 8 | Khum |
| BSK-72 | QC dashboard | 8 | Khum |
| BSK-82 | Wage export to PDF | 5 | Sadin |
| BSK-83 | Wage summary dashboard | 5 | Khum |
| BSK-60 | Bulk worker assignment | 5 | Sadin |
| BSK-110 | JWT to httpOnly cookies | 8 | Sadin |

**Total: 39 points** | Sadin: 18 | Khum: 21

---

### Sprint 4: Advanced Features (Week 7-8)
**Goal:** Complete remaining high-value features

| Key | Task | Points | Assignee |
|-----|------|--------|----------|
| BSK-62 | Worker performance metrics | 8 | Sadin |
| BSK-84 | Bulk wage calculation | 5 | Sadin |
| BSK-93 | Inventory usage reports | 5 | Khum |
| BSK-94 | Export all data to CSV | 5 | Sadin |
| BSK-22 | Roll history/audit log | 5 | Khum |
| BSK-73 | Rejection reason categories | 3 | Khum |
| BSK-53 | Kanban quick actions | 3 | Khum |

**Total: 34 points** | Sadin: 18 | Khum: 16

---

### Sprint 5: Polish & Future (Week 9-10)
**Goal:** Remaining features, future readiness

| Key | Task | Points | Assignee |
|-----|------|--------|----------|
| BSK-54 | Production timeline view | 13 | Sadin |
| BSK-42 | Sub-batch timeline view | 8 | Sadin |
| BSK-63 | Worker import from CSV | 5 | Khum |
| BSK-104 | Accessibility audit | 5 | Khum |
| BSK-122 | Inventory import from CSV | 5 | Khum |

**Total: 36 points** | Sadin: 21 | Khum: 15

---

## Summary by Epic

| Epic | Points | Status |
|------|--------|--------|
| Infrastructure | 21 | Foundation |
| Bug Fixes | 17 | CRITICAL |
| Raw Material | 13 | Mostly Done |
| Batch Mgmt | 11 | Mostly Done |
| Sub-Batch Mgmt | 14 | Mostly Done |
| Production Workflow | 32 | Core Feature |
| Worker Mgmt | 21 | Mostly Done |
| Quality Control | 17 | Mostly Done |
| Wage Calculation | 23 | High Priority |
| Reporting | 28 | High Priority |
| User Experience | 18 | High Priority |
| User Management | 24 | Medium |
| Inventory | 11 | Mostly Done |

---

## Summary by Priority

| Priority | Tasks | Points |
|----------|-------|--------|
| CRITICAL | 6 | 18 |
| HIGH | 14 | 61 |
| MEDIUM | 18 | 89 |
| LOW | 16 | 82 |

---

## Milestones

### Production Ready (Week 6)
- [ ] Zero critical bugs
- [ ] Basic test coverage
- [ ] Toast notifications
- [ ] Core features working
- [ ] Daily tracking implemented
- [ ] CSV export working
- [ ] Production stats dashboard

### Full Feature Complete (Week 10)
- [ ] All 54 tasks completed
- [ ] 250 story points delivered
- [ ] All epics closed
- [ ] Documentation complete

---

## Team Workload Summary

| Sprint | Sadin | Khum | Total |
|--------|-------|------|-------|
| S1 | 22 | 11 | 33 |
| S2 | 17 | 17 | 34 |
| S3 | 18 | 21 | 39 |
| S4 | 18 | 16 | 34 |
| S5 | 21 | 15 | 36 |
| **Total** | **96** | **80** | **176** |

*Note: Some tasks from the 250 total are lower priority and may be deferred*

---

## Quick Reference

### Jira URLs
- Project: https://simplifytech-team.atlassian.net/jira/software/c/projects/BSK
- Board: https://simplifytech-team.atlassian.net/jira/software/c/projects/BSK/boards

### Key Documentation
- Product Docs: `docs/product/PRODUCT_DOCUMENTATION.md`
- Roadmap: `docs/ROADMAP.md`
- Critical Issues: `docs/quality/CRITICAL_ISSUE_ANALYSIS.md`
- User Stories: `docs/product/ADMIN_USER_STORIES.md`

---

**Created by BlueShark PM Agent | November 30, 2025**
