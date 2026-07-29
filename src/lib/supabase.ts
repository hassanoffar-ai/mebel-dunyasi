import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);


// Bu funksiya seçdiyiniz şəkli Supabase 'images' bucket-inə yükləyir və onun ictimai URL linkini qaytarır
export async function uploadImage(file: File): Promise<string> {
  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_');
  const fileName = `${Date.now()}_${cleanName}`;

  try {
    // 1. Try uploading to Supabase Storage 'images' bucket
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        upsert: true,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    } else if (error) {
      console.warn('Supabase Storage Upload Info:', error.message);
    }
  } catch (err) {
    console.warn('Supabase Storage exception:', err);
  }

  // 2. Reliable Fallback: If Supabase Storage Bucket policy blocks unauthenticated uploads, convert file directly to Data URL so admin panel upload is never blocked
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error('Fayl oxuna bilmədi'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Fayl oxunarkən xəta baş verdi'));
    };
    reader.readAsDataURL(file);
  });
}
