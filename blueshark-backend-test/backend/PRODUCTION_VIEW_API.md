# Production View API Documentation

## Overview

The Production View API provides a comprehensive, optimized endpoint that returns all data needed for the Production Dashboard in a single request. This includes all sub-batches organized by departments, along with completed sub-batches.

---

## Endpoint

### Get Production View Data

**URL:** `GET /api/production-view`

**Description:** Returns all sub-batches organized by departments and completion status in a single optimized query.

**Query Parameters (Optional):**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `start_date` | string | Filter by start date (YYYY-MM-DD) | `2025-11-01` |
| `end_date` | string | Filter by end date (YYYY-MM-DD) | `2025-11-30` |
| `department_id` | number | Filter by specific department ID | `3` |

---

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Production view data fetched successfully",
  "data": {
    "all_sub_batches": [
      {
        "id": 1,
        "name": "Linen Silk",
        "start_date": "2025-08-15T00:00:00.000Z",
        "due_date": "2025-08-29T00:00:00.000Z",
        "estimated_pieces": 500,
        "expected_items": 450,
        "status": "IN_PRODUCTION",
        "batch_name": "Batch 1",
        "batch_id": 1,
        "completed_at": null
      }
    ],
    "department_columns": [
      {
        "department_id": 1,
        "department_name": "Department 1",
        "task_count": 1,
        "sub_batches": [
          {
            "id": 1,
            "name": "Linen Silk",
            "start_date": "2025-08-15T00:00:00.000Z",
            "due_date": "2025-08-29T00:00:00.000Z",
            "estimated_pieces": 500,
            "expected_items": 450,
            "status": "IN_PRODUCTION",
            "batch_name": "Batch 1",
            "batch_id": 1,
            "department_stage": "IN_PROGRESS",
            "quantity_remaining": 500,
            "assigned_worker_id": 5,
            "assigned_worker_name": "John Doe",
            "size_details": [
              {
                "id": 1,
                "category": "S",
                "pieces": 100
              }
            ],
            "attachments": [
              {
                "id": 1,
                "attachment_name": "Button",
                "quantity": 500
              }
            ],
            "createdAt": "2025-11-09T00:00:00.000Z",
            "remarks": null
          }
        ]
      },
      {
        "department_id": 2,
        "department_name": "Department 2",
        "task_count": 3,
        "sub_batches": [...]
      }
    ],
    "completed_sub_batches": [
      {
        "id": 5,
        "name": "Chiffon Glow",
        "start_date": "2025-08-15T00:00:00.000Z",
        "due_date": "2025-08-29T00:00:00.000Z",
        "estimated_pieces": 300,
        "expected_items": 280,
        "status": "COMPLETED",
        "batch_name": "Batch 3",
        "batch_id": 3,
        "completed_at": "2025-11-09T10:30:00.000Z",
        "size_details": [],
        "attachments": []
      }
    ],
    "total_departments": 8,
    "total_sub_batches": 15,
    "total_completed": 3,
    "total_in_production": 12
  }
}
```

### Error Response (500)

```json
{
  "success": false,
  "message": "Failed to fetch production view data",
  "error": "Error details here"
}
```

---

## Data Structure Explanation

### `all_sub_batches`
- **Purpose:** List of all sub-batches for the left sidebar
- **Contains:** Basic sub-batch information
- **Usage:** Display in "All Sub Batches" list

### `department_columns`
- **Purpose:** Sub-batches organized by their current department
- **Contains:** Department info + sub-batches currently in that department
- **Usage:** Display department columns with active sub-batches
- **Key Fields:**
  - `department_stage`: Current stage within department (NEW_ARRIVAL, IN_PROGRESS, COMPLETED)
  - `quantity_remaining`: Remaining pieces to work on
  - `assigned_worker_name`: Worker assigned to this sub-batch

### `completed_sub_batches`
- **Purpose:** Sub-batches that have been marked as fully completed
- **Contains:** Sub-batches with `status = 'COMPLETED'`
- **Usage:** Display in "Completed" column
- **Note:** These sub-batches are no longer in any department

### Summary Fields
- `total_departments`: Total number of departments
- `total_sub_batches`: Total number of all sub-batches
- `total_completed`: Number of completed sub-batches
- `total_in_production`: Number of sub-batches currently in departments

---

## Usage Examples

### 1. Get All Production Data

```bash
GET /api/production-view
```

**Frontend (React/Next.js):**
```typescript
const fetchProductionView = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/production-view`);
  const result = await response.json();

  if (result.success) {
    return result.data;
  }
};
```

