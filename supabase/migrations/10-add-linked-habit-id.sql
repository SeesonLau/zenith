-- supabase/migrations/10-add-linked-habit-id.sql
-- Migration to add linked_habit_id column to leisure_logs table
-- This allows leisure sessions to automatically create and link to habit logs

-- Add the new column to the local table structure
ALTER TABLE leisure_logs 
ADD COLUMN IF NOT EXISTS linked_habit_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN leisure_logs.linked_habit_id IS 
  'Reference to the automatically created habit log (Category: Enjoyment, Activity: Leisure)';