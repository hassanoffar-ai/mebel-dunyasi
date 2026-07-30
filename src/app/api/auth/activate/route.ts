import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Düzgün e-poçt ünvanı daxil edin.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === normalizedEmail);
    if (user && !user.email_confirmed_at) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
      if (updateError) throw updateError;
    }

    // Return the same response whether this address exists or not.
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Hesab aktivləşdirilə bilmədi.' }, { status: 400 });
  }
}
