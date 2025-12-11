-- Command Gateway Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
    credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rules table
CREATE TABLE IF NOT EXISTS rules (
    id BIGSERIAL PRIMARY KEY,
    pattern TEXT NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('AUTO_ACCEPT', 'AUTO_REJECT')),
    priority INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commands table
CREATE TABLE IF NOT EXISTS commands (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    command_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('executed', 'rejected')),
    action VARCHAR(50),
    result_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event VARCHAR(255) NOT NULL,
    meta JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_rules_priority ON rules(priority);
CREATE INDEX IF NOT EXISTS idx_commands_user_id ON commands(user_id);
CREATE INDEX IF NOT EXISTS idx_commands_created_at ON commands(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Seed default admin user
INSERT INTO users (name, api_key, role, credits) 
VALUES ('Admin User', 'cgw_admin_default_key_change_in_production', 'admin', 100)
ON CONFLICT (api_key) DO NOTHING;

-- Seed default rules
INSERT INTO rules (pattern, action, priority, description) VALUES
(':(){ :|:& };:', 'AUTO_REJECT', 1, 'Block fork-bomb'),
('rm\s+-rf\s+/', 'AUTO_REJECT', 2, 'Block destructive delete of root'),
('mkfs.', 'AUTO_REJECT', 3, 'Block filesystem formatting commands'),
('git\s+(status|log|diff)', 'AUTO_ACCEPT', 10, 'Allow safe git commands'),
('^(ls|cat|pwd|echo)', 'AUTO_ACCEPT', 20, 'Allow basic shell commands')
ON CONFLICT DO NOTHING;
