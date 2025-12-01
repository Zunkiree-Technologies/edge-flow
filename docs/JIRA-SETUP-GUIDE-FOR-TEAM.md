# BlueShark Jira Board Setup Guide

**For:** Team Member Setting Up Jira
**Project:** BlueShark Production Management System
**Estimated Time:** 2-3 hours

---

## Welcome!

This guide will help you set up the Jira board for BlueShark. Don't worry if you're new to Jira - this guide has step-by-step instructions with screenshots descriptions.

**What you'll be setting up:**
- 1 Jira Project
- 13 Epics (major feature areas)
- 54 Tasks/Stories/Bugs
- 5 Sprints

---

## Before You Start

### What You Need
- [ ] Access to https://simplifytech-team.atlassian.net
- [ ] Admin permissions in Jira
- [ ] The CSV file: `JIRA-BACKLOG-IMPORT.csv`
- [ ] This guide open for reference

### Files Provided
| File | Purpose |
|------|---------|
| `JIRA-BACKLOG-IMPORT.csv` | All tasks in spreadsheet format |
| `JIRA-BACKLOG-COMPLETE.md` | Detailed task descriptions |
| `JIRA-SETUP-GUIDE-FOR-TEAM.md` | This guide |

---

## Part 1: Create the Jira Project

### Step 1.1: Log into Jira
1. Go to: https://simplifytech-team.atlassian.net
2. Log in with your credentials
3. You should see the Jira dashboard

### Step 1.2: Create New Project
1. Click the **"Projects"** dropdown in the top navigation
2. Click **"Create project"**
3. You'll see template options

### Step 1.3: Select Template
1. Choose **"Scrum"** template
   - This gives us sprints, backlog, and board
2. Click **"Use template"**

### Step 1.4: Configure Project
Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | BlueShark Production Management |
| **Key** | BSK |
| **Project lead** | Sadin (or select appropriate person) |

> **Note:** The Key "BSK" is important! All our tasks use BSK- prefix (BSK-1, BSK-2, etc.)

5. Click **"Create"**

### Step 1.5: Verify Project Created
- You should now see the BSK project board
- The URL should be something like: `.../projects/BSK/board`

---

## Part 2: Configure Board Columns

The default board has basic columns. Let's set up our workflow columns.

### Step 2.1: Open Board Settings
1. Go to your BSK project board
2. Click the **three dots (⋮)** in the top right
3. Click **"Board settings"**

### Step 2.2: Configure Columns
1. Click **"Columns"** in the left sidebar
2. Set up these columns (in order):

| Column Name | Status Mapping |
|-------------|----------------|
| BACKLOG | Backlog |
| TO DO | To Do |
| IN PROGRESS | In Progress |
| CODE REVIEW | Code Review |
| TESTING | Testing |
| DONE | Done |

> **Tip:** You may need to create new statuses. Click "Create status" if a status doesn't exist.

### Step 2.3: Save Changes
- Click **"Save"** or changes auto-save

---

## Part 3: Add Team Members

### Step 3.1: Open Project Settings
1. In your BSK project, click **"Project settings"** (gear icon or in sidebar)
2. Click **"People"** or **"Access"**

### Step 3.2: Add Team Members
Add these people with their roles:

