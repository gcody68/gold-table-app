
-- Restaurant settings (singleton row)
CREATE TABLE public.restaurant_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'Your Restaurant Name Here',
  business_address TEXT DEFAULT '',
  business_phone TEXT DEFAULT '',
  header_image_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.restaurant_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON public.restaurant_settings FOR UPDATE USING (true);

INSERT INTO public.restaurant_settings (business_name, business_address, business_phone)
VALUES ('Your Restaurant Name Here', '123 Main Street, City', '(555) 123-4567');

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Dish',
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_placeholder BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert menu items" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update menu items" ON public.menu_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete menu items" ON public.menu_items FOR DELETE USING (true);

INSERT INTO public.menu_items (name, description, price, sort_order, is_placeholder) VALUES
  ('Dish #1', 'Add a description', 0, 1, true),
  ('Dish #2', 'Add a description', 0, 2, true),
  ('Dish #3', 'Add a description', 0, 3, true),
  ('Dish #4', 'Add a description', 0, 4, true),
  ('Dish #5', 'Add a description', 0, 5, true),
  ('Dish #6', 'Add a description', 0, 6, true),
  ('Dish #7', 'Add a description', 0, 7, true),
  ('Dish #8', 'Add a description', 0, 8, true),
  ('Dish #9', 'Add a description', 0, 9, true),
  ('Dish #10', 'Add a description', 0, 10, true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_restaurant_settings_updated_at
  BEFORE UPDATE ON public.restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('restaurant-images', 'restaurant-images', true);

CREATE POLICY "Anyone can view restaurant images" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-images');
CREATE POLICY "Anyone can upload restaurant images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'restaurant-images');
CREATE POLICY "Anyone can update restaurant images" ON storage.objects FOR UPDATE USING (bucket_id = 'restaurant-images');
CREATE POLICY "Anyone can delete restaurant images" ON storage.objects FOR DELETE USING (bucket_id = 'restaurant-images');
