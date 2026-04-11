import { supabase } from "@/integrations/supabase/client";

export async function uploadImage(file: File, folder: string = "menu"): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("restaurant-images")
    .upload(fileName, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage
    .from("restaurant-images")
    .getPublicUrl(fileName);
  return data.publicUrl;
}
