import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);


// Bu funksiya seçdiyiniz şəkli Supabase-ə yükləyir və sizə onun internet linkini verir
export async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  try {
    // 1. Upload to Supabase Storage 'images' bucket
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Supabase Storage Upload Error details:', error.message || error);
    }

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        console.log('Successfully uploaded to Supabase Storage images bucket:', publicUrlData.publicUrl);
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase storage upload exception:', err);
  }

  // 2. Reliable Fallback: Convert file directly to Base64 Data URL if Supabase Storage bucket is unconfigured or blocked by RLS
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}
