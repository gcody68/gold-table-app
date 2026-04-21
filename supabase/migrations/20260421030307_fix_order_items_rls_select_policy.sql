/*
  # Fix order_items RLS - add SELECT policy for restaurant owners

  RLS was enabled on order_items but no policies existed, blocking all reads.
  This adds a SELECT policy so authenticated restaurant owners can read
  order items belonging to their restaurant's orders.
*/

CREATE POLICY "Owners can read order items for their restaurant"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE restaurant_id IN (
        SELECT id FROM restaurant_settings
        WHERE owner_id = auth.uid()
      )
    )
    OR (SELECT ((auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean) IS TRUE)
  );
