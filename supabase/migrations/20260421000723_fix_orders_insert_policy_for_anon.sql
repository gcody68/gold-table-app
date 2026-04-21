/*
  # Fix orders INSERT policy to explicitly allow anon and authenticated roles

  The existing "Anyone can insert orders" policy uses the public role which
  may not correctly resolve to anon in Supabase's RLS context. This drops
  and recreates the policy explicitly targeting both anon and authenticated.

  Also fixes order_items INSERT policy the same way.
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
