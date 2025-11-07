# API Documentation Changes Required

This document lists all API endpoints that have changed and need to be updated in your API documentation.

---

## Summary of Changes

| API Endpoint | Change Type | Impact |
|-------------|-------------|--------|
| `POST /api/sub-batches/advance-department` | Request body changed | High - Breaking change |
| `POST /api/worker-logs` | Request body changed (nested) | High - Breaking change |
| `POST /api/sub-batch-rejected` | Request body changed | High - Breaking change |
| `POST /api/sub-batch-altered` | Request body changed | High - Breaking change |
| `GET /api/department-sub-batches/sub-batch/:subBatchId` | New endpoint added | Low - New feature |

---

## 1. Advance Sub-Batch to Next Department

**Endpoint:** `POST /api/sub-batches/advance-department`

### Documentation Changes:

#### OLD Request Body:
```json
{
  "subBatchId": 81,
  "fromDepartmentId": 21,
  "toDepartmentId": 29
}
```

#### NEW Request Body:
```json
{
  "departmentSubBatchId": 88,
  "toDepartmentId": 29
}
```

### Request Parameters Table Update:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ~~`subBatchId`~~ | ~~number~~ | ~~Yes~~ | **REMOVED** |
| ~~`fromDepartmentId`~~ | ~~number~~ | ~~Yes~~ | **REMOVED** |
| `departmentSubBatchId` | number | Yes | **NEW** - The ID of the specific department_sub_batches entry to advance (from the `id` field) |
| `toDepartmentId` | number | Yes | Target department ID |

### Response (Unchanged):
```json
{
  "success": true,
  "nextDept": {
    "id": 89,
    "department_id": 29,
    "sub_batch_id": 81,
    "stage": "NEW_ARRIVAL",
    "is_current": true,
    "quantity_remaining": 50,
    "remarks": "Altered"
  }
}
```

### Error Responses (NEW):
| Status Code | Description |
|------------|-------------|
| 400 | `departmentSubBatchId and toDepartmentId are required` |
| 500 | `Department sub-batch entry with id {id} not found` |
| 500 | `Department sub-batch entry {id} is not active` |
| 500 | `Target department not found` |

---

## 2. Create Worker Log (with Reject/Alter)

**Endpoint:** `POST /api/worker-logs`

### Documentation Changes:

#### OLD Request Body:
```json
{
  "worker_id": 5,
  "sub_batch_id": 81,
  "worker_name": "John Doe",
  "work_date": "2025-11-06",
  "size_category": "M",
  "particulars": "Regular work",
  "quantity_received": 100,
  "quantity_worked": 90,
  "unit_price": 5.5,
  "activity_type": "NORMAL",
  "rejected": [
    {
      "quantity": 20,
      "sent_to_department_id": 29,
      "original_department_id": 21,
      "reason": "Fabric defect"
    }
  ],
  "altered": [
    {
      "quantity": 10,
      "sent_to_department_id": 21,
      "original_department_id": 21,
      "reason": "Size mismatch"
    }
  ]
}
```

#### NEW Request Body:
```json
{
  "worker_id": 5,
  "sub_batch_id": 81,
  "worker_name": "John Doe",
  "work_date": "2025-11-06",
  "size_category": "M",
  "particulars": "Regular work",
  "quantity_received": 100,
  "quantity_worked": 90,
  "unit_price": 5.5,
  "activity_type": "NORMAL",
  "rejected": [
    {
      "quantity": 20,
      "sent_to_department_id": 29,
      "source_department_sub_batch_id": 88,
      "reason": "Fabric defect"
    }
  ],
  "altered": [
    {
      "quantity": 10,
      "sent_to_department_id": 21,
      "source_department_sub_batch_id": 88,
      "reason": "Size mismatch"
    }
  ]
}
```

### Rejected Object Fields Update:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quantity` | number | Yes | Number of pieces to reject |
| `sent_to_department_id` | number | Yes | Department to send rejected pieces to |
| ~~`original_department_id`~~ | ~~number~~ | ~~Yes~~ | **REMOVED** |
| `source_department_sub_batch_id` | number | Yes | **NEW** - The ID of the specific department_sub_batches entry to reduce from |
| `reason` | string | Yes | Reason for rejection |

### Altered Object Fields Update:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quantity` | number | Yes | Number of pieces to alter |
| `sent_to_department_id` | number | Yes | Department to send altered pieces to |
| ~~`original_department_id`~~ | ~~number~~ | ~~Yes~~ | **REMOVED** |
| `source_department_sub_batch_id` | number | Yes | **NEW** - The ID of the specific department_sub_batches entry to reduce from |
| `reason` | string | Yes | Reason for alteration |

### Error Responses (NEW):
| Status Code | Description |
|------------|-------------|
| 500 | `Source department_sub_batch entry {id} not found` |
| 500 | `Source entry {id} is not active` |
| 500 | `Insufficient quantity in source entry. Available: {X}, requested: {Y}` |

