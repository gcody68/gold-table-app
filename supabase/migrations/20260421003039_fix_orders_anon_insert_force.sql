/*
  # Force fix anon INSERT on orders and order_items

  Drop all existing INSERT policies and recreate with explicit (1=1) check
  to ensure they are never ambiguous.
*/

DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;

CREATE POLICY "anon_insert_orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (1=1);

CREATE POLICY "anon_insert_order_items"
  ON order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (1=1);
