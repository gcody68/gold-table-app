/*
  # Fix anonymous order placement via SECURITY DEFINER RPC

  ## Problem
  The `orders.restaurant_id` has a FK to `restaurant_settings`. When an anon
  user inserts an order, Postgres tries to validate the FK by looking up the
  restaurant_settings row. RLS on restaurant_settings blocks the anon role from
  reading it, so Postgres throws a "new row violates row-level security" error
  — even though the INSERT policy on orders itself is permissive.

  ## Solution
  1. Create a SECURITY DEFINER function `place_order` that runs as the postgres
     superuser role, bypassing RLS for the FK validation while still enforcing
     business logic (restaurant must exist).
  2. Grant EXECUTE on the function to anon and authenticated.
  3. Keep the existing RLS policies intact.

  ## New Function
  - `place_order(p_restaurant_id, p_customer_name, p_customer_phone,
                  p_customer_email, p_total, p_items)` → order id (uuid)
    Where p_items is a JSONB array of
    { menu_item_id, menu_item_name, price, quantity, special_instructions }
*/

CREATE OR REPLACE FUNCTION place_order(
  p_restaurant_id     uuid,
  p_customer_name     text,
  p_customer_phone    text,
  p_customer_email    text DEFAULT NULL,
  p_total             numeric DEFAULT 0,
  p_items             jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item     jsonb;
BEGIN
  -- Verify the restaurant exists (runs as superuser so no RLS issue)
  IF NOT EXISTS (SELECT 1 FROM restaurant_settings WHERE id = p_restaurant_id) THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  -- Insert the order
  INSERT INTO orders (
    restaurant_id,
    customer_name,
    customer_phone,
    customer_email,
    total,
    status
  ) VALUES (
    p_restaurant_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_total,
    'pending'
  )
  RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      menu_item_id,
      menu_item_name,
      price,
      quantity,
      special_instructions
    ) VALUES (
      v_order_id,
      (v_item->>'menu_item_id')::uuid,
      v_item->>'menu_item_name',
      (v_item->>'price')::numeric,
      (v_item->>'quantity')::integer,
      v_item->>'special_instructions'
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Grant execute to both anon and authenticated
GRANT EXECUTE ON FUNCTION place_order(uuid, text, text, text, numeric, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION place_order(uuid, text, text, text, numeric, jsonb) TO authenticated;
