ALTER TABLE portal
  ADD COLUMN create_timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  ADD COLUMN expiry_timestamp TIMESTAMP;

CREATE FUNCTION expire_portal() RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$

BEGIN
  DELETE FROM portal WHERE expiry_timestamp IS NOT NULL 
    AND expiry_timestamp < NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER expire_portal_insert_trigger
  AFTER INSERT ON portal
  EXECUTE PROCEDURE expire_portal();

CREATE TRIGGER expire_message_insert_trigger
  AFTER INSERT ON message
  EXECUTE PROCEDURE expire_portal();
