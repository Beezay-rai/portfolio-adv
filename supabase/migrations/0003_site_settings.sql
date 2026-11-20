-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Your Name',
  role TEXT NOT NULL DEFAULT 'Full-stack developer',
  tagline TEXT NOT NULL DEFAULT 'I build fast, accessible web products.',
  bio TEXT NOT NULL DEFAULT 'Write a short intro here. It appears on the home page hero.',
  email TEXT NOT NULL DEFAULT 'you@example.com',
  socials JSONB NOT NULL DEFAULT '[]'::jsonb,
  url TEXT NOT NULL DEFAULT 'http://localhost:3000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings if table is empty
INSERT INTO site_settings (name, role, tagline, bio, email, socials, url)
SELECT 'Your Name', 'Full-stack developer', 'I build fast, accessible web products.', 'Write a short intro here. It appears on the home page hero.', 'you@example.com', '[]'::jsonb, 'http://localhost:3000'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access to site_settings" ON site_settings
  FOR SELECT USING (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Allow authenticated users to update site_settings" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can insert
CREATE POLICY "Allow authenticated users to insert site_settings" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');