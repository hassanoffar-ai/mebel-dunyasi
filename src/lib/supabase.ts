import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);


// Bu funksiya seçdiyiniz şəkli Supabase 'images' bucket-inə yükləyir və onun ictimai URL linkini qaytarır
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok || !data.url) throw new Error(data.error || 'Şəkil yüklənə bilmədi.');
  return data.url;
}
