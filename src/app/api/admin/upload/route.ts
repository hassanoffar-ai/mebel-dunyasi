import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Yalnız 5 MB-dək JPG, PNG və WEBP şəkillər qəbul olunur.' }, { status: 400 });
    }

    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filePath = `uploads/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabaseAdmin.storage.from('images').upload(filePath, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabaseAdmin.storage.from('images').getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: error?.message || 'Şəkil yüklənə bilmədi.' }, { status: 400 });
  }
}
