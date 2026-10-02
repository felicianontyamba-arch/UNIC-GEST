-- 002_add_priority_to_tasks.sql
-- Add prioridade column to tasks if not present. If it already exists, the runner will ignore the error.
ALTER TABLE tasks ADD COLUMN prioridade VARCHAR(20) DEFAULT 'medium';
