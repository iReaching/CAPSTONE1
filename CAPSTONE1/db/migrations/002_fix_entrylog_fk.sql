-- Fix entry_log foreign key by allowing NULLs and clearing orphan values
ALTER TABLE entry_log
  MODIFY COLUMN requested_by VARCHAR(255) NULL;

UPDATE entry_log e
LEFT JOIN users u ON e.requested_by = u.user_id
SET e.requested_by = NULL
WHERE u.user_id IS NULL;

ALTER TABLE entry_log
  ADD CONSTRAINT fk_entrylog_requested_by
    FOREIGN KEY (requested_by) REFERENCES users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
