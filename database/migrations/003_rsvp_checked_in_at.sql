-- QR check-in: records when an RSVP'd attendee actually arrived (run once on an existing database).
ALTER TABLE meet_rsvps ADD COLUMN checked_in_at DATETIME DEFAULT NULL AFTER created_at;
