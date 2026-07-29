import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { table, data, id } = await req.json();

    if (!table || !data) {
      return NextResponse.json({ error: 'Cədvəl və verilənlər tələb olunur' }, { status: 400 });
    }

    const { data: result, error } = await supabaseAdmin
      .from(table)
      .insert(Array.isArray(data) ? data : [data])
      .select();

    if (error) {
      console.error(`Admin CRUD Insert Error in ${table}:`, error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Admin CRUD Exception:', err);
    return NextResponse.json({ error: err.message || 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { table, id, data } = await req.json();

    if (!table || !id || !data) {
      return NextResponse.json({ error: 'Cədvəl, ID və yenilənəcək verilənlər tələb olunur' }, { status: 400 });
    }

    const { data: result, error } = await supabaseAdmin
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Admin CRUD Update Error in ${table}:`, error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Admin CRUD Exception:', err);
    return NextResponse.json({ error: err.message || 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    const id = searchParams.get('id');

    if (!table || !id) {
      return NextResponse.json({ error: 'Cədvəl adı və ID tələb olunur' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Admin CRUD Delete Error in ${table}:`, error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin CRUD Delete Exception:', err);
    return NextResponse.json({ error: err.message || 'Xəta baş verdi' }, { status: 500 });
  }
}
