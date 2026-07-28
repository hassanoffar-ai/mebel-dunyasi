import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);


// Bu funksiya seçdiyiniz şəkli Supabase-ə yükləyir və sizə onun internet linkini verir
export async function uploadImage(file: File) {
    const fileName = `${Date.now()}_${file.name}`;

    // 1. Şəkli 'images' qovluğuna yükləyirik
    const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

    if (error) {
        console.error('Yükləmə xətası:', error);
        return null;
    }

    // 2. Şəklin internetdəki linkini alırıq
    const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl; // Məsələn: https://xxxx.supabase.co/storage/v1/object/public/images/123_sofa.jpg
}