---

## 3. Create Rejected Sub-Batch (Direct API)

**Endpoint:** `POST /api/sub-batch-rejected`

### Documentation Changes:

#### OLD Request Body:
```json
{
  "sub_batch_id": 81,
  "quantity": 20,
  "reason": "Quality issue",
  "sent_to_department_id": 29,
  "original_department_id": 21,
  "worker_log_id": 123
}
```

#### NEW Request Body:
```json
{
  "sub_batch_id": 81,
  "quantity": 20,
  "reason": "Quality issue",
  "sent_to_department_id": 29,
  "source_department_sub_batch_id": 88,
  "worker_log_id": 123
}
```

### Request Parameters Table Update:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sub_batch_id` | number | Yes | Sub-batch ID |
| `quantity` | number | Yes | Number of pieces to reject |
| `reason` | string | Yes | Reason for rejection |
| `sent_to_department_id` | number | Yes | Target department for rejected pieces |
| ~~`original_department_id`~~ | ~~number~~ | ~~Yes~~ | **REMOVED** |
| `source_department_sub_batch_id` | number | Yes | **NEW** - The ID of the specific department_sub_batches entry to reduce from |
| `worker_log_id` | number | No | Optional link to worker log |

### Error Responses (NEW):
| Status Code | Description |
|------------|-------------|
| 500 | `Source department_sub_batch entry {id} not found` |
| 500 | `Source entry {id} is not active` |
| 500 | `Insufficient quantity in source entry. Available: {X}, requested: {Y}` |

---

## 4. Create Altered Sub-Batch (Direct API)

**Endpoint:** `POST /api/sub-batch-altered`

### Documentation Changes:

#### OLD Request Body:
```json
{
  "sub_batch_id": 81,
  "quantity": 10,
  "target_department_id": 21,
  "original_department_id": 21,
  "reason": "Size adjustment",
  "worker_log_id": 123
}
```

#### NEW Request Body:
```json
{
  "sub_batch_id": 81,
  "quantity": 10,
  "target_department_id": 21,
  "source_department_sub_batch_id": 88,
  "reason": "Size adjustment",
  "worker_log_id": 123
}
```

### Request Parameters Table Update:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sub_batch_id` | number | Yes | Sub-batch ID |
| `quantity` | number | Yes | Number of pieces to alter |
| `target_department_id` | number | Yes | Target department for altered pieces |
| ~~`original_department_id`~~ | ~~number~~ | ~~Yes~~ | **REMOVED** |
| `source_department_sub_batch_id` | number | Yes | **NEW** - The ID of the specific department_sub_batches entry to reduce from |
| `reason` | string | Yes | Reason for alteration |
| `worker_log_id` | number | No | Optional link to worker log |

### Error Responses (NEW):
| Status Code | Description |
|------------|-------------|
| 500 | `Source department_sub_batch entry {id} not found` |
| 500 | `Source entry {id} is not active` |
| 500 | `Insufficient quantity in source entry. Available: {X}, requested: {Y}` |

---

## 5. NEW ENDPOINT: Get All Entries for Sub-Batch

**Endpoint:** `GET /api/department-sub-batches/sub-batch/:subBatchId`

**Method:** GET

**Description:** Returns all `department_sub_batches` entries (active and inactive) for a specific sub-batch. Useful for debugging and viewing all workflow branches (main, rejected, altered).

### URL Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `subBatchId` | number | Yes | Sub-batch ID to fetch entries for |

### Example Request:
```
GET /api/department-sub-batches/sub-batch/81
```

