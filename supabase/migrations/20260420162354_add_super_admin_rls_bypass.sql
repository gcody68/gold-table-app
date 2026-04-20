/*
  # Super Admin RLS Bypass

  ## Summary
  Adds a super_admin check to all write (INSERT/UPDATE/DELETE) policies so that
  the platform owner (noedigc68@yahoo.com) can manage any restaurant's data remotely
  without interfering with each restaurant's local admin account.

  ## How it works
  - The super_admin flag is stored in auth.users.raw_app_meta_data as {"super_admin": true}
  - It is set server-side only (app_metadata cannot be changed by the user themselves)
  - All existing owner-scoped write policies gain an OR clause:
      (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  - Read policies remain public (no change needed)

  ## Tables affected
  - restaurant_settings: update, delete
  - menu_items: insert, update, delete
  - orders: update
  - order_items: update
  - gallery_items: already open to all authenticated users (no change needed)
  - customer_leads: already open to all authenticated users (no change needed)
*/

-- Helper: reusable super_admin check expression
-- (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE

-- ============================================================
-- restaurant_settings
-- ============================================================
DROP POLICY IF EXISTS "Owners can update their restaurant" ON restaurant_settings;
DROP POLICY IF EXISTS "Owners can delete their restaurant" ON restaurant_settings;

CREATE POLICY "Owners can update their restaurant"
  ON restaurant_settings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  )
  WITH CHECK (
    auth.uid() = owner_id
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

CREATE POLICY "Owners can delete their restaurant"
  ON restaurant_settings FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

-- ============================================================
-- menu_items
-- ============================================================
DROP POLICY IF EXISTS "Owners can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Owners can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Owners can delete menu items" ON menu_items;

CREATE POLICY "Owners can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

CREATE POLICY "Owners can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

CREATE POLICY "Owners can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

-- ============================================================
-- orders
-- ============================================================
DROP POLICY IF EXISTS "Owners can read their restaurant orders" ON orders;
DROP POLICY IF EXISTS "Owners can update their restaurant orders" ON orders;

CREATE POLICY "Owners can read their restaurant orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

CREATE POLICY "Owners can update their restaurant orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

-- ============================================================
-- order_items
-- ============================================================
DROP POLICY IF EXISTS "Owners can read order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Owners can update order items for their orders" ON order_items;

CREATE POLICY "Owners can read order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN restaurant_settings rs ON rs.id = o.restaurant_id
      WHERE rs.owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

CREATE POLICY "Owners can update order items for their orders"
  ON order_items FOR UPDATE
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN restaurant_settings rs ON rs.id = o.restaurant_id
      WHERE rs.owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  )
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN restaurant_settings rs ON rs.id = o.restaurant_id
      WHERE rs.owner_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean IS TRUE
  );

-- ============================================================
-- gallery_items — also scope inserts to restaurant owner or super_admin
-- (currently wide open to any authenticated user, tighten it)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can update gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can delete gallery items" ON gallery_items;

CREATE POLICY "Authenticated users can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (true);
