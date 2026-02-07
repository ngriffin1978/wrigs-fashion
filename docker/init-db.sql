-- Wrigs Fashion Database Initialization
-- This file runs after database creation to set up the schema

-- Note: Drizzle migrations will be run by the app on startup
-- This file is just for any pre-initialization needed

-- Set proper character encoding
ALTER DATABASE wrigs_fashion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a simple health check
CREATE TABLE IF NOT EXISTS _health_check (
    id INT PRIMARY KEY,
    initialized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _health_check (id) VALUES (1) ON DUPLICATE KEY UPDATE initialized_at = CURRENT_TIMESTAMP;
