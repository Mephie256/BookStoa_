-- Add payment fields to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE books ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;

-- Update existing books to be free by default
UPDATE books SET is_free = true, price = 0 WHERE is_free IS NULL;
