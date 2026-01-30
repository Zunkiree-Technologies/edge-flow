
# BlueShark Edge-Flow: Complete System User Guide

> **Last Updated**: 2026-01-30
> **Version**: 1.0
> **Purpose**: Complete documentation for understanding and using the BlueShark production management system

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Core Entities & Data Hierarchy](#2-core-entities--data-hierarchy)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Complete Workflow Guide](#4-complete-workflow-guide)
5. [Wage Calculation System](#5-wage-calculation-system)
6. [Card Types & Visual Indicators](#6-card-types--visual-indicators)
7. [Quality Control Workflows](#7-quality-control-workflows)
8. [Step-by-Step Test Scenario](#8-step-by-step-test-scenario)
9. [Validation Rules](#9-validation-rules)
10. [Navigation Quick Reference](#10-navigation-quick-reference)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [API Endpoints Reference](#12-api-endpoints-reference)

---

## 1. System Overview

**BlueShark (Gaamma)** is a comprehensive production management system designed for textile/fabric manufacturing. It handles the complete lifecycle from raw materials (Rolls) through finished products (Sub-Batches), managing:

- Production departments and workflow
- Worker assignments and task tracking
- Quality control (alterations and rejections)
- Wage calculations (piece-rate based)
- Inventory and material tracking

### Key Features

- **Kanban-style workflow** for visual task management
- **Multi-department routing** with sequential processing
- **Quality tracking** with alteration and rejection flows
- **Piece-rate wage calculation** with billable/non-billable distinction
- **Role-based access** for Admin and Supervisor users
- **Nepali calendar support** for local date handling

---

## 2. Core Entities & Data Hierarchy

### Entity Flow Diagram

```
Vendor (supplies materials)
    |
    v
Roll (raw materials from vendors)
    |
    v
Batch (groups rolls with production requirements)
    |
    v
Sub-Batch (individual production unit/job)
    |
    v
Department (work station - Cutting, Sewing, QC, Packing)
    |
    v
Worker (performs tasks, tracked for wages)
    |
    v
Worker Log (records work done, calculates wages)
```

### Entity Definitions

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **Vendor** | Material supplier | Name, Contact Info |
| **Roll** | Raw material inventory | Name, Quantity, Unit, Color, Vendor |
| **Batch** | Production grouping | Name, Quantity, Unit, Color, Vendor, Rolls |
| **Sub-Batch** | Production job unit | Name, Batch, Quantity, Start/Due Date, Status |
| **Department** | Work station | Name, Description, Worker Count |
| **Worker** | Task performer | Name, PAN, Department, Wage Type, Wage Rate |
| **Worker Log** | Work record | Worker, Sub-Batch, Quantity, Date, Unit Price, Billable |

### Sub-Batch Statuses

| Status | Meaning |
|--------|---------|
| `DRAFT` | Created but not sent to production |
| `IN_PRODUCTION` | Currently being processed in departments |
| `COMPLETED` | All work finished |
| `CANCELLED` | Production cancelled |

---

## 3. User Roles & Permissions

### Role Comparison

| Action | Admin | Supervisor | Super Supervisor |
|--------|:-----:|:----------:|:----------------:|
| Create Rolls/Batches/Sub-Batches | Yes | No | No |
| Create Departments | Yes | No | No |
| Create Workers | Yes | No | No |
| Create Supervisors | Yes | No | No |
| View Kanban Board | View Only | Full Access | Full Access |
| Assign Workers to Tasks | No | Yes | Yes |
| Record Alterations/Rejections | No | Yes | Yes |
| Advance to Next Department | No | Yes | Yes |
| View Single Department | No | Assigned Only | All |
| View All Departments | Yes | No | Yes |
| View Wage Calculations | Yes | No | No |

### Admin User

**Access URL**: `/Dashboard`

**Responsibilities**:
- System configuration and master data management
- Create and manage rolls, batches, sub-batches
- Set up departments and production workflow
- Manage workers and their wage rates
- Create and assign supervisors
- Monitor production overview
- View and analyze wage calculations

### Supervisor User

**Access URL**: `/SupervisorDashboard`

**Responsibilities**:
- View sub-batches assigned to their department
- Assign workers to tasks (with quantity and date)
- Record quality issues (alterations and rejections)
- Advance completed work to next department
- Track worker performance in their department

### Super Supervisor

**Access URL**: `/SupervisorDashboard`

**Additional Capabilities**:
- Can view and manage ALL departments
- Department selector allows switching between departments
- Useful for multi-department oversight and reporting

---

## 4. Complete Workflow Guide

### Phase 1: Admin Setup

#### Step 1: Create Vendor
```
Navigation: Dashboard -> Settings -> Vendors -> Add Vendor
Fields: Name, Contact Information
```

#### Step 2: Create Roll (Raw Material)
```
Navigation: Dashboard -> Roll View -> Add Roll
Fields:
- Name (e.g., "wool-red-001")
- Quantity (e.g., 500)
- Unit (Kilogram, Piece, Meter)
- Color (e.g., Red)
- Vendor (select from list)
```

#### Step 3: Create Batch
```
Navigation: Dashboard -> Fabric View -> Add Batch
Fields:
- Name (e.g., "red-shirt-batch")
- Quantity (e.g., 100 pieces)
- Unit (Piece, Kilogram, etc.)
- Color
- Vendor
- Linked Rolls (optional: multi-roll support)
- Size Variations (optional)
```

#### Step 4: Set Up Departments
```
Navigation: Dashboard -> Settings -> Departments -> Add Department
Example workflow: Cutting -> Sewing -> Quality Check -> Packing
```

#### Step 5: Add Workers
```
Navigation: Dashboard -> Settings -> Workers -> Add Worker
Fields:
- Name
- PAN (Tax ID)
- Address
- Department (assign to specific department)
- Wage Type (Piece Rate, Hourly, Daily, Salary)
- Wage Rate (REQUIRED - must be greater than 0)
```

#### Step 6: Create Sub-Batch
```
Navigation: Dashboard -> Sub-Batch View -> Add Sub-Batch
Fields:
- Select Batch (Roll auto-fills from batch)
- Name
- Estimated Pieces
- Start Date
- Due Date
- Size Details (optional)
```

#### Step 7: Send to Production
```
Action: Sub-Batch -> Send to Department -> Select First Department
Result: Sub-batch appears in first department's "New Arrivals"
```

---

### Phase 2: Supervisor Processing

#### Step 1: View Kanban Board
```
Navigation: Supervisor Dashboard -> Task Management

Layout:
+---------------+---------------+---------------+
| New Arrivals  | In Progress   | Completed     |
|    (Gray)     |    (Blue)     |   (Green)     |
+---------------+---------------+---------------+
| [Card 1]      | [Card 3]      | [Card 5]      |
| [Card 2]      | [Card 4]      | [Card 6]      |
+---------------+---------------+---------------+
```

#### Step 2: Assign Workers
```
Action: Click sub-batch card -> Task Details Modal -> Workers Tab

Process:
1. Select Worker from dropdown (filtered by department)
2. Enter Quantity to assign (cannot exceed remaining)
3. Select Work Date (Nepali calendar)
4. Check "Billable" checkbox (affects wage calculation)
5. Optional: Add task description/particulars
6. Click "Assign Worker"

Result:
- Worker Log created
- Card moves to "In Progress" column
- Remaining quantity decreases
```

#### Step 3: Handle Quality Issues (If Any)

**Option A: Work is Good**
- Continue to Step 4

**Option B: Alteration Needed**
```
Action: Click "Alter" button in Task Details

Process:
1. Enter altered quantity
2. Select alteration reason
3. Choose department for rework
4. Save

Result:
- YELLOW card created in destination department
- Original card continues with remaining quantity
- Alteration tracked in history
```

**Option C: Rejection**
```
Action: Click "Reject" button in Task Details

Process:
1. Enter rejected quantity
2. Select rejection reason
3. Choose destination (rework department or discard)
4. Save

Result:
- RED card created in destination department
- Original card continues with remaining quantity
- Rejection tracked in history
```

#### Step 4: Send to Next Department
```
Location: Task Details -> Completion Section

Process:
1. Enter Quantity to Send (required, validated)
2. Select Next Department from dropdown
3. Click "Send"

Result:
- Sub-batch appears in next department's "New Arrivals"
- Current department card moves to "Completed"
```

#### Step 5: Final Completion (Last Department Only)
```
When: Work reaches the last department in workflow

Process:
1. Complete all worker assignments
2. "Mark Sub-batch as Completed" button appears
3. Click to finalize

Result:
- Sub-batch status changes to COMPLETED
- All cards move to "Completed" column
- Wages finalized
```

---

## 5. Wage Calculation System

### Calculation Formula

```
Amount = Quantity Worked x Unit Price

Example:
- Worker completes 100 pieces
- Unit Price: Rs. 50 per piece
- Wage = 100 x 50 = Rs. 5,000
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Wage Rate** | Worker's default rate (stored in Worker master data) |
| **Unit Price** | Actual rate used for specific assignment (stored in Worker Log) |
| **Billable** | Work that counts toward payment (green badge) |
| **Non-Billable** | Work that doesn't count (rework, training) - gray badge |
| **Quantity Worked** | Number of pieces/items completed |

### Auto-Fill Behavior

When supervisor assigns a worker:
1. Worker is selected from dropdown
2. Unit Price auto-fills from worker's Wage Rate
3. Supervisor can adjust if needed
4. Final Unit Price is saved in Worker Log

### Viewing Wages (Admin Only)

```
Navigation: Dashboard -> Wage Calculation

Summary View:
- Total Billable Wages
- Total Non-Billable Wages
- Total Active Workers
- Top Earner

Worker List:
- Worker Name
- Total Billable Wages
- Total Non-Billable Wages
- Total Quantity Worked

Detail View (click worker name):
- Work Date
- Sub-Batch Name
- Quantity Worked
- Unit Price
- Amount (Qty x Price)
- Billable Status
- Activity Type (NORMAL, ALTERED, REJECTED)
```

### Filtering Options

- By Department
- By Date Range (Start Date to End Date)
- Sort by wage, quantity, date

---

## 6. Card Types & Visual Indicators

### Card Border Colors

| Card Type | Border Color | Meaning |
|-----------|:------------:|---------|
| **Main** | Gray | Normal production flow |
| **Assigned** | Blue | Copy sent to another department |
| **Altered** | Yellow | Needs rework |
| **Rejected** | Red | Failed quality check |

### Card Status Badges

| Badge | Color | Meaning |
|-------|:-----:|---------|
| Unassigned | Gray | No workers assigned yet |
| Assigned | Blue | Workers assigned, work in progress |
| Completed | Green | Work finished in this department |

### Department Flow Indicators

In Route Details view:
- **Green dot**: Completed stage / Main sub-batch location
- **Blue dot**: Current location (in progress)
- **Gray dot**: Not yet reached
- **Yellow dot**: Altered items location
- **Red dot**: Rejected items location

---

## 7. Quality Control Workflows

### Alteration Flow

```
Original Sub-Batch (100 units)
        |
        v
Worker produces: 95 good, 5 need rework
        |
        +---> Main Card: 95 units -> Next Department
        |
        +---> Altered Card: 5 units -> Rework Department (YELLOW)
```

**Altered Card Contains**:
- Quantity needing rework
- Alteration reason
- Source department
- Destination department
- Full audit trail

### Rejection Flow

```
Original Sub-Batch (100 units)
        |
        v
QC finds: 90 pass, 10 fail
        |
        +---> Main Card: 90 units -> Next Department
        |
        +---> Rejected Card: 10 units -> Rework/Discard (RED)
```

**Rejected Card Contains**:
- Rejected quantity
- Rejection reason
- Which department rejected
- Return destination
- Full audit trail

### Billable vs Non-Billable Work

| Type | When Used | Affects Wages |
|------|-----------|:-------------:|
| **Billable** | Normal production work | Yes |
| **Non-Billable** | Rework, alterations, training | Tracked separately |

---

## 8. Step-by-Step Test Scenario

### Scenario: Produce 50 Red Shirts

#### Admin Setup (One-time)

```
1. Create Vendor
   - Name: "ABC Textiles"

2. Create Roll
   - Name: "wool-red-001"
   - Quantity: 100 kg
   - Unit: Kilogram
   - Color: Red
   - Vendor: ABC Textiles

3. Create Batch
   - Name: "red-shirt-batch"
   - Quantity: 50 pieces
   - Unit: Piece
   - Color: Red
   - Vendor: ABC Textiles

4. Ensure Departments Exist
   - Cutting
   - Sewing
   - Packing

5. Add Worker
   - Name: "Test Worker"
   - Department: Cutting
   - Wage Type: Piece Rate
   - Wage Rate: Rs. 50 (REQUIRED!)

6. Create Sub-Batch
   - Name: "red-shirts-001"
   - Batch: red-shirt-batch
   - Estimated Pieces: 50
   - Start Date: Today
   - Due Date: Next week

7. Send to Production
   - Select: Cutting department
```

#### Supervisor Processing (Cutting)

```
1. Login as Cutting Supervisor

2. View Kanban Board
   - See "red-shirts-001" in New Arrivals

3. Assign Worker
   - Click card -> Task Details
   - Select: Test Worker
   - Quantity: 50
   - Date: Today
   - Billable: Checked
   - Save

4. Send to Next Department
   - Quantity to Send: 50
   - Next Department: Sewing
   - Click Send
```

#### Repeat for Sewing & Packing

```
Same process for each department until final completion
```

#### Verify Wages (Admin)

```
1. Go to Dashboard -> Wage Calculation

2. Find "Test Worker"
   - Total Billable: Rs. 2,500 (50 x 50)
   - Quantity Worked: 50 pieces

3. Click worker name for details
   - Date: Today
   - Sub-Batch: red-shirts-001
   - Qty: 50
   - Unit Price: Rs. 50
   - Amount: Rs. 2,500
   - Billable: Yes
```

---

## 9. Validation Rules

### Worker Assignment Validation

| Rule | Error Message |
|------|---------------|
| No worker selected | "Please select a worker" |
| No date selected | "Please select a date" |
| No quantity entered | "Please enter quantity worked" |
| Quantity <= 0 | "Please enter a valid quantity greater than 0" |
| Quantity > Remaining | "Cannot assign X pieces! Only Y pieces remaining" |
| Invalid unit price | "Please enter a valid unit price greater than 0" |

### Worker Creation Validation

| Rule | Error Message |
|------|---------------|
| No wage rate | "Wage rate is required" |
| Wage rate <= 0 | "Wage rate must be greater than 0" |

### Department Advancement Validation

| Rule | Error Message |
|------|---------------|
| No quantity entered | "Please enter the quantity to send" |
| Quantity > Available | "Cannot send X pieces! Only Y available" |

---

## 10. Navigation Quick Reference

### Admin Dashboard URLs

| View | URL Parameter | Description |
|------|---------------|-------------|
| Dashboard | `/Dashboard` | Overview with stats |
| Rolls | `?view=rollview` | Raw material inventory |
| Batches | `?view=batchview` | Production batches |
| Sub-Batches | `?view=subbatchview` | Production jobs |
| Department Kanban | `?view=departmentview` | Visual workflow (read-only) |
| Production View | `?view=productionview` | All departments overview |
| Inventory | `?view=inventory` | Material tracking |
| Wage Calculation | `?view=wagecalculation` | Worker earnings |
| Vendors | `?view=vendors` | Supplier management |
| Workers | `?view=workers` | Worker management |
| Departments | `?view=departments` | Department setup |
| Supervisors | `?view=createsupervisor` | Supervisor management |

### Supervisor Dashboard URLs

| View | URL Parameter | Description |
|------|---------------|-------------|
| Dashboard | `/SupervisorDashboard` | Department overview |
| Task Management | `?view=departmentview` | Kanban board |
| Sub-Batches | `?view=subbatchview` | Assigned work |
| Workers | `?view=workers` | Department workers |

---

## 11. Troubleshooting Guide

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Sub-batch not in department | Not sent to that department | Check department history, verify send action |
| Cannot assign more workers | Remaining quantity is 0 | Check quantity_remaining field |
| Altered items not showing | Looking in wrong department | Check destination department's Kanban (yellow cards) |
| Worker wages show Rs. 0 | Unit price was 0 | Edit worker log or ensure wage_rate is set |
| Worker dropdown empty | No workers in department | Assign workers to department first |
| Cannot mark complete | Not in last department | Complete work in all departments first |
| "Too many login attempts" | Rate limiting | Wait or restart backend server |

---

## 12. API Endpoints Reference

### Authentication
```
POST /api/auth/login           - Admin login
POST /api/auth/supervisor-login - Supervisor login
```

### Inventory Management
```
GET/POST /api/rolls            - Roll CRUD
GET/POST /api/batches          - Batch CRUD
GET/POST /api/sub-batches      - Sub-batch CRUD
GET/POST /api/vendor           - Vendor CRUD
```

### Workforce
```
GET/POST /api/workers                      - Worker CRUD
GET /api/workers/department/{id}           - Department workers
POST /api/worker-logs/logs                 - Create worker log
GET /api/worker-logs/{subBatchId}          - Get worker logs
PUT/DELETE /api/worker-logs/{id}           - Edit/delete logs
```

### Production Management
```
GET/POST /api/departments                              - Department CRUD
GET /api/departments/{id}/sub-batches                  - Department sub-batches
POST /api/sub-batches/send-to-production               - Send to department
POST /api/sub-batches/advance-department               - Advance with quantity
GET /api/department-sub-batches/sub-batch-history/{id} - History/flow
POST /api/sub-batches/{id}/alter                       - Record alteration
POST /api/sub-batches/{id}/reject                      - Record rejection
POST /api/sub-batches/{id}/complete                    - Mark complete
```

### Wages
```
GET /api/worker-logs/wages/summary         - Wage summary
GET /api/worker-logs/wages/{workerId}      - Worker detailed wages
```

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| **Roll** | Raw material unit received from vendor |
| **Batch** | Production order grouping one or more rolls |
| **Sub-Batch** | Individual production job created from a batch |
| **Department** | Work station in production workflow |
| **Worker Log** | Record of work done by a worker |
| **Piece Rate** | Payment calculated per unit produced |
| **Billable** | Work that counts toward payment |
| **Alteration** | Items needing rework (quality issue) |
| **Rejection** | Items failing quality check |
| **Kanban** | Visual workflow board with columns |

---

*Document maintained by BlueShark Development Team*
