import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, password } = await req.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!fullName?.trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Qeydiyyat məlumatları düzgün deyil.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName.trim(), phone: typeof phone === 'string' ? phone.trim() : '' },
    });
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Qeydiyyat zamanı xəta baş verdi.' }, { status: 400 });
  }
}