### 2. Filter by Date Range

```bash
GET /api/production-view?start_date=2025-11-01&end_date=2025-11-30
```

**Frontend:**
```typescript
const fetchProductionViewByDate = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/production-view?${params.toString()}`
  );
  const result = await response.json();

  return result.data;
};
```

### 3. Filter by Department

```bash
GET /api/production-view?department_id=3
```

**Frontend:**
```typescript
const fetchProductionViewByDepartment = async (departmentId: number) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/production-view?department_id=${departmentId}`
  );
  const result = await response.json();

  return result.data;
};
```

---

## Testing with cURL

### Get all data
```bash
curl http://localhost:5000/api/production-view
```

### With date filter
```bash
curl "http://localhost:5000/api/production-view?start_date=2025-11-01&end_date=2025-11-30"
```

### With department filter
```bash
curl "http://localhost:5000/api/production-view?department_id=3"
```

---

## Performance Optimization

This API is optimized for performance:

1. **Single Query**: All data fetched in one request (not 10+ separate requests)
2. **Efficient Joins**: Uses Prisma's `include` to join related tables
3. **Indexed Queries**: Leverages database indexes on foreign keys
4. **Minimal Data Transfer**: Returns only necessary fields
5. **Smart Filtering**: Filters applied at database level, not in memory

**Comparison:**

| Approach | API Calls | Response Time |
|----------|-----------|---------------|
| **Old Way** (Multiple APIs) | 10+ calls | ~2-3 seconds |
| **New Way** (Production View API) | 1 call | ~200-500ms |

---

## Frontend Integration

### Complete Example

```typescript
import { useState, useEffect } from 'react';

interface ProductionViewData {
  all_sub_batches: any[];
  department_columns: any[];
  completed_sub_batches: any[];
  total_departments: number;
  total_sub_batches: number;
  total_completed: number;
  total_in_production: number;
}

const ProductionView = () => {
  const [data, setData] = useState<ProductionViewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/production-view`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch production view:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="production-view">
      {/* Left Sidebar - All Sub Batches */}
      <div className="sidebar">
        <h3>All Sub Batches ({data.total_sub_batches})</h3>
        {data.all_sub_batches.map(sb => (
          <div key={sb.id}>{sb.name}</div>
        ))}
      </div>

      {/* Department Columns */}
      {data.department_columns.map(dept => (
        <div key={dept.department_id} className="department-column">
          <h3>{dept.department_name} ({dept.task_count} tasks)</h3>
          {dept.sub_batches.map(sb => (
            <div key={sb.id} className="sub-batch-card">
              <h4>{sb.name}</h4>
              <p>Start: {new Date(sb.start_date).toLocaleDateString()}</p>
              <p>Due: {new Date(sb.due_date).toLocaleDateString()}</p>
              <p>Batch: {sb.batch_name}</p>
              <span className="status-badge">{sb.department_stage}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Completed Column */}
      <div className="completed-column">
        <h3>Completed ({data.total_completed})</h3>
        {data.completed_sub_batches.map(sb => (
          <div key={sb.id} className="sub-batch-card completed">
            <h4>{sb.name}</h4>
            <p>Completed: {new Date(sb.completed_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Notes

- All dates are returned in ISO 8601 format
- The API automatically filters out sub-batches that are not currently active in departments (`is_current = true`)
- Completed sub-batches are separate from department columns (they don't appear in both)
- The response is structured to minimize frontend processing

---

## Support

For issues or questions about the Production View API, contact the development team.
