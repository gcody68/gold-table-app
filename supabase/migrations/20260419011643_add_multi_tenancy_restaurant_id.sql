/*
  # Multi-Tenancy: Add restaurant_id to core tables

  ## Summary
  This migration prepares the app for multi-tenancy by linking all data to a specific
  restaurant. Each restaurant is identified by the Supabase auth user who owns it.

  ## Changes

  ### 1. restaurant_settings
  - Add `owner_id` (uuid) — references auth.users, identifies which auth user owns this restaurant
  - Add `subdomain` (text, unique) — the user's preferred subdomain slug (e.g. "joes-diner")
  - Add `custom_domain` (text, unique, nullable) — optional custom domain (e.g. "menu.joesdiner.com")

  ### 2. menu_items
  - Add `restaurant_id` (uuid) — foreign key to restaurant_settings.id

  ### 3. orders
  - Add `restaurant_id` (uuid) — foreign key to restaurant_settings.id

  ### 4. order_items
  - No direct restaurant_id needed (inherits via orders.restaurant_id)

  ## Security
  - RLS is already enabled on all tables; policies are updated in the next migration
  - Existing rows get restaurant_id set from the first restaurant_settings row (for backwards compat)

  ## Notes
  - Subdomain uniqueness is enforced at DB level
  - Custom domain is nullable (optional feature)
  - owner_id is set from auth.uid() on insert going forward
*/

-- 1. Add owner_id, subdomain, custom_domain to restaurant_settings
ALTER TABLE restaurant_settings
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS subdomain text,
  ADD COLUMN IF NOT EXISTS custom_domain text;

-- Unique constraints on subdomain and custom_domain
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'restaurant_settings_subdomain_key'
  ) THEN
    ALTER TABLE restaurant_settings ADD CONSTRAINT restaurant_settings_subdomain_key UNIQUE (subdomain);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'restaurant_settings_custom_domain_key'
  ) THEN
    ALTER TABLE restaurant_settings ADD CONSTRAINT restaurant_settings_custom_domain_key UNIQUE (custom_domain);
  END IF;
END $$;

-- 2. Add restaurant_id to menu_items
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES restaurant_settings(id) ON DELETE CASCADE;

-- 3. Add restaurant_id to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES restaurant_settings(id) ON DELETE CASCADE;

-- 4. Backfill existing rows with the first restaurant_settings row (single-tenant compat)
DO $$
DECLARE
  first_restaurant_id uuid;
BEGIN
  SELECT id INTO first_restaurant_id FROM restaurant_settings LIMIT 1;
  IF first_restaurant_id IS NOT NULL THEN
    UPDATE menu_items SET restaurant_id = first_restaurant_id WHERE restaurant_id IS NULL;
    UPDATE orders SET restaurant_id = first_restaurant_id WHERE restaurant_id IS NULL;
  END IF;
END $$;

-- 5. Index for fast restaurant-scoped queries
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_owner_id ON restaurant_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_subdomain ON restaurant_settings(subdomain);
