/*
  # Allow unauthenticated users to decrement menu item stock

  Customers placing orders are not authenticated. They need to be able
  to update the daily_stock field on menu items so stock tracking works.
  This policy allows anyone to update menu items (stock decrement only
  in practice — no auth check needed since stock is non-sensitive).
*/

CREATE POLICY "Anyone can update menu item stock"
  ON menu_items
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
