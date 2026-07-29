import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);


// Bu funksiya seçdiyiniz şəkli Supabase-ə yükləyir və sizə onun internet linkini verir
export async function uploadImage(file: File): Promise<string | null> {
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  try {
    // 1. Try uploading to Supabase Storage 'images' bucket
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, { upsert: true });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase storage upload failed, converting to local Data URL:', err);
  }

  // 2. Reliable Fallback: Convert file directly to Base64 Data URL so desktop upload always works!
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
