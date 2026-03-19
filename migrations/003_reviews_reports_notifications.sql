-- Migration: Add reviews, reports, notifications, and waitlist_position
-- Run this against your Insforge database

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Community rating columns
ALTER TABLE communities ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(2,1) DEFAULT 0;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL DEFAULT 'general',
    title VARCHAR(500) NOT NULL,
    body TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add waitlist_position column to event_participants
ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;
ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_event ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_community ON reviews(community_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_event_participants_waitlist ON event_participants(event_id, status, waitlist_position);
