/*
  # Update RLS Policies for Multi-Tenancy

  ## Summary
  Replaces existing broad/open RLS policies with multi-tenant scoped policies.
  Each restaurant owner can only read and write their own restaurant's data.
  Customers (unauthenticated) can still read menu items and create orders.

  ## Policy Design
  - restaurant_settings: owners manage their own row; public read for menu display
  - menu_items: owners manage their restaurant's items; public can read all items
  - orders: owners read/update their restaurant's orders; anyone can insert (place an order)
  - order_items: follows orders access pattern

  ## Notes
  - All existing open policies are dropped first then replaced with scoped ones
*/

-- ============================================================
-- restaurant_settings
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read settings" ON restaurant_settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON restaurant_settings;
DROP POLICY IF EXISTS "Anyone can insert settings" ON restaurant_settings;
DROP POLICY IF EXISTS "Anyone can delete settings" ON restaurant_settings;

CREATE POLICY "Anyone can read restaurant settings"
  ON restaurant_settings FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert their restaurant"
  ON restaurant_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their restaurant"
  ON restaurant_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their restaurant"
  ON restaurant_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ============================================================
-- menu_items
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can delete menu items" ON menu_items;

CREATE POLICY "Anyone can read menu items"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- orders
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can read their restaurant orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their restaurant orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurant_settings WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- order_items
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can update order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can delete order items" ON order_items;

CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can read order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN restaurant_settings rs ON rs.id = o.restaurant_id
      WHERE rs.owner_id = auth.uid()
    )
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
  )
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN restaurant_settings rs ON rs.id = o.restaurant_id
      WHERE rs.owner_id = auth.uid()
    )
  );
