-- ========================================================
-- Over Mods - Cloudflare D1 Database Schema: overmods_logs
-- Dedicated Independent Database for Logs & Metrics
-- Variable Binding: overmods_logs
-- ========================================================

-- 1. Mod View Logs
CREATE TABLE IF NOT EXISTS mod_view_logs (
  id TEXT PRIMARY KEY,
  modId TEXT NOT NULL,
  userId TEXT,
  deviceId TEXT,
  ip TEXT NOT NULL,
  country TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mvl_modId ON mod_view_logs(modId);
CREATE INDEX IF NOT EXISTS idx_mvl_userId ON mod_view_logs(userId);
CREATE INDEX IF NOT EXISTS idx_mvl_ip ON mod_view_logs(ip);
CREATE INDEX IF NOT EXISTS idx_mvl_createdAt ON mod_view_logs(createdAt);

-- 2. Mod Download Logs
CREATE TABLE IF NOT EXISTS mod_download_logs (
  id TEXT PRIMARY KEY,
  modId TEXT NOT NULL,
  userId TEXT,
  deviceId TEXT,
  ip TEXT NOT NULL,
  country TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mdl_modId ON mod_download_logs(modId);
CREATE INDEX IF NOT EXISTS idx_mdl_userId ON mod_download_logs(userId);
CREATE INDEX IF NOT EXISTS idx_mdl_ip ON mod_download_logs(ip);
CREATE INDEX IF NOT EXISTS idx_mdl_createdAt ON mod_download_logs(createdAt);

-- 3. Community Post View Logs
CREATE TABLE IF NOT EXISTS post_view_logs (
  id TEXT PRIMARY KEY,
  postId TEXT NOT NULL,
  viewerId TEXT,
  deviceId TEXT,
  ip TEXT NOT NULL,
  country TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pvl_postId ON post_view_logs(postId);
CREATE INDEX IF NOT EXISTS idx_pvl_viewerId ON post_view_logs(viewerId);
CREATE INDEX IF NOT EXISTS idx_pvl_ip ON post_view_logs(ip);
CREATE INDEX IF NOT EXISTS idx_pvl_createdAt ON post_view_logs(createdAt);
