/*
  # Create upsert_customer_lead RPC function

  Replaces the client-side SELECT + INSERT/UPDATE pattern which fails for
  anonymous users because the SELECT policy on customer_leads requires auth.

  This function runs with SECURITY DEFINER (as the DB owner) so it can
  atomically upsert regardless of the caller's auth state. It uses
  INSERT ... ON CONFLICT to safely handle duplicate phone numbers.
*/

CREATE OR REPLACE FUNCTION upsert_customer_lead(
  p_name  text,
  p_phone text,
  p_email text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO customer_leads (name, phone, email, last_order_date, order_count)
  VALUES (p_name, p_phone, p_email, now(), 1)
  ON CONFLICT (phone) DO UPDATE
    SET name           = EXCLUDED.name,
        email          = COALESCE(EXCLUDED.email, customer_leads.email),
        last_order_date = now(),
        order_count    = COALESCE(customer_leads.order_count, 0) + 1;
END;
$$;

-- Allow anyone (including anonymous) to call this function
GRANT EXECUTE ON FUNCTION upsert_customer_lead(text, text, text) TO anon, authenticated;
