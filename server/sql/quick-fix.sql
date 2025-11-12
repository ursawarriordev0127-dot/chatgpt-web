-- Quick fix: Add missing columns
-- Run this in pgAdmin or psql

-- Fix message table
ALTER TABLE message ADD COLUMN frequency_penalty DOUBLE PRECISION DEFAULT NULL;
ALTER TABLE message ADD COLUMN max_tokens INTEGER DEFAULT NULL;
ALTER TABLE message ADD COLUMN model VARCHAR(255) DEFAULT NULL;
ALTER TABLE message ADD COLUMN presence_penalty DOUBLE PRECISION DEFAULT NULL;
ALTER TABLE message ADD COLUMN temperature DOUBLE PRECISION DEFAULT NULL;

-- Fix persona table  
ALTER TABLE persona ADD COLUMN system INTEGER DEFAULT 0;
ALTER TABLE persona ADD COLUMN description VARCHAR(255) DEFAULT NULL;

-- If persona table has 'name' column, rename it to 'title'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='persona' AND column_name='name') THEN
    ALTER TABLE persona RENAME COLUMN name TO title;
  END IF;
END $$;

