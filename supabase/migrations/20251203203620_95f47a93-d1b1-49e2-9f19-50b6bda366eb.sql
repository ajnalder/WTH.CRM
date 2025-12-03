-- Rename industry column to description for more flexible client categorization
ALTER TABLE clients RENAME COLUMN industry TO description;