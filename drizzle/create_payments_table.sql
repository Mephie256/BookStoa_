-- Create payments table for PesaPal transactions
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  order_id TEXT UNIQUE NOT NULL,
  order_tracking_id TEXT UNIQUE,
  merchant_reference TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'UGX' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  payment_method TEXT,
  confirmation_code TEXT,
  payment_status_description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_book_id ON payments(book_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
