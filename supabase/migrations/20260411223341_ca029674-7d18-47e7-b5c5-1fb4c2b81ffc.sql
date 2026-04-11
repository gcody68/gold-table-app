
-- Add category column
ALTER TABLE public.menu_items ADD COLUMN category text NOT NULL DEFAULT 'Mains';

-- Remove placeholder items (no longer needed)
DELETE FROM public.menu_items WHERE is_placeholder = true;
