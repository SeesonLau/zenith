-- supabase/migrations/02-enable-rls.sql
-- Enable Row Level Security (optional - can be disabled for simple apps)

-- Enable RLS on all tables
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE leisure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (since you're using anon key)
-- Note: For production, you should add proper user authentication

-- Habit Logs Policies
CREATE POLICY "Allow all operations on habit_logs" ON habit_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Finance Logs Policies
CREATE POLICY "Allow all operations on finance_logs" ON finance_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Diary Entries Policies
CREATE POLICY "Allow all operations on diary_entries" ON diary_entries
  FOR ALL USING (true) WITH CHECK (true);

-- Diary Images Policies
CREATE POLICY "Allow all operations on diary_images" ON diary_images
  FOR ALL USING (true) WITH CHECK (true);

-- Leisure Logs Policies
CREATE POLICY "Allow all operations on leisure_logs" ON leisure_logs
  FOR ALL USING (true) WITH CHECK (true);

-- User Preferences Policies
CREATE POLICY "Allow all operations on user_preferences" ON user_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- Sync Metadata Policies
CREATE POLICY "Allow all operations on sync_metadata" ON sync_metadata
  FOR ALL USING (true) WITH CHECK (true);