-- Migration: Create hub_downloads table for Prowl Hub download tracking
-- Deploy: psql -U prowl -d prowl_feedback -f 001-hub-downloads.sql

CREATE TABLE IF NOT EXISTS hub_downloads (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hunt_path   TEXT        NOT NULL,   -- "auth/oauth-google.yml"
    category    TEXT        NOT NULL,   -- "auth"
    hunt_name   TEXT        NOT NULL,   -- "oauth-google"
    user_agent  TEXT,
    referer     TEXT,
    country     TEXT,                   -- 2-letter code from CF-IPCountry header
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_hunt_path ON hub_downloads (hunt_path);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON hub_downloads (created_at);
CREATE INDEX IF NOT EXISTS idx_downloads_category ON hub_downloads (category);
