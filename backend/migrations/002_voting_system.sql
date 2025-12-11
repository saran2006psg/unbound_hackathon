    -- Add threshold and approval tracking to rules table
    ALTER TABLE rules ADD COLUMN IF NOT EXISTS approval_threshold INTEGER DEFAULT 1;
    ALTER TABLE rules ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'ACTIVE';
    ALTER TABLE rules ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
    ALTER TABLE rules ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

    -- Create rule_votes table
    CREATE TABLE IF NOT EXISTS rule_votes (
        id SERIAL PRIMARY KEY,
        rule_id INTEGER NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        vote VARCHAR(10) NOT NULL CHECK (vote IN ('APPROVE', 'REJECT')),
        comment TEXT,
        voted_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(rule_id, admin_id)
    );

    -- Create rule_notifications table
    CREATE TABLE IF NOT EXISTS rule_notifications (
        id SERIAL PRIMARY KEY,
        rule_id INTEGER NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- Add indexes
    CREATE INDEX IF NOT EXISTS idx_rule_votes_rule ON rule_votes(rule_id);
    CREATE INDEX IF NOT EXISTS idx_rule_votes_admin ON rule_votes(admin_id);
    CREATE INDEX IF NOT EXISTS idx_rule_notifications_admin ON rule_notifications(admin_id);
    CREATE INDEX IF NOT EXISTS idx_rule_notifications_unread ON rule_notifications(admin_id, is_read);

    -- Update existing rules to have approval_status
    UPDATE rules SET approval_status = 'ACTIVE' WHERE approval_status IS NULL;