| Name | Role | Email |
|------|------|-------|
| Sadin | Administrator | (Sadin's email) |
| Khum | Developer | (Khum's email) |

1. Click **"Add people"**
2. Enter email or search for name
3. Select role: **"Administrator"** or **"Member"**
4. Click **"Add"**

---

## Part 4: Create Epics

Epics are big feature categories. We have 13 epics. Create them in this order:

### Step 4.1: Go to Backlog
1. In BSK project, click **"Backlog"** in the left sidebar

### Step 4.2: Create Each Epic
For each epic below:
1. Click **"Create"** button (or press C)
2. Change issue type to **"Epic"**
3. Enter the Epic name
4. Click **"Create"**

### Epic List (Create in Order)

| Epic Name | Description |
|-----------|-------------|
| **Infrastructure** | DevOps, environment setup, tooling |
| **Bug Fixes** | Critical bugs blocking production |
| **Raw Material** | Roll tracking and vendor management |
| **Batch Management** | Production batch creation |
| **Sub-Batch Management** | Production orders, workflow |
| **Production Workflow** | Kanban tracking, department flow |
| **Worker Management** | Worker CRUD, assignments |
| **Quality Control** | Rejections and alterations |
| **Wage Calculation** | Worker pay computation |
| **Reporting** | Dashboards, exports, analytics |
| **User Experience** | UI/UX improvements |
| **User Management** | Auth, roles, permissions |
| **Inventory** | Stock tracking |

> **Tip:** You can add a color to each epic to make them visually distinct. Click on the epic and look for "Color" option.

---

## Part 5: Create Sprints

### Step 5.1: Create Sprint 1
1. Go to **Backlog** view
2. Click **"Create sprint"** at the top of the backlog
3. Name it: **"Sprint 1: Stabilization"**
4. Set dates:
   - Start: (Next Monday)
   - End: (2 weeks later)

### Step 5.2: Create Remaining Sprints
Repeat for:

| Sprint | Name | Duration |
|--------|------|----------|
| Sprint 1 | Sprint 1: Stabilization | Week 1-2 |
| Sprint 2 | Sprint 2: Quality & Quick Wins | Week 3-4 |
| Sprint 3 | Sprint 3: Features & Polish | Week 5-6 |
| Sprint 4 | Sprint 4: Advanced Features | Week 7-8 |
| Sprint 5 | Sprint 5: Polish & Future | Week 9-10 |

> **Note:** Don't start the sprints yet! Just create them. Sadin will start Sprint 1 when ready.

---

## Part 6: Import Tasks from CSV

### Option A: Manual Entry (Recommended for accuracy)
If Jira CSV import is tricky, create tasks manually:

### Step 6.1: Open the CSV File
1. Open `JIRA-BACKLOG-IMPORT.csv` in Excel or Google Sheets
2. You'll see all 54 tasks with details

### Step 6.2: Create Each Task
For each row in the CSV:

1. Click **"Create"** (or press C)
2. Fill in:

| Field | Where to find in CSV |
|-------|---------------------|
| Issue Type | "Issue Type" column (Task, Story, or Bug) |
| Summary | "Summary" column |
| Description | "Description" column |
| Epic Link | "Epic" column - select matching epic |
| Priority | "Priority" column |
| Story Points | "Story Points" column |
| Assignee | "Assignee" column |
| Sprint | Move to correct sprint after creation |

3. Click **"Create"**
4. Drag the task to the correct Sprint

### Option B: Jira CSV Import (Advanced)
If you want to try bulk import:

1. Go to **Project Settings** > **External system import**
2. Select **CSV**
3. Upload `JIRA-BACKLOG-IMPORT.csv`
4. Map the columns to Jira fields
5. Import

> **Warning:** CSV import can be finicky. Manual entry might be faster for 54 tasks.

---

## Part 7: Organize Tasks into Sprints

After creating all tasks, organize them into sprints:

### Sprint 1 Tasks (33 points)
Drag these to Sprint 1:
- BSK-1, BSK-2, BSK-3, BSK-4
- BSK-10, BSK-11, BSK-12
- BSK-50, BSK-100, BSK-101

### Sprint 2 Tasks (34 points)
Drag these to Sprint 2:
- BSK-5, BSK-13
- BSK-20, BSK-30, BSK-40
- BSK-51, BSK-61, BSK-70, BSK-71
- BSK-80, BSK-81, BSK-90, BSK-102, BSK-121

### Sprint 3 Tasks (39 points)
Drag these to Sprint 3:
- BSK-6, BSK-14, BSK-21
- BSK-52, BSK-60, BSK-72
- BSK-82, BSK-83, BSK-91, BSK-92
- BSK-103, BSK-110, BSK-111, BSK-120

### Sprint 4 Tasks (34 points)
Drag these to Sprint 4:
- BSK-7, BSK-22, BSK-31, BSK-32, BSK-41
- BSK-53, BSK-62, BSK-73
- BSK-84, BSK-93, BSK-94, BSK-112

### Sprint 5 Tasks (36 points)
Drag these to Sprint 5:
- BSK-42, BSK-54, BSK-63
- BSK-104, BSK-113, BSK-122

---

## Part 8: Configure Story Points

### Step 8.1: Enable Story Points
1. Go to **Project Settings** > **Features**
2. Make sure **"Estimation"** is enabled
3. Select **"Story points"** as the estimation method

### Step 8.2: Verify Points on Tasks
Check that each task has story points assigned. If not:
1. Open the task
2. Look for "Story points" field
3. Enter the value from the CSV

---

## Part 9: Final Verification Checklist

Go through this checklist to make sure everything is set up:

### Project Setup
- [ ] Project named "BlueShark Production Management"
- [ ] Project key is "BSK"
- [ ] Scrum template selected

### Board Configuration
- [ ] 6 columns configured (Backlog → Done)
- [ ] Columns in correct order

### Team Members
- [ ] Sadin added as Administrator
- [ ] Khum added as Developer

### Epics
- [ ] 13 Epics created
- [ ] Each epic has correct name

### Sprints
- [ ] 5 Sprints created
- [ ] Sprints named correctly
- [ ] Sprint dates set (2 weeks each)

### Tasks
- [ ] 54 tasks created
- [ ] Each task has:
  - [ ] Correct issue type (Task/Story/Bug)
  - [ ] Description filled in
  - [ ] Epic linked
  - [ ] Priority set
  - [ ] Story points assigned
  - [ ] Assignee set
  - [ ] In correct sprint

### Story Points Totals
Verify sprint totals match:
- [ ] Sprint 1: 33 points
- [ ] Sprint 2: 34 points
- [ ] Sprint 3: 39 points
- [ ] Sprint 4: 34 points
- [ ] Sprint 5: 36 points

---

## Quick Reference: Priority Meanings

| Priority | Meaning | Action |
|----------|---------|--------|
| **Critical** | Blocking production, must fix ASAP | Do first! |
| **High** | Important for next release | Do this sprint |
| **Medium** | Valuable but not urgent | Plan for soon |
| **Low** | Nice to have | Do when time permits |

---

## Quick Reference: Issue Types

| Type | Use For | Example |
|------|---------|---------|
| **Bug** | Something broken that needs fixing | "Fix worker assignment bug" |
| **Task** | Technical work, not user-facing | "Setup Jest testing" |
| **Story** | User-facing feature | "Add CSV export" |
| **Epic** | Large feature category | "Wage Calculation" |

---

## Quick Reference: Assignees

| Assignee | Focus Areas |
|----------|-------------|
| **Sadin** | Backend, architecture, critical bugs, testing |
| **Khum** | Frontend, UI/UX, features, user experience |

---

## Troubleshooting

### "I can't find the Create button"
- Press `C` on your keyboard - this is the shortcut
- Or look for the blue "Create" button in the top navigation

### "I don't see Story Points field"
- Go to Project Settings > Features > Enable Estimation
- Or: Project Settings > Issue types > Select type > Add "Story points" field

### "I created a task in wrong sprint"
- Just drag it from one sprint to another in the Backlog view
- Or open the task and change the Sprint field

### "Epic dropdown is empty"
- Make sure you created the Epics first (Part 4)
- Refresh the page if Epics were just created

### "CSV import isn't working"
- Try manual entry instead - it's more reliable
- Make sure CSV is properly formatted (no special characters)

---

## After Setup: Next Steps

Once setup is complete:

1. **Notify Sadin** that the board is ready
2. **Don't start Sprint 1** - Sadin will do this
3. Sadin will:
   - Review the board
   - Make any adjustments
   - Start Sprint 1 when ready

---

## Need Help?

If you get stuck:
1. Check this guide again for the specific step
2. Ask Sadin for help
3. Google the specific Jira question - Atlassian has good docs

---

## Summary

You're setting up:
- **1 Project:** BlueShark Production Management (BSK)
- **6 Board Columns:** Backlog → To Do → In Progress → Code Review → Testing → Done
- **2 Team Members:** Sadin + Khum
- **13 Epics:** Infrastructure through Inventory
- **5 Sprints:** 10 weeks total
- **54 Tasks:** 250 story points total

**Production Ready Target:** End of Sprint 3 (Week 6)
**Full Completion Target:** End of Sprint 5 (Week 10)

---

**Thank you for setting up the Jira board! This will help the team stay organized and deliver BlueShark successfully.**

---

*Guide created: November 30, 2025*
*Project: BlueShark Production Management System*
