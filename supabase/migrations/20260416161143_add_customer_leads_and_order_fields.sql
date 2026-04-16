/*
  # Add customer_leads table and order enhancements

  ## New Tables
  - `customer_leads`
    - `id` (uuid, primary key)
    - `name` (text, not null) - Customer's name
    - `phone` (text, unique not null) - Phone number used as unique key
    - `email` (text, nullable) - Optional email
    - `first_order_date` (timestamptz) - When they first ordered
    - `last_order_date` (timestamptz) - Updated every time they reorder
    - `order_count` (int) - Number of orders placed

  ## Modified Tables
  - `orders`
    - Add `customer_email` (text, nullable)
    - Add `special_instructions` (text, nullable) - Order-level special instructions

  - `order_items`
    - Add `special_instructions` (text, nullable) - Per-item special instructions

  - `restaurant_settings`
    - Add `bg_style` (text, default 'deep-charcoal') - Separate background style from theme

  ## Security
  - Enable RLS on customer_leads
  - Admins can read/write; public can insert (for lead capture)
*/

-- Create customer_leads table
CREATE TABLE IF NOT EXISTS customer_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  first_order_date timestamptz DEFAULT now(),
  last_order_date timestamptz DEFAULT now(),
  order_count int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can upsert customer leads"
  ON customer_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view customer leads"
  ON customer_leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update customer leads"
  ON customer_leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add customer_email to orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_email text;
  END IF;
END $$;

-- Add special_instructions to orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'special_instructions'
  ) THEN
    ALTER TABLE orders ADD COLUMN special_instructions text;
  END IF;
END $$;

-- Add special_instructions to order_items if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'special_instructions'
  ) THEN
    ALTER TABLE order_items ADD COLUMN special_instructions text;
  END IF;
END $$;

-- Add bg_style to restaurant_settings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_settings' AND column_name = 'bg_style'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN bg_style text DEFAULT 'deep-charcoal';
  END IF;
END $$;
