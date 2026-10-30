-- Offline-first sync: version column for edit conflict detection (run once on an existing database).
ALTER TABLE meets ADD COLUMN updated_at DATETIME DEFAULT NULL AFTER created_at;
