-- TruthChain Encrypted Messages Table
-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com)

CREATE TABLE IF NOT EXISTS encrypted_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id TEXT UNIQUE NOT NULL,
  document_hash TEXT,
  encrypted_content TEXT NOT NULL,
  iv TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_encrypted_messages_submission_id ON encrypted_messages(submission_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_messages_document_hash ON encrypted_messages(document_hash);
CREATE INDEX IF NOT EXISTS idx_encrypted_messages_recipient ON encrypted_messages(recipient_address);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE encrypted_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (whistleblowers need to store messages)
CREATE POLICY "Anyone can insert messages" ON encrypted_messages
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read messages (journalists need to fetch)
CREATE POLICY "Anyone can read messages" ON encrypted_messages
  FOR SELECT USING (true);
