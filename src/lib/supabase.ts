import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);


// Bu funksiya seçdiyiniz şəkli Supabase 'images' bucket-inə yükləyir və onun ictimai URL linkini qaytarır
export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  // Upload to Supabase Storage 'images' bucket
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      contentType: file.type || 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error('Supabase Storage Upload Error:', error);
    throw new Error(`Supabase Storage xətası: ${error.message || 'Şəkil yüklənə bilmədi'}`);
  }

  if (!data) {
    throw new Error('Supabase Storage cavab vermədi');
  }

  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Şəkil üçün Public URL alına bilmədi');
  }

  return publicUrlData.publicUrl;
}
