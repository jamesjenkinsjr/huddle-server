ALTER TABLE portal
  DROP COLUMN create_timestamp, DROP COLUMN expiry_timestamp;

DROP TRIGGER expire_portal_insert_trigger ON portal;
DROP TRIGGER expire_message_insert_trigger ON message;

DROP FUNCTION expire_portal();