/*
  # Fix customer_leads UPDATE policy for unauthenticated customers

  The existing UPDATE policy requires authentication, but customers placing orders
  are not logged in. This allows anyone to update a customer_lead record (same
  permissiveness as the existing INSERT policy, since this table holds contact info
  voluntarily submitted by customers).
*/

DROP POLICY IF EXISTS "Authenticated users can update customer leads" ON customer_leads;

CREATE POLICY "Anyone can update customer leads"
  ON customer_leads
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
