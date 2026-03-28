-- supabase/migrations/03-add-device-id-column.sql
-- Add device_id column to all tables for sync support

-- Add device_id to habit_logs
ALTER TABLE habit_logs 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add device_id to finance_logs
ALTER TABLE finance_logs 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add device_id to diary_entries
ALTER TABLE diary_entries 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add device_id to diary_images
ALTER TABLE diary_images 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add device_id to leisure_logs
ALTER TABLE leisure_logs 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habit_logs_device_id ON habit_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_finance_logs_device_id ON finance_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_device_id ON diary_entries(device_id);
CREATE INDEX IF NOT EXISTS idx_diary_images_device_id ON diary_images(device_id);
CREATE INDEX IF NOT EXISTS idx_leisure_logs_device_id ON leisure_logs(device_id);

-- Add comments
COMMENT ON COLUMN habit_logs.device_id IS 'Device identifier to prevent sync loops';
COMMENT ON COLUMN finance_logs.device_id IS 'Device identifier to prevent sync loops';
COMMENT ON COLUMN diary_entries.device_id IS 'Device identifier to prevent sync loops';
COMMENT ON COLUMN diary_images.device_id IS 'Device identifier to prevent sync loops';
COMMENT ON COLUMN leisure_logs.device_id IS 'Device identifier to prevent sync loops';