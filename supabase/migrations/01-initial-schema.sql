-- supabase/migrations/01-initial-schema.sql
-- Initial database schema for Zenith app

-- ==========================================
-- HABIT TRACKER - Layered Time System
-- ==========================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  activity TEXT NOT NULL,
  started_at BIGINT NOT NULL,
  ended_at BIGINT,
  duration BIGINT,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  is_synced BOOLEAN DEFAULT FALSE,
  deleted_at BIGINT,
  device_id TEXT
);

CREATE INDEX idx_habit_logs_started_at ON habit_logs(started_at);
CREATE INDEX idx_habit_logs_ended_at ON habit_logs(ended_at);
CREATE INDEX idx_habit_logs_category ON habit_logs(category);
CREATE INDEX idx_habit_logs_device_id ON habit_logs(device_id);

-- ==========================================
-- FINANCE TRACKER
-- ==========================================
CREATE TABLE IF NOT EXISTS finance_logs (
  id TEXT PRIMARY KEY,
  transaction_type TEXT NOT NULL,
  location TEXT,
  item TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  cost NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PHP',
  type_category TEXT NOT NULL,
  transaction_date BIGINT NOT NULL,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  is_synced BOOLEAN DEFAULT FALSE,
  deleted_at BIGINT,
  device_id TEXT
);

CREATE INDEX idx_finance_logs_transaction_date ON finance_logs(transaction_date);
CREATE INDEX idx_finance_logs_transaction_type ON finance_logs(transaction_type);
CREATE INDEX idx_finance_logs_type_category ON finance_logs(type_category);
CREATE INDEX idx_finance_logs_device_id ON finance_logs(device_id);

-- ==========================================
-- DIARY MODULE
-- ==========================================
CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  entry_date BIGINT NOT NULL,
  mood TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  is_synced BOOLEAN DEFAULT FALSE,
  deleted_at BIGINT,
  device_id TEXT
);

CREATE INDEX idx_diary_entries_entry_date ON diary_entries(entry_date);
CREATE INDEX idx_diary_entries_mood ON diary_entries(mood);
CREATE INDEX idx_diary_entries_device_id ON diary_entries(device_id);

-- Diary Images (One-to-Many relationship)
CREATE TABLE IF NOT EXISTS diary_images (
  id TEXT PRIMARY KEY,
  diary_entry_id TEXT NOT NULL,
  local_uri TEXT NOT NULL,
  remote_url TEXT,
  upload_status TEXT NOT NULL DEFAULT 'pending',
  file_size BIGINT,
  mime_type TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  is_synced BOOLEAN DEFAULT FALSE,
  deleted_at BIGINT,
  device_id TEXT,
  FOREIGN KEY (diary_entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE
);

CREATE INDEX idx_diary_images_diary_entry_id ON diary_images(diary_entry_id);
CREATE INDEX idx_diary_images_upload_status ON diary_images(upload_status);
CREATE INDEX idx_diary_images_device_id ON diary_images(device_id);

-- ==========================================
-- LEISURE TRACKER
-- ==========================================
CREATE TABLE IF NOT EXISTS leisure_logs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT,
  started_at BIGINT NOT NULL,
  ended_at BIGINT,
  duration BIGINT,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  is_synced BOOLEAN DEFAULT FALSE,
  deleted_at BIGINT,
  device_id TEXT
);

CREATE INDEX idx_leisure_logs_started_at ON leisure_logs(started_at);
CREATE INDEX idx_leisure_logs_type ON leisure_logs(type);
CREATE INDEX idx_leisure_logs_device_id ON leisure_logs(device_id);

-- ==========================================
-- USER PREFERENCES
-- ==========================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX idx_user_preferences_key ON user_preferences(key);

-- ==========================================
-- SYNC METADATA
-- ==========================================
CREATE TABLE IF NOT EXISTS sync_metadata (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL UNIQUE,
  last_pulled_at BIGINT,
  last_pushed_at BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX idx_sync_metadata_table_name ON sync_metadata(table_name);