### Success Response (200 OK):
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": 88,
      "department_id": 21,
      "sub_batch_id": 81,
      "assigned_worker_id": null,
      "createdAt": "2025-11-06T11:08:14.279Z",
      "is_current": true,
      "stage": "NEW_ARRIVAL",
      "updatedAt": "2025-11-06T11:08:14.279Z",
      "quantity_remaining": 50,
      "remarks": "Altered",
      "department": {
        "id": 21,
        "name": "cutting",
        "remarks": "this is first test"
      }
    },
    {
      "id": 86,
      "department_id": 21,
      "sub_batch_id": 81,
      "assigned_worker_id": null,
      "createdAt": "2025-11-06T09:54:20.357Z",
      "is_current": true,
      "stage": "NEW_ARRIVAL",
      "updatedAt": "2025-11-06T09:54:20.357Z",
      "quantity_remaining": -130,
      "remarks": null,
      "department": {
        "id": 21,
        "name": "cutting",
        "remarks": "this is first test"
      }
    }
  ]
}
```

### Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request success status |
| `count` | number | Total number of entries |
| `data` | array | Array of department_sub_batches entries |
| `data[].id` | number | Department sub-batch entry ID (use this for operations) |
| `data[].department_id` | number | Department ID |
| `data[].sub_batch_id` | number | Sub-batch ID |
| `data[].is_current` | boolean | Whether entry is active |
| `data[].stage` | string | Current stage (NEW_ARRIVAL, IN_PROGRESS, COMPLETED) |
| `data[].quantity_remaining` | number | Remaining quantity in this workflow |
| `data[].remarks` | string | Workflow type (null=main, "Rejected", "Altered") |
| `data[].department` | object | Department details |

### Error Responses:

| Status Code | Description |
|------------|-------------|
| 400 | Invalid sub-batch ID |
| 500 | Server error |

### Use Cases:
- Debug tool to view all workflow branches
- Admin panel to see complete workflow history
- Troubleshooting quantity issues

---

## Documentation Sections to Update

### 1. **Sub-Batch Management Section**
- Update "Advance Sub-Batch" endpoint documentation
- Add note about using `department_sub_batch_id` instead of department combinations

### 2. **Worker Log Section**
- Update "Create Worker Log" endpoint documentation
- Update nested `rejected` and `altered` object schemas
- Add new error responses for validation

### 3. **Rejected Pieces Section**
- Update "Create Rejected Sub-Batch" endpoint documentation
- Replace `original_department_id` with `source_department_sub_batch_id`

### 4. **Altered Pieces Section**
- Update "Create Altered Sub-Batch" endpoint documentation
- Replace `original_department_id` with `source_department_sub_batch_id`

### 5. **Department Sub-Batches Section** (NEW)
- Add new section or subsection
- Document the new GET endpoint
- Explain use cases and response structure

### 6. **Glossary/Concepts Section**
Add explanation of key concepts:

**department_sub_batch_id**
- The unique ID of an entry in the `department_sub_batches` table
- Represents a specific workflow instance (main, rejected, or altered)
- Multiple entries can exist for the same sub-batch in the same department
- Used to precisely target which workflow to operate on

**Workflow Types (remarks field)**
- `null` - Main workflow
- `"Rejected"` - Rejected pieces workflow
- `"Altered"` - Altered pieces workflow

---

## Migration Notes for API Documentation

### Breaking Changes Warning
Add a prominent warning in your API documentation:

```
⚠️ BREAKING CHANGES - v2.0

The following endpoints have breaking changes and are NOT backwards compatible:
- POST /api/sub-batches/advance-department
- POST /api/worker-logs (rejected/altered objects)
- POST /api/sub-batch-rejected
- POST /api/sub-batch-altered

All clients must update to the new request format. Old requests will fail with
validation errors.
```

### Version Information
If using API versioning, consider:
- Marking these as v2 endpoints
- Adding deprecation notices to v1 endpoints
- Providing migration timeline

### Common Errors Section
Add a new "Common Errors" section explaining:

**Error: "source_department_sub_batch_id is required"**
- Cause: Using old API format without the new field
- Solution: Update request body to include `source_department_sub_batch_id`
- How to get the ID: From the `id` field when fetching department sub-batches

**Error: "Source entry {id} is not active"**
- Cause: Trying to operate on an inactive entry
- Solution: Ensure you're using the correct active entry ID
- How to check: Use the diagnostic endpoint to view all entries

**Error: "Insufficient quantity in source entry"**
- Cause: Trying to reject/alter more pieces than available
- Solution: Check the `quantity_remaining` before submitting
- Prevention: Implement validation in frontend

---

## Postman Collection Updates

If you maintain a Postman collection, update:

1. **Advance Sub-Batch Request**
   - Remove `subBatchId` and `fromDepartmentId` variables
   - Add `departmentSubBatchId` variable
   - Update example values

2. **Worker Log Request**
   - Update `rejected` array example
   - Update `altered` array example
   - Replace `original_department_id` with `source_department_sub_batch_id`

3. **Direct Reject Request**
   - Update request body
   - Add new error response examples

4. **Direct Alter Request**
   - Update request body
   - Add new error response examples

5. **Add New Request**
   - Create "Get Sub-Batch Entries" request
   - Add to appropriate folder

---

## Testing Notes for Documentation

### Test Scenarios to Document:

1. **Advance Main Workflow**
   ```
   GET /api/department-sub-batches/sub-batch/81
   Find entry with remarks: null, is_current: true
   POST /api/sub-batches/advance-department with that entry's id
   ```

2. **Advance Rejected Pieces**
   ```
   GET /api/department-sub-batches/sub-batch/81
   Find entry with remarks: "Rejected", is_current: true
   POST /api/sub-batches/advance-department with that entry's id
   ```

3. **Reject Pieces**
   ```
   GET /api/departments/21/sub-batches
   Get the id of the card user is working on
   POST /api/sub-batch-rejected with source_department_sub_batch_id
   ```

Add these test scenarios to your API documentation examples.
