-- Database Backup Before Splitting Bug Fix
-- Date: 2025-11-23
-- Purpose: Safety backup before implementing worker assignment fix

-- Manual backup command (run in terminal if using PostgreSQL):
-- pg_dump -U your_username -d blueshark -f backup_20251123_splitting_fix.sql

-- For SQLite (if using):
-- .backup backup_20251123_splitting_fix.db

-- Critical tables to verify after changes:
-- 1. department_sub_batches
-- 2. worker_logs
-- 3. sub_batch_rejected (should be unchanged)
-- 4. sub_batch_altered (should be unchanged)

-- Current state snapshot for RT-SB-1:
SELECT 'BEFORE FIX - department_sub_batches' as snapshot;
SELECT id, sub_batch_id, department_id, quantity_remaining, quantity_assigned, parent_department_sub_batch_id
FROM department_sub_batches
WHERE sub_batch_id = 10
ORDER BY id;

SELECT 'BEFORE FIX - worker_logs' as snapshot;
SELECT id, worker_id, quantity_worked, department_sub_batch_id
FROM worker_logs
WHERE sub_batch_id = 10
ORDER BY id;
