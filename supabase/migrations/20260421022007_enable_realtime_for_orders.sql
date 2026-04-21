/*
  # Enable Supabase Realtime for orders table

  The orders table was not added to the supabase_realtime publication,
  so INSERT/UPDATE events were never broadcast to the Kitchen View.
  This migration adds it so the Kitchen Display receives live order
  notifications without requiring a page refresh.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
