/*
  # Fix orders INSERT policy for anonymous users

  The existing "Anyone can insert orders" policy exists but is failing in practice.
  Drop and recreate it cleanly to ensure it applies correctly.
*/

DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;

CREATE POLICY "Anyone can insert order items"
  ON order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
