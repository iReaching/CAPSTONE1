-- Database constraints and indexes for vilman_db
-- IMPORTANT: Backup your DB before running.

-- Users: ensure unique email and user_id are primary key
ALTER TABLE users
  ADD UNIQUE KEY uq_users_email (email);

-- User profiles: one-to-one with users
ALTER TABLE user_profiles
  ADD CONSTRAINT fk_user_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE;

-- Amenities schedules
ALTER TABLE amenity_schedule
  ADD CONSTRAINT fk_amen_sched_user
    FOREIGN KEY (homeowner_id) REFERENCES users(user_id),
  ADD CONSTRAINT fk_amen_sched_amenity
    FOREIGN KEY (amenity_id) REFERENCES amenities(id);

-- Items schedules
ALTER TABLE item_schedule
  ADD CONSTRAINT fk_item_sched_user
    FOREIGN KEY (homeowner_id) REFERENCES users(user_id),
  ADD CONSTRAINT fk_item_sched_item
    FOREIGN KEY (item_id) REFERENCES items(id);

-- Vehicles
ALTER TABLE vehicle_registrations
  ADD CONSTRAINT fk_vehicle_user
    FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Entry logs
ALTER TABLE entry_log
  ADD CONSTRAINT fk_entrylog_requested_by
    FOREIGN KEY (requested_by) REFERENCES users(user_id);

-- System logs
ALTER TABLE system_logs
  ADD INDEX idx_system_logs_user_time (user_id, timestamp);

-- Common helpful indexes
CREATE INDEX idx_amenities_status ON amenities (status);
CREATE INDEX idx_items_status ON items (status);
CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_dues_status ON dues (status);
